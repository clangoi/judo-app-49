import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useSyncManager } from './useSyncManager';

export type TimerMode = 'tabata' | 'timer' | 'stopwatch';

export interface TabataConfig {
  workTime: number;
  restTime: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
  name?: string;
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


// Función para cargar estado inicial desde AsyncStorage/sync
const loadInitialState = async (): Promise<TimerState> => {
  try {
    const savedMode = await AsyncStorage.getItem('timer-mode') as TimerMode | null;
    const savedTabataConfig = await AsyncStorage.getItem('timer-tabata-config');
    const savedTimerConfig = await AsyncStorage.getItem('timer-timer-config');
    const savedTabataSequence = await AsyncStorage.getItem('timer-tabata-sequence');
    const savedSequenceMode = await AsyncStorage.getItem('timer-sequence-mode');
    
    return {
      ...defaultState,
      mode: savedMode || defaultState.mode,
      tabataConfig: savedTabataConfig ? JSON.parse(savedTabataConfig) : defaultState.tabataConfig,
      timerConfig: savedTimerConfig ? JSON.parse(savedTimerConfig) : defaultState.timerConfig,
      tabataSequence: savedTabataSequence ? JSON.parse(savedTabataSequence) : defaultState.tabataSequence,
      isSequenceMode: savedSequenceMode ? JSON.parse(savedSequenceMode) : defaultState.isSequenceMode,
    };
  } catch (error) {
    console.warn('Error loading timer state from AsyncStorage:', error);
    return defaultState;
  }
};

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TimerState>(defaultState);
  const intervalRef = useRef<number | null>(null);
  const { syncStatus, updateRemoteData, triggerSync } = useSyncManager();

  // Configurar audio y cargar estado inicial
  useEffect(() => {
    const initializeApp = async () => {
      // Configurar audio para sonidos multimedia
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
      
      // Cargar estado inicial
      const initialState = await loadInitialState();
      setState(initialState);
    };
    
    initializeApp();
  }, []);

