import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export type TimerMode = 'tabata' | 'timer' | 'stopwatch';

export interface TabataConfig {
  workTime: number;
  restTime: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
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

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TimerState>(defaultState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuG1/LFdSIHLIHN8+CWQQsVYK7j7qBQEAo+ltryxnkpBSl+zPDajzgIHmW7799iEQs7k+Tw0HIkBSJ1yO3akTELF2Cz5+OWQQsVX7Tl6qBREAp0qe3s4mseEQlPqOLuyFwbDTt7w/DZk2wPE3Km8u8yMRl2rtuzgK5yTjpPPh3TDq7EfGqOmGhOnofr1HkBQU5QJmwFWg8tLrGOT1xLmBJOW11IHgVFMrXsv6OxOgEzNxRqLT3EwCxNWFYXMR3ggotOsK5xJy6kCGYfG7Kw');
  }, []);

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
        // All sets completed
        return {
          ...prevState,
          isRunning: false,
          isCompleted: true
        };
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
          // All sets completed
          return {
            ...prevState,
            isRunning: false,
            isCompleted: true
          };
        }
      }
    }
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

      return newState;
    });
  };

  const updateTabataConfig = (config: TabataConfig) => {
    setState(prevState => ({
      ...prevState,
      tabataConfig: config,
      timeLeft: prevState.mode === 'tabata' ? config.workTime : prevState.timeLeft
    }));
  };

  const updateTimerConfig = (config: TimerConfig) => {
    setState(prevState => ({
      ...prevState,
      timerConfig: config,
      timeLeft: prevState.mode === 'timer' ? config.minutes * 60 + config.seconds : prevState.timeLeft
    }));
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
        isMinimized: false
      };

      if (prevState.mode === 'tabata') {
        newState.timeLeft = prevState.tabataConfig.workTime;
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
      setMinimized
    }
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};