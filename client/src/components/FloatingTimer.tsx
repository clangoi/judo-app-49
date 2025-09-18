import { useTimerContext } from '@/hooks/useTimerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Minimize2, Maximize2, X, Timer, Clock, TimerReset } from 'lucide-react';

const FloatingTimer = () => {
  const { state, actions } = useTimerContext();

  // Don't render if timer is not floating
  if (!state.isFloating) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDisplayTime = () => {
    if (state.mode === 'stopwatch') {
      return formatTime(state.stopwatchTime);
    } else {
      return formatTime(state.timeLeft);
    }
  };

  const getPhaseText = () => {
    if (state.isCompleted) {
      return state.mode === 'timer' ? '¡Tiempo terminado!' : '¡Completado!';
    }
    
    if (state.mode === 'stopwatch') {
      return 'CRONÓMETRO';
    } else if (state.mode === 'timer') {
      return 'TEMPORIZADOR';
    } else if (state.mode === 'tabata') {
      if (state.isSetRest) return 'Descanso entre sets';
      return state.isWorkPhase ? 'TRABAJO' : 'DESCANSO';
    }
    
    return '';
  };

  const getPhaseColor = () => {
    if (state.isCompleted) return 'text-green-600';
    
    if (state.mode === 'stopwatch') {
      return 'text-blue-600';
    } else if (state.mode === 'timer') {
      return 'text-orange-600';
    } else if (state.mode === 'tabata') {
      if (state.isSetRest) return 'text-blue-600';
      return state.isWorkPhase ? 'text-red-600' : 'text-yellow-600';
    }
    
    return 'text-gray-600';
  };

  const getModeIcon = () => {
    switch (state.mode) {
      case 'tabata': return Timer;
      case 'timer': return Clock;
      case 'stopwatch': return TimerReset;
      default: return Timer;
    }
  };

  const handleToggleTimer = () => {
    if (state.isRunning) {
      actions.pauseTimer();
    } else {
      actions.startTimer();
    }
  };

  const handleClose = () => {
    actions.setFloating(false);
    if (state.isRunning) {
      actions.pauseTimer();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50" data-testid="floating-timer">
      <Card className={`bg-white shadow-lg border-2 transition-all duration-300 ${
        state.isMinimized ? 'w-16 h-16' : 'w-80'
      } ${state.isRunning ? 'border-primary' : 'border-gray-300'}`}>
        <CardContent className={`p-4 ${state.isMinimized ? 'p-2' : ''}`}>
          {state.isMinimized ? (
            // Minimized view
            <div className="flex items-center justify-center h-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.setMinimized(false)}
                className="w-full h-full p-0"
                data-testid="button-maximize-timer"
              >
                {(() => {
                  const IconComponent = getModeIcon();
                  return <IconComponent className="h-6 w-6 text-primary" />;
                })()}
              </Button>
            </div>
          ) : (
            // Full view
            <div className="space-y-3">
              {/* Header with controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = getModeIcon();
                    return <IconComponent className="h-4 w-4 text-primary" />;
                  })()}
                  <span className="text-sm font-medium">
                    {state.mode === 'tabata' ? 'Tabata' : 
                     state.mode === 'timer' ? 'Timer' : 'Cronómetro'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.setMinimized(true)}
                    className="h-8 w-8 p-0"
                    data-testid="button-minimize-timer"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                    data-testid="button-close-timer"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Timer display */}
              <div className="text-center space-y-2">
                <div className={`text-3xl font-bold ${getPhaseColor()}`} data-testid="floating-timer-display">
                  {getCurrentDisplayTime()}
                </div>
                
                <div className={`text-sm font-medium ${getPhaseColor()}`} data-testid="floating-timer-phase">
                  {getPhaseText()}
                </div>

                {/* Tabata progress */}
                {state.mode === 'tabata' && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div data-testid="floating-timer-cycle">
                      Ciclo: {state.currentCycle} / {state.tabataConfig.cycles}
                    </div>
                    <div data-testid="floating-timer-set">
                      Set: {state.currentSet} / {state.tabataConfig.sets}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    onClick={handleToggleTimer}
                    className={`${state.isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    size="sm"
                    disabled={state.isCompleted && state.mode !== 'stopwatch'}
                    data-testid="floating-button-toggle-timer"
                  >
                    {state.isRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    {state.isRunning ? 'Pausar' : 'Continuar'}
                  </Button>
                  
                  <Button
                    onClick={actions.resetTimer}
                    variant="outline"
                    size="sm"
                    data-testid="floating-button-reset-timer"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* Completion message */}
                {state.isCompleted && (
                  <div className="text-green-600 font-medium text-sm" data-testid="floating-timer-completed">
                    🎉 {state.mode === 'timer' ? '¡Tiempo terminado!' : '¡Entrenamiento completado!'}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingTimer;