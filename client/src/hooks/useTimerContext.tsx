import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { useSyncManager } from './useSyncManager';

export type TimerMode = 'tabata' | 'timer' | 'stopwatch';

export interface TabataConfig {
  workTime: number;
  restTime: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
  name?: string; // Nombre opcional para identificar el Tabata
}

export interface TimerConfig {
  minutes: number;
  seconds: number;
}

export interface TimerState {
  // Mode and configs
  mode: TimerMode;
  tabataConfig: TabataConfig;
  timerConfig: TimerConfig;
  
  // Secuencia de Tabatas
  tabataSequence: TabataConfig[];
  currentTabataIndex: number;
  isSequenceMode: boolean;
  
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  stopwatchTime: number;
  
  // Tabata specific state
  currentCycle: number;
  currentSet: number;
  isWorkPhase: boolean;
  isSetRest: boolean;
  isCompleted: boolean;
  
  // UI state
  isFloating: boolean;
  isMinimized: boolean;
}

export interface TimerContextType {
  state: TimerState;
  actions: {
    setMode: (mode: TimerMode) => void;
    updateTabataConfig: (config: TabataConfig) => void;
    updateTimerConfig: (config: TimerConfig) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setFloating: (floating: boolean) => void;
    setMinimized: (minimized: boolean) => void;
    // Nuevas acciones para secuencia de Tabatas
    addTabataToSequence: (config: TabataConfig) => void;
    removeTabataFromSequence: (index: number) => void;
    updateTabataInSequence: (index: number, config: TabataConfig) => void;
    enableSequenceMode: (enabled: boolean) => void;
    clearTabataSequence: () => void;
  };
}

const defaultTabataConfig: TabataConfig = {
  workTime: 20,
  restTime: 10,
  cycles: 8,
  sets: 1,
  restBetweenSets: 60
};

const defaultTimerConfig: TimerConfig = {
  minutes: 5,
  seconds: 0
};

const defaultState: TimerState = {
  mode: 'tabata',
  tabataConfig: defaultTabataConfig,
  timerConfig: defaultTimerConfig,
  // Nuevos campos para secuencia
  tabataSequence: [],
  currentTabataIndex: 0,
  isSequenceMode: false,
  isRunning: false,
  isPaused: false,
  timeLeft: defaultTabataConfig.workTime,
  stopwatchTime: 0,
  currentCycle: 1,
  currentSet: 1,
  isWorkPhase: true,
  isSetRest: false,
  isCompleted: false,
  isFloating: false,
  isMinimized: false
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};

