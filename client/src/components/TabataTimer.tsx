import { useTimerContext } from '@/hooks/useTimerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings, Timer, Clock, TimerReset } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TabataTimer = () => {
  const { state, actions } = useTimerContext();

  // Helper functions for the UI
  const handleToggleTimer = () => {
    if (state.isRunning) {
      actions.pauseTimer();
    } else {
      actions.startTimer();
    }
  };

  const handleModeChange = (newMode: 'tabata' | 'timer' | 'stopwatch') => {
    actions.setMode(newMode);
  };

  const handleTabataConfigUpdate = (newConfig: typeof state.tabataConfig) => {
    actions.updateTabataConfig(newConfig);
  };

  const handleTimerConfigUpdate = (newConfig: typeof state.timerConfig) => {
    actions.updateTimerConfig(newConfig);
  };

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

  const getModeTitle = () => {
    switch (state.mode) {
      case 'tabata': return 'Timer Tabata';
      case 'timer': return 'Temporizador';
      case 'stopwatch': return 'Cronómetro';
      default: return 'Timer';
    }
  };

  const getModeDescription = () => {
    switch (state.mode) {
      case 'tabata': return 'Timer de entrenamiento por intervalos de alta intensidad';
      case 'timer': return 'Temporizador cuenta regresiva personalizable';
      case 'stopwatch': return 'Cronómetro para medir tiempo transcurrido';
      default: return '';
    }
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#283750]">
              {(() => {
                const IconComponent = getModeIcon();
                return <IconComponent className="h-6 w-6 text-white" />;
              })()}
            </div>
            <CardTitle className="text-foreground">{getModeTitle()}</CardTitle>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="dialog-settings">
              <DialogHeader>
                <DialogTitle>Configuración del Timer</DialogTitle>
              </DialogHeader>
              
              <Tabs value={state.mode} onValueChange={(value) => handleModeChange(value as 'tabata' | 'timer' | 'stopwatch')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tabata" data-testid="tab-tabata">Tabata</TabsTrigger>
                  <TabsTrigger value="timer" data-testid="tab-timer">Timer</TabsTrigger>
                  <TabsTrigger value="stopwatch" data-testid="tab-stopwatch">Cronómetro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tabata" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workTime">Trabajo (seg)</Label>
                      <Input
                        id="workTime"
                        type="number"
                        value={state.tabataConfig.workTime}
                        onChange={(e) => handleTabataConfigUpdate({
                          ...state.tabataConfig, 
                          workTime: parseInt(e.target.value) || 20
                        })}
                        data-testid="input-work-time"
                      />
                    </div>
                    <div>
                      <Label htmlFor="restTime">Descanso (seg)</Label>
                      <Input
                        id="restTime"
                        type="number"
                        value={state.tabataConfig.restTime}
                        onChange={(e) => handleTabataConfigUpdate({
                          ...state.tabataConfig, 
                          restTime: parseInt(e.target.value) || 10
                        })}
                        data-testid="input-rest-time"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cycles">Ciclos por set</Label>
                      <Input
                        id="cycles"
                        type="number"
                        value={state.tabataConfig.cycles}
                        onChange={(e) => handleTabataConfigUpdate({
                          ...state.tabataConfig, 
                          cycles: parseInt(e.target.value) || 8
                        })}
                        data-testid="input-cycles"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sets">Sets totales</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={state.tabataConfig.sets}
                        onChange={(e) => handleTabataConfigUpdate({
                          ...state.tabataConfig, 
                          sets: parseInt(e.target.value) || 1
                        })}
                        data-testid="input-sets"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="restBetweenSets">Descanso entre sets (seg)</Label>
                    <Input
                      id="restBetweenSets"
                      type="number"
                      value={state.tabataConfig.restBetweenSets}
                      onChange={(e) => handleTabataConfigUpdate({
                        ...state.tabataConfig, 
                        restBetweenSets: parseInt(e.target.value) || 60
                      })}
                      data-testid="input-rest-between-sets"
                    />
                  </div>
                  <Button 
                    onClick={() => handleTabataConfigUpdate(state.tabataConfig)}
                    className="w-full"
                    data-testid="button-apply-tabata-config"
                  >
                    Aplicar Configuración Tabata
                  </Button>
                </TabsContent>
                
                <TabsContent value="timer" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minutes">Minutos</Label>
                      <Input
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        value={state.timerConfig.minutes}
                        onChange={(e) => handleTimerConfigUpdate({
                          ...state.timerConfig, 
                          minutes: parseInt(e.target.value) || 0
                        })}
                        data-testid="input-timer-minutes"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seconds">Segundos</Label>
                      <Input
                        id="seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={state.timerConfig.seconds}
                        onChange={(e) => handleTimerConfigUpdate({
                          ...state.timerConfig, 
                          seconds: parseInt(e.target.value) || 0
                        })}
                        data-testid="input-timer-seconds"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleTimerConfigUpdate(state.timerConfig)}
                    className="w-full"
                    data-testid="button-apply-timer-config"
                  >
                    Aplicar Configuración Timer
                  </Button>
                </TabsContent>
                
                <TabsContent value="stopwatch" className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <p>El cronómetro no requiere configuración.</p>
                    <p>Usa los botones de control para iniciar, pausar y resetear.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="text-muted-foreground mb-4">
          {getModeDescription()}
        </CardDescription>
        
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getPhaseColor()}`} data-testid="text-timer">
            {getCurrentDisplayTime()}
          </div>
          
          <div className={`text-xl font-semibold ${getPhaseColor()}`} data-testid="text-phase">
            {getPhaseText()}
          </div>
          
          {state.mode === 'tabata' && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div data-testid="text-cycle">Ciclo: {state.currentCycle} / {state.tabataConfig.cycles}</div>
              <div data-testid="text-set">Set: {state.currentSet} / {state.tabataConfig.sets}</div>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleToggleTimer}
              className={`${state.isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              disabled={state.isCompleted && state.mode !== 'stopwatch'}
              data-testid="button-toggle-timer"
            >
              {state.isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {state.isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={actions.resetTimer}
              variant="outline"
              data-testid="button-reset-timer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {state.isCompleted && (
            <div className="text-green-600 font-semibold" data-testid="text-completed">
              🎉 {state.mode === 'timer' ? '¡Tiempo terminado!' : '¡Entrenamiento completado!'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TabataTimer;