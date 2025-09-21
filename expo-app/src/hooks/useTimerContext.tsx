import React, { createContext, useContext, useReducer, ReactNode, useRef, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics'; // ✅ Importación estática y correcta
import { useSyncManager } from './useSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type TimerMode = 'tabata' | 'timer' | 'stopwatch';

interface TabataConfig {
  workTime: number;
  restTime: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
  name?: string;
}

interface TimerConfig {
  minutes: number;
  seconds: number;
}

interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  timeLeft: number;
  stopwatchTime: number;
  
  // Tabata specific
  currentCycle: number;
  currentSet: number;
  isWorkPhase: boolean;
  isSetRest: boolean;
  tabataConfig: TabataConfig;
  
  // Timer specific
  timerConfig: TimerConfig;
  
  // Sequence mode
  isSequenceMode: boolean;
  tabataSequence: TabataConfig[];
  currentTabataIndex: number;
}

type TimerAction = 
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'SET_MODE'; mode: TimerMode }
  | { type: 'UPDATE_TABATA_CONFIG'; config: TabataConfig }
  | { type: 'UPDATE_TIMER_CONFIG'; config: TimerConfig }
  | { type: 'COMPLETE_TIMER' }
  | { type: 'ADD_TABATA_TO_SEQUENCE'; tabata: TabataConfig }
  | { type: 'REMOVE_TABATA_FROM_SEQUENCE'; index: number }
  | { type: 'UPDATE_TABATA_IN_SEQUENCE'; index: number; tabata: TabataConfig }
  | { type: 'CLEAR_TABATA_SEQUENCE' }
  | { type: 'ENABLE_SEQUENCE_MODE'; enabled: boolean }
  | { type: 'SET_STATE'; state: TimerState };

const defaultTabataConfig: TabataConfig = {
  workTime: 20,
  restTime: 10,
  cycles: 8,
  sets: 1,
  restBetweenSets: 60,
  name: 'Tabata'
};

const defaultTimerConfig: TimerConfig = {
  minutes: 5,
  seconds: 0
};

const defaultState: TimerState = {
  mode: 'tabata',
  isRunning: false,
  isPaused: false,
  isCompleted: false,
  timeLeft: 20,
  stopwatchTime: 0,
  currentCycle: 1,
  currentSet: 1,
  isWorkPhase: true,
  isSetRest: false,
  tabataConfig: defaultTabataConfig,
  timerConfig: defaultTimerConfig,
  isSequenceMode: false,
  tabataSequence: [],
  currentTabataIndex: 0,
};

// Storage key
const TIMER_STORAGE_KEY = 'timerState';

