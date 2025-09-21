import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BaseTemplate {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  isDefault?: boolean; // Para diferenciar entre templates predefinidos y personalizados
}

export interface WorkoutTemplate extends BaseTemplate {
  type: 'workout';
  category: 'upper' | 'lower' | 'full' | 'cardio' | 'flexibility' | 'custom';
  exercises: Array<{
    name: string;
    type: 'strength' | 'cardio' | 'flexibility' | 'core';
    duration?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    distance?: number;
  }>;
}

export interface TrainingTemplate extends BaseTemplate {
  type: 'training';
  sport: string;
  category: 'technique' | 'sparring' | 'competition' | 'conditioning' | 'custom';
  drills: Array<{
    name: string;
    type: 'technique' | 'sparring' | 'conditioning' | 'tactical';
    duration: number;
    intensity: 1 | 2 | 3 | 4 | 5;
    description: string;
  }>;
}

export type CustomTemplate = WorkoutTemplate | TrainingTemplate;

interface UseCustomTemplatesOptions<T extends CustomTemplate> {
  storageKey: string;
  templateType: 'workout' | 'training';
  defaultTemplates?: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>[];
}

export function useCustomTemplates<T extends CustomTemplate>(options: UseCustomTemplatesOptions<T>) {
  const [templates, setTemplates] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from storage
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(options.storageKey);
      let loadedTemplates: T[] = [];
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          loadedTemplates = parsed;
        }
      }

      // Add default templates if they don't exist
      if (options.defaultTemplates && loadedTemplates.length === 0) {
        const defaultTemplates: T[] = options.defaultTemplates.map((template, index) => ({
          ...template,
          id: `default-${index}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true,
        } as T));

        loadedTemplates = defaultTemplates;
        await AsyncStorage.setItem(options.storageKey, JSON.stringify(defaultTemplates));
      }

      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save templates to storage
  const saveTemplates = async (newTemplates: T[]) => {
    try {
      await AsyncStorage.setItem(options.storageKey, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving custom templates:', error);
    }
  };

  // Create new template
  const createTemplate = async (templateData: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>) => {
    const newTemplate: T = {
      ...templateData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false,
    } as T;

    const updatedTemplates = [...templates, newTemplate];
    await saveTemplates(updatedTemplates);
    return newTemplate;
  };

  // Update existing template
  const updateTemplate = async (id: string, updates: Partial<Omit<T, 'id' | 'createdAt' | 'isDefault'>>) => {
    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      throw new Error('Template not found');
    }

    const template = templates[templateIndex];
    
    // No permitir editar templates predefinidos/default
    if (template.isDefault) {
      throw new Error('No se pueden editar los templates predefinidos');
    }

    const updatedTemplate: T = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates];
    updatedTemplates[templateIndex] = updatedTemplate;
    await saveTemplates(updatedTemplates);
    return updatedTemplate;
  };

  // Delete template
  const deleteTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }

    // No permitir eliminar templates predefinidos/default
    if (template.isDefault) {
      throw new Error('No se pueden eliminar los templates predefinidos');
    }

    const updatedTemplates = templates.filter(t => t.id !== id);
    await saveTemplates(updatedTemplates);
  };

  // Get templates by category (for workout templates)
  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => {
      if (template.type === 'workout') {
        return (template as WorkoutTemplate).category === category;
      }
      return false;
    });
  };

  // Get templates by sport (for training templates)
  const getTemplatesBySport = (sport: string) => {
    return templates.filter(template => {
      if (template.type === 'training') {
        return (template as TrainingTemplate).sport === sport;
      }
      return false;
    });
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    getTemplatesBySport,
    refreshTemplates: loadTemplates,
  };
}