// Función para cargar estado inicial desde localStorage/sync
const loadInitialState = (): TimerState => {
  try {
    // Intentar cargar desde localStorage primero
    const savedMode = localStorage.getItem('timer-mode') as TimerMode | null;
    const savedTabataConfig = localStorage.getItem('timer-tabata-config');
    const savedTimerConfig = localStorage.getItem('timer-timer-config');
    const savedTabataSequence = localStorage.getItem('timer-tabata-sequence');
    const savedSequenceMode = localStorage.getItem('timer-sequence-mode');
    
    return {
      ...defaultState,
      mode: savedMode || defaultState.mode,
      tabataConfig: savedTabataConfig ? JSON.parse(savedTabataConfig) : defaultState.tabataConfig,
      timerConfig: savedTimerConfig ? JSON.parse(savedTimerConfig) : defaultState.timerConfig,
      tabataSequence: savedTabataSequence ? JSON.parse(savedTabataSequence) : defaultState.tabataSequence,
      isSequenceMode: savedSequenceMode ? JSON.parse(savedSequenceMode) : defaultState.isSequenceMode,
    };
  } catch (error) {
    console.warn('Error loading timer state from localStorage:', error);
    return defaultState;
  }
};

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TimerState>(loadInitialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hook de sincronización para configuraciones de timer
  const { status: syncStatus, updateRemoteData, syncData } = useSyncManager();

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuG1/LFdSIHLIHN8+CWQQsVYK7j7qBQEAo+ltryxnkpBSl+zPDajzgIHmW7799iEQs7k+Tw0HIkBSJ1yO3akTELF2Cz5+OWQQsVX7Tl6qBREAp0qe3s4mseEQlPqOLuyFwbDTt7w/DZk2wPE3Km8u8yMRl2rtuzgK5yTjpPPh3TDq7EfGqOmGhOnofr1HkBQU5QJmwFWg8tLrGOT1xLmBJOW11IHgVFMrXsv6OxOgEzNxRqLT3EwCxNWFYXMR3ggotOsK5xJy6kCGYfG7Kw');
  }, []);

  // Efecto de sincronización para cargar datos desde otros dispositivos
  useEffect(() => {
    if (syncStatus.isLinked) {
      const syncTimerData = async () => {
        try {
          const success = await syncData();
          if (success) {
            // Recargar configuraciones desde localStorage después de sincronización
            const savedMode = localStorage.getItem('timer-mode') as TimerMode | null;
            const savedTabataConfig = localStorage.getItem('timer-tabata-config');
            const savedTimerConfig = localStorage.getItem('timer-timer-config');
            const savedTabataSequence = localStorage.getItem('timer-tabata-sequence');
            const savedSequenceMode = localStorage.getItem('timer-sequence-mode');
            
            setState(prevState => {
              let newState = { ...prevState };
              
              // Actualizar modo si cambió
              if (savedMode && savedMode !== prevState.mode) {
                newState.mode = savedMode;
              }
              
              // Actualizar configuración Tabata si cambió
              if (savedTabataConfig) {
                try {
                  const tabataConfig = JSON.parse(savedTabataConfig);
                  newState.tabataConfig = tabataConfig;
                  if (newState.mode === 'tabata' && !newState.isRunning) {
                    newState.timeLeft = tabataConfig.workTime;
                  }
                } catch (error) {
                  console.warn('Error parsing saved tabata config:', error);
                }
              }
              
              // Actualizar configuración Timer si cambió
              if (savedTimerConfig) {
                try {
                  const timerConfig = JSON.parse(savedTimerConfig);
                  newState.timerConfig = timerConfig;
                  if (newState.mode === 'timer' && !newState.isRunning) {
                    newState.timeLeft = timerConfig.minutes * 60 + timerConfig.seconds;
                  }
                } catch (error) {
                  console.warn('Error parsing saved timer config:', error);
                }
              }
              
              // Actualizar secuencia de Tabatas si cambió
              if (savedTabataSequence) {
                try {
                  const tabataSequence = JSON.parse(savedTabataSequence);
                  newState.tabataSequence = tabataSequence;
                } catch (error) {
                  console.warn('Error parsing saved tabata sequence:', error);
                }
              }
              
              // Actualizar modo de secuencia si cambió
              if (savedSequenceMode) {
                try {
                  const sequenceMode = JSON.parse(savedSequenceMode);
                  newState.isSequenceMode = sequenceMode;
                } catch (error) {
                  console.warn('Error parsing saved sequence mode:', error);
                }
              }
              
              return newState;
            });
          }
        } catch (error) {
          console.error('Error syncing timer data:', error);
        }
      };
      
      // Sincronizar cada 30 segundos cuando está vinculado
      const interval = setInterval(syncTimerData, 30000);
      
      // Sincronizar inmediatamente al vincular
      syncTimerData();
      
      return () => clearInterval(interval);
    }
  }, [syncStatus.isLinked, syncData]);

  // Main timer effect
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setTimeout(() => {
        setState(prevState => {
          if (prevState.mode === 'stopwatch') {
            return {
              ...prevState,
              stopwatchTime: prevState.stopwatchTime + 1
            };
          } else if (prevState.mode === 'timer') {
            if (prevState.timeLeft > 0) {
              return {
                ...prevState,
                timeLeft: prevState.timeLeft - 1
              };
            } else {
              // Timer finished
              playNotification();
              return {
                ...prevState,
                isRunning: false,
                isCompleted: true
              };
            }
          } else if (prevState.mode === 'tabata') {
            if (prevState.timeLeft > 0) {
              return {
                ...prevState,
                timeLeft: prevState.timeLeft - 1
              };
            } else {
              // Handle phase change for Tabata
              return handleTabataPhaseChange(prevState);
            }
          }
          return prevState;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, state.timeLeft, state.stopwatchTime, state.mode]);

  const handleTabataPhaseChange = (prevState: TimerState): TimerState => {
    playNotification();
    
    if (prevState.isSetRest) {
      // End of set rest, start new set
      if (prevState.currentSet < prevState.tabataConfig.sets) {
        return {
          ...prevState,
          currentSet: prevState.currentSet + 1,
          currentCycle: 1,
          isWorkPhase: true,
          isSetRest: false,
          timeLeft: prevState.tabataConfig.workTime
        };
      } else {
        // All sets completed, check if we should advance to next Tabata in sequence
        return handleTabataCompletion(prevState);
      }
    } else if (prevState.isWorkPhase) {
      // End of work phase, start rest
      return {
        ...prevState,
        isWorkPhase: false,
        timeLeft: prevState.tabataConfig.restTime
      };
    } else {
      // End of rest phase
      if (prevState.currentCycle < prevState.tabataConfig.cycles) {
        // Start next cycle
        return {
          ...prevState,
          currentCycle: prevState.currentCycle + 1,
          isWorkPhase: true,
          timeLeft: prevState.tabataConfig.workTime
        };
      } else {
        // End of cycles in this set
        if (prevState.currentSet < prevState.tabataConfig.sets) {
          // Start rest between sets
          return {
            ...prevState,
            isSetRest: true,
            timeLeft: prevState.tabataConfig.restBetweenSets
          };
        } else {
          // All sets completed, check if we should advance to next Tabata in sequence
          return handleTabataCompletion(prevState);
        }
      }
    }
  };

  const handleTabataCompletion = (prevState: TimerState): TimerState => {
    // Si está en modo secuencia y hay más Tabatas
    if (prevState.isSequenceMode && prevState.tabataSequence.length > 0) {
      const nextIndex = prevState.currentTabataIndex + 1;
      
      if (nextIndex < prevState.tabataSequence.length) {
        // Avanzar al siguiente Tabata de la secuencia
        const nextTabataConfig = prevState.tabataSequence[nextIndex];
        return {
          ...prevState,
          currentTabataIndex: nextIndex,
          tabataConfig: nextTabataConfig,
          currentCycle: 1,
          currentSet: 1,
          isWorkPhase: true,
          isSetRest: false,
          timeLeft: nextTabataConfig.workTime,
          // Mantener el timer corriendo
          isRunning: true,
          isCompleted: false
        };
      }
    }
    
    // Si no hay más Tabatas en la secuencia o no está en modo secuencia
    return {
      ...prevState,
      isRunning: false,
      isCompleted: true
    };
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const setMode = (mode: TimerMode) => {
    setState(prevState => {
      let newState = {
        ...prevState,
        mode,
        isRunning: false,
        isPaused: false,
        isCompleted: false,
        currentCycle: 1,
        currentSet: 1,
        isWorkPhase: true,
        isSetRest: false
      };

      if (mode === 'tabata') {
        newState.timeLeft = prevState.tabataConfig.workTime;
      } else if (mode === 'timer') {
        newState.timeLeft = prevState.timerConfig.minutes * 60 + prevState.timerConfig.seconds;
      } else if (mode === 'stopwatch') {
        newState.stopwatchTime = 0;
      }

      // Guardar en localStorage y sincronizar si está vinculado
      localStorage.setItem('timer-mode', mode);
      if (syncStatus.isLinked) {
        updateRemoteData({ timerMode: mode });
      }

      return newState;
    });
  };

  const updateTabataConfig = (config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataConfig: config,
      timeLeft: prevState.mode === 'tabata' ? config.workTime : prevState.timeLeft
    }));
    
    // Guardar en localStorage y sincronizar si está vinculado
    localStorage.setItem('timer-tabata-config', JSON.stringify(config));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataConfig: config });
    }
  };

  const updateTimerConfig = (config: TimerConfig) => {
    setState(prevState => ({
      ...prevState,
      timerConfig: config,
      timeLeft: prevState.mode === 'timer' ? config.minutes * 60 + config.seconds : prevState.timeLeft
    }));
    
    // Guardar en localStorage y sincronizar si está vinculado
    localStorage.setItem('timer-timer-config', JSON.stringify(config));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTimerConfig: config });
    }
  };

  const startTimer = () => {
    setState(prevState => ({
      ...prevState,
      isRunning: true,
      isPaused: false,
      isFloating: true
    }));
  };

  const pauseTimer = () => {
    setState(prevState => ({
      ...prevState,
      isRunning: false,
      isPaused: true
    }));
  };

  const resetTimer = () => {
    setState(prevState => {
      let newState = {
        ...prevState,
        isRunning: false,
        isPaused: false,
        isCompleted: false,
        currentCycle: 1,
        currentSet: 1,
        isWorkPhase: true,
        isSetRest: false,
        isFloating: false,
        isMinimized: false,
        // Resetear índice de secuencia al inicio
        currentTabataIndex: 0
      };

      if (prevState.mode === 'tabata') {
        // Si está en modo secuencia, usar el primer Tabata
        if (prevState.isSequenceMode && prevState.tabataSequence.length > 0) {
          const firstTabata = prevState.tabataSequence[0];
          newState.tabataConfig = firstTabata;
          newState.timeLeft = firstTabata.workTime;
        } else {
          newState.timeLeft = prevState.tabataConfig.workTime;
        }
      } else if (prevState.mode === 'timer') {
        newState.timeLeft = prevState.timerConfig.minutes * 60 + prevState.timerConfig.seconds;
      } else if (prevState.mode === 'stopwatch') {
        newState.stopwatchTime = 0;
      }

      return newState;
    });
  };

  const setFloating = (floating: boolean) => {
    setState(prevState => ({
      ...prevState,
      isFloating: floating
    }));
  };

  const setMinimized = (minimized: boolean) => {
    setState(prevState => ({
      ...prevState,
      isMinimized: minimized
    }));
  };

  // Funciones para manejar secuencia de Tabatas
  const addTabataToSequence = (config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: [...prevState.tabataSequence, config]
    }));
    
    // Guardar secuencia en localStorage y sincronizar
    const newSequence = [...state.tabataSequence, config];
    localStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const removeTabataFromSequence = (index: number) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: prevState.tabataSequence.filter((_, i) => i !== index),
      // Ajustar índice actual si es necesario
      currentTabataIndex: prevState.currentTabataIndex >= index && prevState.currentTabataIndex > 0 
        ? prevState.currentTabataIndex - 1 
        : prevState.currentTabataIndex
    }));
    
    // Guardar secuencia en localStorage y sincronizar
    const newSequence = state.tabataSequence.filter((_, i) => i !== index);
    localStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const updateTabataInSequence = (index: number, config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: prevState.tabataSequence.map((item, i) => i === index ? config : item)
    }));
    
    // Guardar secuencia en localStorage y sincronizar
    const newSequence = state.tabataSequence.map((item, i) => i === index ? config : item);
    localStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const enableSequenceMode = (enabled: boolean) => {
    setState(prevState => ({
      ...prevState,
      isSequenceMode: enabled,
      currentTabataIndex: enabled ? 0 : prevState.currentTabataIndex
    }));
    
    // Guardar en localStorage y sincronizar
    localStorage.setItem('timer-sequence-mode', enabled.toString());
    if (syncStatus.isLinked) {
      updateRemoteData({ timerSequenceMode: enabled });
    }
  };

  const clearTabataSequence = () => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: [],
      currentTabataIndex: 0,
      isSequenceMode: false
    }));
    
    // Limpiar localStorage y sincronizar
    localStorage.removeItem('timer-tabata-sequence');
    localStorage.removeItem('timer-sequence-mode');
    if (syncStatus.isLinked) {
      updateRemoteData({ 
        timerTabataSequence: [],
        timerSequenceMode: false 
      });
    }
  };

  const value: TimerContextType = {
    state,
    actions: {
      setMode,
      updateTabataConfig,
      updateTimerConfig,
      startTimer,
      pauseTimer,
      resetTimer,
      setFloating,
      setMinimized,
      addTabataToSequence,
      removeTabataFromSequence,
      updateTabataInSequence,
      enableSequenceMode,
      clearTabataSequence
    }
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};