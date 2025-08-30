import { useState, useEffect } from 'react';
import { 
  MoodTheme, 
  MOOD_THEMES, 
  applyTheme, 
  getCurrentTheme, 
  suggestTheme, 
  resetToDefaultTheme, 
  getThemeHistory,
  getThemeStats 
} from '@/lib/moodThemes';

export const useMoodTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(MOOD_THEMES[2]); // Default: neutral
  const [isThemeApplied, setIsThemeApplied] = useState(false);

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = getCurrentTheme();
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
      setIsThemeApplied(true);
    } else {
      // Aplicar tema por defecto si no hay uno guardado
      applyTheme(MOOD_THEMES[2]);
      setIsThemeApplied(true);
    }
  }, []);

  // Función para cambiar tema manualmente
  const changeTheme = (theme: MoodTheme, userMood?: number) => {
    setCurrentTheme(theme);
    applyTheme(theme, userMood);
    setIsThemeApplied(true);
  };

  // Función para sugerir y aplicar tema basado en estado de ánimo
  const suggestAndApplyTheme = (
    moodLevel: number, 
    energyLevel?: number, 
    stressLevel?: number,
    autoApply: boolean = false
  ) => {
    const suggestedTheme = suggestTheme(moodLevel, energyLevel, stressLevel);
    
    if (autoApply) {
      changeTheme(suggestedTheme, moodLevel);
    }
    
    return suggestedTheme;
  };

  // Función para resetear al tema por defecto
  const resetTheme = () => {
    const defaultTheme = MOOD_THEMES[2];
    setCurrentTheme(defaultTheme);
    resetToDefaultTheme();
    setIsThemeApplied(true);
  };

  // Función para obtener todos los temas disponibles
  const getAllThemes = () => MOOD_THEMES;

  // Función para obtener tema por ID
  const getThemeById = (id: string) => {
    return MOOD_THEMES.find(theme => theme.id === id) || MOOD_THEMES[2];
  };

  // Función para obtener historial de temas
  const getHistory = () => getThemeHistory();

  // Función para obtener estadísticas de uso
  const getStats = () => getThemeStats();

  return {
    currentTheme,
    isThemeApplied,
    changeTheme,
    suggestAndApplyTheme,
    resetTheme,
    getAllThemes,
    getThemeById,
    getHistory,
    getStats,
    availableThemes: MOOD_THEMES
  };
};