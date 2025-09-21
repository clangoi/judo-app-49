import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, IconButton, FAB, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomTemplate, WorkoutTemplate, TrainingTemplate } from '../hooks/useCustomTemplates';

interface CustomTemplateManagerProps {
  templates: CustomTemplate[];
  templateType: 'workout' | 'training';
  visible: boolean;
  onClose: () => void;
  onCreateTemplate: (template: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>) => Promise<CustomTemplate>;
  onUpdateTemplate: (id: string, updates: Partial<CustomTemplate>) => Promise<CustomTemplate>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

const CustomTemplateManager: React.FC<CustomTemplateManagerProps> = ({
  templates,
  templateType,
  visible,
  onClose,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<CustomTemplate>>({
    name: '',
    description: '',
    type: templateType,
  });

  // Separate custom templates from default ones
  const customTemplates = templates.filter(t => !t.isDefault);
  const defaultTemplates = templates.filter(t => t.isDefault);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: templateType,
    });
    setSelectedTemplate(null);
    setEditMode(false);
  };

  const openNewTemplateForm = () => {
    resetForm();
    setFormVisible(true);
  };

  const openEditTemplateForm = (template: CustomTemplate) => {
    setFormData(template);
    setSelectedTemplate(template);
    setEditMode(true);
    setFormVisible(true);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'El nombre del template es requerido');
      return;
    }

    try {
      if (editMode && selectedTemplate) {
        await onUpdateTemplate(selectedTemplate.id, formData);
        Alert.alert('¡Éxito!', 'Template actualizado correctamente');
      } else {
        // Add default structure based on template type
        let templateData = { ...formData };
        
        if (templateType === 'workout') {
          templateData = {
            ...templateData,
            type: 'workout',
            category: 'custom',
            exercises: [],
          } as Partial<WorkoutTemplate>;
        } else {
          templateData = {
            ...templateData,
            type: 'training',
            sport: 'general',
            category: 'custom',
            drills: [],
          } as Partial<TrainingTemplate>;
        }

        await onCreateTemplate(templateData as Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>);
        Alert.alert('¡Éxito!', 'Template creado correctamente');
      }
      
      setFormVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar el template');
    }
  };

  const handleDeleteTemplate = async (template: CustomTemplate) => {
    if (template.isDefault) {
      Alert.alert('Error', 'No se pueden eliminar los templates predefinidos');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el template "${template.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteTemplate(template.id);
              Alert.alert('¡Éxito!', 'Template eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Error al eliminar el template');
            }
          }
        }
      ]
    );
  };

  const renderTemplateCard = (template: CustomTemplate) => (
    <Card key={template.id} style={styles.templateCard}>
      <Card.Content>
        <View style={styles.templateHeader}>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            {template.description && (
              <Text style={styles.templateDescription}>{template.description}</Text>
            )}
            <View style={styles.templateMeta}>
              {template.isDefault ? (
                <Chip mode="outlined" compact icon="star" style={styles.chip}>
                  Predefinido
                </Chip>
              ) : (
                <Chip mode="outlined" compact icon="account" style={styles.chip}>
                  Personalizado
                </Chip>
              )}
            </View>
          </View>
          
          {!template.isDefault && (
            <View style={styles.templateActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openEditTemplateForm(template)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteTemplate(template)}
              />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Gestionar Templates</Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogContent}>
          <ScrollView>
            {/* Default Templates Section */}
            {defaultTemplates.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Templates Predefinidos</Text>
                {defaultTemplates.map(renderTemplateCard)}
              </View>
            )}

            {/* Custom Templates Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Templates Personalizados</Text>
                <Button 
                  mode="contained" 
                  icon="plus"
                  onPress={openNewTemplateForm}
                  style={styles.addButton}
                >
                  Nuevo
                </Button>
              </View>
              
              {customTemplates.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Text style={styles.emptyText}>
                      No tienes templates personalizados aún.{'\n'}
                      Crea uno nuevo para empezar.
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                customTemplates.map(renderTemplateCard)
              )}
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        
        <Dialog.Actions>
          <Button onPress={onClose}>Cerrar</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Form Dialog */}
      <Dialog visible={formVisible} onDismiss={() => setFormVisible(false)} style={styles.dialog}>
        <Dialog.Title>
          {editMode ? 'Editar Template' : 'Nuevo Template'}
        </Dialog.Title>
        
        <Dialog.Content>
          <TextInput
            label="Nombre del Template"
            value={formData.name || ''}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            data-testid="input-template-name"
          />
          
          <TextInput
            label="Descripción (opcional)"
            value={formData.description || ''}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
            style={styles.input}
            data-testid="input-template-description"
          />
          
          <Text style={styles.note}>
            Nota: Después de crear el template, podrás agregar ejercicios o drills específicos.
          </Text>
        </Dialog.Content>
        
        <Dialog.Actions>
          <Button onPress={() => setFormVisible(false)}>Cancelar</Button>
          <Button 
            mode="contained" 
            onPress={handleSaveTemplate}
            data-testid="button-save-template"
          >
            {editMode ? 'Actualizar' : 'Crear'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 10,
  },
  addButton: {
    marginLeft: 10,
  },
  templateCard: {
    marginBottom: 10,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  templateInfo: {
    flex: 1,
    marginRight: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  templateActions: {
    flexDirection: 'row',
  },
  emptyCard: {
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  input: {
    marginBottom: 15,
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CustomTemplateManager;