// Save state to AsyncStorage
const saveState = async (state: TimerState) => {
  try {
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
};

// Load state from AsyncStorage
const loadInitialState = async (): Promise<TimerState> => {
  try {
    const savedState = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return {
        ...defaultState,
        ...parsedState,
        isRunning: false,
        isPaused: true,
      };
    }
    return defaultState;
  } catch (error) {
    console.error('Error loading timer state:', error);
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
      
      const initialState = await loadInitialState();
      setState(initialState);
    };
    
    initializeApp();
  }, []);

  // Función para reproducir beep con sonido real
  const playBeep = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { 
          uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuq4/i4aB4GJ2eypFP7yfLgXBo=' 
        },
        { 
          shouldPlay: true, 
          volume: 0.8,
          isLooping: false
        }
      );
      
      const cleanup = setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.warn('Error al limpiar sonido:', e);
        }
      }, 1000) as any;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          clearTimeout(cleanup);
        }
      });
      
    } catch (error) {
      console.warn('Error reproduciendo beep:', error);
      // Fallback: usar vibración si está disponible
      try {
        // ✅ Usamos Haptics importado estáticamente
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        console.log('🔊 BEEP (vibración) - Últimos 3 segundos');
      } catch (hapticError) {
        console.log('🔊 BEEP - Últimos 3 segundos');
      }
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

  // Efecto de sincronización
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
      
      const interval = setInterval(syncTimerData, 30000);
      syncTimerData();
      
      return () => clearInterval(interval);
    }
  }, [syncStatus.isLinked, triggerSync]);

  // Timer reducer
  const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
    switch (action.type) {
      case 'SET_STATE':
        return action.state;
      
      case 'START_TIMER':
        return { ...state, isRunning: true, isPaused: false, isCompleted: false };
      
      case 'PAUSE_TIMER':
        return { ...state, isRunning: false, isPaused: true };
      
      case 'RESET_TIMER':
        if (state.mode === 'tabata') {
          let config = state.tabataConfig;
          if (state.isSequenceMode && state.tabataSequence.length > 0) {
            config = state.tabataSequence[0];
          }
          return {
            ...state,
            isRunning: false,
            isPaused: false,
            isCompleted: false,
            timeLeft: config.workTime,
            currentCycle: 1,
            currentSet: 1,
            isWorkPhase: true,
            isSetRest: false,
            currentTabataIndex: 0,
          };
        } else if (state.mode === 'timer') {
          return {
            ...state,
            isRunning: false,
            isPaused: false,
            isCompleted: false,
            timeLeft: state.timerConfig.minutes * 60 + state.timerConfig.seconds,
          };
        } else {
          return {
            ...state,
            isRunning: false,
            isPaused: false,
            isCompleted: false,
            stopwatchTime: 0,
          };
        }
      
      case 'COMPLETE_TIMER':
        return { ...state, isRunning: false, isCompleted: true };
      
      case 'SET_MODE':
        let newState = {
          ...state,
          mode: action.mode,
          isRunning: false,
          isPaused: false,
          isCompleted: false,
        };
        
        if (action.mode === 'tabata') {
          let config = state.tabataConfig;
          if (state.isSequenceMode && state.tabataSequence.length > 0) {
            config = state.tabataSequence[0];
          }
          newState = {
            ...newState,
            timeLeft: config.workTime,
            currentCycle: 1,
            currentSet: 1,
            isWorkPhase: true,
            isSetRest: false,
            currentTabataIndex: 0,
          };
        } else if (action.mode === 'timer') {
          newState = {
            ...newState,
            timeLeft: state.timerConfig.minutes * 60 + state.timerConfig.seconds,
          };
        } else {
          newState = {
            ...newState,
            stopwatchTime: 0,
          };
        }
        
        return newState;
      
      case 'UPDATE_TABATA_CONFIG':
        return {
          ...state,
          tabataConfig: action.config,
          timeLeft: action.config.workTime,
          currentCycle: 1,
          currentSet: 1,
          isWorkPhase: true,
          isSetRest: false,
        };
      
      case 'UPDATE_TIMER_CONFIG':
        return {
          ...state,
          timerConfig: action.config,
          timeLeft: action.config.minutes * 60 + action.config.seconds,
        };
      
      case 'ADD_TABATA_TO_SEQUENCE':
        return {
          ...state,
          tabataSequence: [...state.tabataSequence, action.tabata],
        };
      
      case 'REMOVE_TABATA_FROM_SEQUENCE':
        const newSequence = state.tabataSequence.filter((_, i) => i !== action.index);
        return {
          ...state,
          tabataSequence: newSequence,
          currentTabataIndex: Math.min(state.currentTabataIndex, newSequence.length - 1),
        };
      
      case 'UPDATE_TABATA_IN_SEQUENCE':
        const updatedSequence = [...state.tabataSequence];
        updatedSequence[action.index] = action.tabata;
        return {
          ...state,
          tabataSequence: updatedSequence,
        };
      
      case 'CLEAR_TABATA_SEQUENCE':
        return {
          ...state,
          tabataSequence: [],
          currentTabataIndex: 0,
          isSequenceMode: false,
        };
      
      case 'ENABLE_SEQUENCE_MODE':
        let resetState = { ...state, isSequenceMode: action.enabled };
        
        if (action.enabled && state.tabataSequence.length > 0) {
          const firstTabata = state.tabataSequence[0];
          resetState = {
            ...resetState,
            timeLeft: firstTabata.workTime,
            currentCycle: 1,
            currentSet: 1,
            isWorkPhase: true,
            isSetRest: false,
            currentTabataIndex: 0,
          };
        } else if (!action.enabled) {
          resetState = {
            ...resetState,
            timeLeft: state.tabataConfig.workTime,
            currentCycle: 1,
            currentSet: 1,
            isWorkPhase: true,
            isSetRest: false,
            currentTabataIndex: 0,
          };
        }
        
        return resetState;
      
      case 'TICK':
        if (state.mode === 'stopwatch') {
          return { ...state, stopwatchTime: state.stopwatchTime + 1 };
        }
        
        if (state.mode === 'timer') {
          if (state.timeLeft <= 1) {
            return { ...state, timeLeft: 0, isRunning: false, isCompleted: true };
          }
          return { ...state, timeLeft: state.timeLeft - 1 };
        }
        
        if (state.mode === 'tabata') {
          const currentConfig = state.isSequenceMode && state.tabataSequence.length > 0 
            ? state.tabataSequence[state.currentTabataIndex]
            : state.tabataConfig;
          
          if (state.timeLeft <= 1) {
            if (state.isSetRest) {
              if (state.isSequenceMode && state.currentTabataIndex < state.tabataSequence.length - 1) {
                const nextTabata = state.tabataSequence[state.currentTabataIndex + 1];
                return {
                  ...state,
                  currentTabataIndex: state.currentTabataIndex + 1,
                  timeLeft: nextTabata.workTime,
                  currentCycle: 1,
                  currentSet: 1,
                  isWorkPhase: true,
                  isSetRest: false,
                };
              } else {
                return { ...state, isRunning: false, isCompleted: true };
              }
            } else if (state.isWorkPhase) {
              return {
                ...state,
                timeLeft: currentConfig.restTime,
                isWorkPhase: false,
              };
            } else {
              if (state.currentCycle < currentConfig.cycles) {
                return {
                  ...state,
                  timeLeft: currentConfig.workTime,
                  currentCycle: state.currentCycle + 1,
                  isWorkPhase: true,
                };
              } else {
                if (state.currentSet < currentConfig.sets) {
                  return {
                    ...state,
                    timeLeft: currentConfig.restBetweenSets,
                    currentSet: state.currentSet + 1,
                    currentCycle: 1,
                    isWorkPhase: true,
                    isSetRest: true,
                  };
                } else {
                  if (state.isSequenceMode && state.currentTabataIndex < state.tabataSequence.length - 1) {
                    const nextTabata = state.tabataSequence[state.currentTabataIndex + 1];
                    return {
                      ...state,
                      currentTabataIndex: state.currentTabataIndex + 1,
                      timeLeft: nextTabata.workTime,
                      currentCycle: 1,
                      currentSet: 1,
                      isWorkPhase: true,
                      isSetRest: false,
                    };
                  } else {
                    return { ...state, isRunning: false, isCompleted: true };
                  }
                }
              }
            }
          }
          
          return { ...state, timeLeft: state.timeLeft - 1 };
        }
        
        return state;
      
      default:
        return state;
    }
  };

  // ✅ Correctamente declarado con useReducer
  const [reducerState, dispatch] = useReducer(timerReducer, state);

  // Sync state between useState and useReducer
  useEffect(() => {
    setState(reducerState);
  }, [reducerState]);

  // Load initial state into reducer
  useEffect(() => {
    const loadAndSetState = async () => {
      const initialState = await loadInitialState();
      dispatch({ type: 'SET_STATE', state: initialState });
    };
    
    loadAndSetState();
  }, []);

  // Auto-save state changes
  useEffect(() => {
    saveState(reducerState);
    
    if (syncStatus.isLinked) {
      updateRemoteData({ timerState: reducerState });
    }
  }, [reducerState, syncStatus.isLinked, updateRemoteData]);

  // Timer interval
  useEffect(() => {
    if (reducerState.isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000) as any;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reducerState.isRunning]);

  const actions = {
    startTimer: () => dispatch({ type: 'START_TIMER' }),
    pauseTimer: () => dispatch({ type: 'PAUSE_TIMER' }),
    resetTimer: () => dispatch({ type: 'RESET_TIMER' }),
    setMode: (mode: TimerMode) => dispatch({ type: 'SET_MODE', mode }),
    updateTabataConfig: (config: TabataConfig) => dispatch({ type: 'UPDATE_TABATA_CONFIG', config }),
    updateTimerConfig: (config: TimerConfig) => dispatch({ type: 'UPDATE_TIMER_CONFIG', config }),
    addTabataToSequence: (tabata: TabataConfig) => dispatch({ type: 'ADD_TABATA_TO_SEQUENCE', tabata }),
    removeTabataFromSequence: (index: number) => dispatch({ type: 'REMOVE_TABATA_FROM_SEQUENCE', index }),
    updateTabataInSequence: (index: number, tabata: TabataConfig) => dispatch({ type: 'UPDATE_TABATA_IN_SEQUENCE', index, tabata }),
    clearTabataSequence: () => dispatch({ type: 'CLEAR_TABATA_SEQUENCE' }),
    enableSequenceMode: (enabled: boolean) => dispatch({ type: 'ENABLE_SEQUENCE_MODE', enabled }),
  };

  // ✅ CORREGIDO: state: reducerState
  return (
    <TimerContext.Provider value={{ state: reducerState, actions }}>
      {children}
    </TimerContext.Provider>
  );
};

const TimerContext = createContext<{
  state: TimerState;
  actions: {
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: TimerMode) => void;
    updateTabataConfig: (config: TabataConfig) => void;
    updateTimerConfig: (config: TimerConfig) => void;
    addTabataToSequence: (tabata: TabataConfig) => void;
    removeTabataFromSequence: (index: number) => void;
    updateTabataInSequence: (index: number, tabata: TabataConfig) => void;
    clearTabataSequence: () => void;
    enableSequenceMode: (enabled: boolean) => void;
  };
} | null>(null);

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};

// Export types for use in other components
export type { TimerState, TabataConfig, TimerConfig };