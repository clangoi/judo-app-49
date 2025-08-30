// Temas de color basados en estado de ánimo
export interface MoodTheme {
  id: string;
  name: string;
  description: string;
  mood: number; // 1-5 donde 1 = muy triste, 5 = muy feliz
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    card: string;
    border: string;
  };
  gradient: {
    from: string;
    to: string;
  };
}

export const MOOD_THEMES: MoodTheme[] = [
  {
    id: 'sad',
    name: 'Calma Azul',
    description: 'Tonos suaves y calmantes para días difíciles',
    mood: 1,
    colors: {
      primary: '220 70% 60%', // Azul suave
      secondary: '210 40% 70%',
      background: '220 20% 97%',
      foreground: '220 20% 15%',
      muted: '220 15% 85%',
      accent: '200 80% 85%',
      card: '0 0% 100%',
      border: '220 30% 80%',
    },
    gradient: {
      from: 'from-blue-100',
      to: 'to-sky-50'
    }
  },
  {
    id: 'low',
    name: 'Serenidad Verde',
    description: 'Verde relajante para recuperar energía',
    mood: 2,
    colors: {
      primary: '150 60% 55%', // Verde jade
      secondary: '140 40% 65%',
      background: '150 25% 97%',
      foreground: '150 15% 20%',
      muted: '150 20% 85%',
      accent: '120 50% 85%',
      card: '0 0% 100%',
      border: '150 25% 75%',
    },
    gradient: {
      from: 'from-green-100',
      to: 'to-emerald-50'
    }
  },
  {
    id: 'neutral',
    name: 'Equilibrio Natural',
    description: 'Colores balanceados para un día normal',
    mood: 3,
    colors: {
      primary: '25 95% 53%', // Naranja amigable (actual)
      secondary: '200 20% 50%',
      background: '36 100% 98%',
      foreground: '220 13% 18%',
      muted: '36 100% 96%',
      accent: '36 100% 88%',
      card: '0 0% 100%',
      border: '36 77% 75%',
    },
    gradient: {
      from: 'from-orange-100',
      to: 'to-yellow-50'
    }
  },
  {
    id: 'good',
    name: 'Energía Coral',
    description: 'Tonos cálidos y energizantes',
    mood: 4,
    colors: {
      primary: '10 80% 60%', // Coral energético
      secondary: '350 70% 70%',
      background: '10 50% 97%',
      foreground: '10 20% 15%',
      muted: '10 30% 90%',
      accent: '340 60% 85%',
      card: '0 0% 100%',
      border: '10 40% 80%',
    },
    gradient: {
      from: 'from-coral-100',
      to: 'to-pink-50'
    }
  },
  {
    id: 'happy',
    name: 'Alegría Dorada',
    description: 'Amarillos brillantes para días felices',
    mood: 5,
    colors: {
      primary: '45 90% 55%', // Amarillo dorado
      secondary: '35 80% 65%',
      background: '45 60% 97%',
      foreground: '45 15% 15%',
      muted: '45 40% 90%',
      accent: '50 80% 85%',
      card: '0 0% 100%',
      border: '45 50% 75%',
    },
    gradient: {
      from: 'from-yellow-100',
      to: 'to-amber-50'
    }
  }
];

// Función para obtener el tema basado en el estado de ánimo
export function getMoodTheme(moodLevel: number): MoodTheme {
  // Encuentra el tema más cercano al nivel de ánimo
  return MOOD_THEMES.find(theme => theme.mood === moodLevel) || MOOD_THEMES[2]; // Default: neutral
}

// Función para sugerir tema basado en múltiples factores
export function suggestTheme(moodLevel: number, energyLevel?: number, stressLevel?: number): MoodTheme {
  let adjustedMood = moodLevel;
  
  // Ajustar según energía (si está disponible)
  if (energyLevel !== undefined) {
    if (energyLevel <= 2 && moodLevel > 3) {
      adjustedMood = Math.max(adjustedMood - 1, 1);
    } else if (energyLevel >= 4 && moodLevel < 4) {
      adjustedMood = Math.min(adjustedMood + 1, 5);
    }
  }
  
  // Ajustar según estrés (si está disponible)
  if (stressLevel !== undefined) {
    if (stressLevel >= 4) {
      adjustedMood = Math.max(adjustedMood - 1, 1); // Tema más calmante si hay mucho estrés
    }
  }
  
  return getMoodTheme(Math.round(adjustedMood));
}

// Constantes para localStorage
const STORAGE_KEY = 'currentMoodTheme';
const HISTORY_KEY = 'moodThemeHistory';

// Función para aplicar un tema al CSS del documento
export function applyTheme(theme: MoodTheme, userMood?: number) {
  const root = document.documentElement;
  
  // Aplicar variables CSS
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--card', theme.colors.card);
  root.style.setProperty('--border', theme.colors.border);
  
  // Guardar tema actual con información adicional
  saveTheme(theme, userMood);
}

// Función para guardar tema en localStorage con información adicional
export function saveTheme(theme: MoodTheme, userMood?: number, timestamp?: number): void {
  try {
    const themeData = {
      theme,
      userMood,
      timestamp: timestamp || Date.now(),
      autoApplied: !!userMood
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themeData));
    
    // Guardar en historial
    const history = getThemeHistory();
    const newHistory = [...history.slice(-9), themeData]; // Mantener solo los últimos 10
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn('No se pudo guardar el tema en localStorage:', error);
  }
}

// Función para cargar tema desde localStorage
export function loadTheme(): MoodTheme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return data.theme || data; // Compatibilidad con formato anterior
    }
    return null;
  } catch (error) {
    console.warn('No se pudo cargar el tema desde localStorage:', error);
    return null;
  }
}

// Función para obtener el tema actual del localStorage
export function getCurrentTheme(): MoodTheme | null {
  return loadTheme();
}

// Función para obtener historial de temas
export function getThemeHistory(): Array<{theme: MoodTheme, userMood?: number, timestamp: number, autoApplied: boolean}> {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.warn('No se pudo cargar el historial de temas:', error);
    return [];
  }
}

// Función para obtener estadísticas de uso de temas
export function getThemeStats() {
  const history = getThemeHistory();
  const stats = {
    totalChanges: history.length,
    mostUsedTheme: '',
    autoAppliedCount: history.filter(h => h.autoApplied).length,
    manualCount: history.filter(h => !h.autoApplied).length,
    themeFrequency: {} as Record<string, number>
  };

  history.forEach(entry => {
    const themeName = entry.theme.name;
    stats.themeFrequency[themeName] = (stats.themeFrequency[themeName] || 0) + 1;
  });

  if (Object.keys(stats.themeFrequency).length > 0) {
    stats.mostUsedTheme = Object.keys(stats.themeFrequency).reduce((a, b) => 
      stats.themeFrequency[a] > stats.themeFrequency[b] ? a : b
    );
  }

  return stats;
}

// Función para resetear al tema por defecto
export function resetToDefaultTheme() {
  applyTheme(MOOD_THEMES[2]); // neutral theme
}

// Función para limpiar historial de temas
export function clearThemeHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar el historial de temas:', error);
  }
}