  // Función simple para reproducir beep como sonido multimedia
  const playBeep = async () => {
    try {
      // Crear un beep simple con un sonido breve de sistema
      const { sound } = await Audio.Sound.createAsync(
        // Usar un blob de audio simple que funciona multiplataforma
        { 
          uri: 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAG1wM1BSRUBUSRP/' 
        },
        { 
          shouldPlay: true, 
          volume: 0.7,
          isLooping: false
        }
      );
      
      // Limpiar el sonido después de un breve tiempo
      setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (e) {
          // Ignorar errores de limpieza
        }
      }, 800);
      
    } catch (error) {
      // Fallback: Log visible para verificar que funciona
      console.log('🔊 BEEP MULTIMEDIA - Últimos 3 segundos (audio no disponible en simulador)');
    }
  };

  // Detectar últimos 3 segundos para reproducir beep
  useEffect(() => {
    if (state.isRunning && 
        (state.mode === 'timer' || state.mode === 'tabata') && 
        state.timeLeft <= 3 && state.timeLeft > 0) {
      playBeep();
    }
  }, [state.timeLeft, state.isRunning, state.mode]);

  // Efecto de sincronización para cargar datos desde otros dispositivos
  useEffect(() => {
    if (syncStatus.isLinked) {
      const syncTimerData = async () => {
        try {
          const success = await triggerSync();
          if (success) {
            const newState = await loadInitialState();
            setState(newState);
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
  }, [syncStatus.isLinked, triggerSync]);

  // Main timer effect
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      // ✅ Aquí setTimeout devuelve un number en web
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
              return handleTabataPhaseChange(prevState);
            }
          }
          return prevState;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current); // ✅ clearTimeout acepta number en web
      }
    };
  }, [state.isRunning, state.isPaused, state.timeLeft, state.stopwatchTime, state.mode]);

  const handleTabataPhaseChange = (prevState: TimerState): TimerState => {
    
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
        // Avanzar al siguiente Tabata de la secuencia
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


  // Timer control functions
  const setMode = async (mode: TimerMode) => {
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
        isSetRest: false,
        currentTabataIndex: 0
      };

      if (mode === 'tabata') {
        if (prevState.isSequenceMode && prevState.tabataSequence.length > 0) {
          const firstTabata = prevState.tabataSequence[0];
          newState.tabataConfig = firstTabata;
          newState.timeLeft = firstTabata.workTime;
        } else {
          newState.timeLeft = prevState.tabataConfig.workTime;
        }
      } else if (mode === 'timer') {
        newState.timeLeft = prevState.timerConfig.minutes * 60 + prevState.timerConfig.seconds;
      } else if (mode === 'stopwatch') {
        newState.stopwatchTime = 0;
      }

      return newState;
    });

    // Guardar en AsyncStorage y sincronizar
    await AsyncStorage.setItem('timer-mode', mode);
    if (syncStatus.isLinked) {
      updateRemoteData({ timerMode: mode });
    }
  };

  const updateTabataConfig = async (config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataConfig: config,
      timeLeft: prevState.mode === 'tabata' ? config.workTime : prevState.timeLeft
    }));
    
    // Guardar en AsyncStorage y sincronizar
    await AsyncStorage.setItem('timer-tabata-config', JSON.stringify(config));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataConfig: config });
    }
  };

  const updateTimerConfig = async (config: TimerConfig) => {
    setState(prevState => ({
      ...prevState,
      timerConfig: config,
      timeLeft: prevState.mode === 'timer' ? config.minutes * 60 + config.seconds : prevState.timeLeft
    }));
    
    // Guardar en AsyncStorage y sincronizar
    await AsyncStorage.setItem('timer-timer-config', JSON.stringify(config));
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
  const addTabataToSequence = async (config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: [...prevState.tabataSequence, config]
    }));
    
    // Guardar secuencia en AsyncStorage y sincronizar
    const newSequence = [...state.tabataSequence, config];
    await AsyncStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const removeTabataFromSequence = async (index: number) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: prevState.tabataSequence.filter((_, i) => i !== index),
      // Ajustar índice actual si es necesario
      currentTabataIndex: prevState.currentTabataIndex >= index && prevState.currentTabataIndex > 0 
        ? prevState.currentTabataIndex - 1 
        : prevState.currentTabataIndex
    }));
    
    // Guardar secuencia en AsyncStorage y sincronizar
    const newSequence = state.tabataSequence.filter((_, i) => i !== index);
    await AsyncStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const updateTabataInSequence = async (index: number, config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: prevState.tabataSequence.map((item, i) => i === index ? config : item)
    }));
    
    // Guardar secuencia en AsyncStorage y sincronizar
    const newSequence = state.tabataSequence.map((item, i) => i === index ? config : item);
    await AsyncStorage.setItem('timer-tabata-sequence', JSON.stringify(newSequence));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerTabataSequence: newSequence });
    }
  };

  const enableSequenceMode = async (enabled: boolean) => {
    setState(prevState => ({
      ...prevState,
      isSequenceMode: enabled,
      currentTabataIndex: enabled ? 0 : prevState.currentTabataIndex
    }));
    
    // Guardar en AsyncStorage y sincronizar
    await AsyncStorage.setItem('timer-sequence-mode', JSON.stringify(enabled));
    if (syncStatus.isLinked) {
      updateRemoteData({ timerSequenceMode: enabled });
    }
  };

  const clearTabataSequence = async () => {
    setState(prevState => ({
      ...prevState,
      tabataSequence: [],
      currentTabataIndex: 0,
      isSequenceMode: false
    }));
    
    // Limpiar AsyncStorage y sincronizar
    await AsyncStorage.removeItem('timer-tabata-sequence');
    await AsyncStorage.removeItem('timer-sequence-mode');
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