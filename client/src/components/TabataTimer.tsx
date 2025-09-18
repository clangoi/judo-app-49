import { useTimerContext } from '@/hooks/useTimerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings, Timer, Clock, TimerReset, Plus, Trash2, Edit, ListOrdered } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

const TabataTimer = () => {
  const { state, actions } = useTimerContext();
  
  // Estados locales para secuencias
  const [newTabataName, setNewTabataName] = useState('');
  const [newTabataConfig, setNewTabataConfig] = useState<{
    workTime: number | string;
    restTime: number | string;
    cycles: number | string;
    sets: number | string;
    restBetweenSets: number | string;
  }>({
    workTime: 20,
    restTime: 10,
    cycles: 8,
    sets: 1,
    restBetweenSets: 60
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSequenceDialogOpen, setIsSequenceDialogOpen] = useState(false);

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
      case 'tabata': 
        if (state.isSequenceMode && state.tabataSequence.length > 0) {
          return `Secuencia Tabata - ${state.currentTabataIndex + 1}/${state.tabataSequence.length} - ${state.tabataSequence[state.currentTabataIndex]?.name || 'Sin nombre'}`;
        }
        return 'Timer de entrenamiento por intervalos de alta intensidad';
      case 'timer': return 'Temporizador cuenta regresiva personalizable';
      case 'stopwatch': return 'Cronómetro para medir tiempo transcurrido';
      default: return '';
    }
  };

  // Funciones para manejar secuencias
  const handleAddTabataToSequence = () => {
    const tabataConfig = {
      workTime: typeof newTabataConfig.workTime === 'string' ? (parseInt(newTabataConfig.workTime) || 20) : newTabataConfig.workTime,
      restTime: typeof newTabataConfig.restTime === 'string' ? (parseInt(newTabataConfig.restTime) || 10) : newTabataConfig.restTime,
      cycles: typeof newTabataConfig.cycles === 'string' ? (parseInt(newTabataConfig.cycles) || 8) : newTabataConfig.cycles,
      sets: typeof newTabataConfig.sets === 'string' ? (parseInt(newTabataConfig.sets) || 1) : newTabataConfig.sets,
      restBetweenSets: typeof newTabataConfig.restBetweenSets === 'string' ? (parseInt(newTabataConfig.restBetweenSets) || 60) : newTabataConfig.restBetweenSets,
      name: newTabataName || `Tabata ${state.tabataSequence.length + 1}`
    };
    actions.addTabataToSequence(tabataConfig);
    
    // Reset form
    setNewTabataName('');
    setNewTabataConfig({
      workTime: 20,
      restTime: 10,
      cycles: 8,
      sets: 1,
      restBetweenSets: 60
    });
  };

  const handleUpdateTabataInSequence = () => {
    if (editingIndex !== null) {
      const tabataConfig = {
        workTime: typeof newTabataConfig.workTime === 'string' ? (parseInt(newTabataConfig.workTime) || 20) : newTabataConfig.workTime,
        restTime: typeof newTabataConfig.restTime === 'string' ? (parseInt(newTabataConfig.restTime) || 10) : newTabataConfig.restTime,
        cycles: typeof newTabataConfig.cycles === 'string' ? (parseInt(newTabataConfig.cycles) || 8) : newTabataConfig.cycles,
        sets: typeof newTabataConfig.sets === 'string' ? (parseInt(newTabataConfig.sets) || 1) : newTabataConfig.sets,
        restBetweenSets: typeof newTabataConfig.restBetweenSets === 'string' ? (parseInt(newTabataConfig.restBetweenSets) || 60) : newTabataConfig.restBetweenSets,
        name: newTabataName || `Tabata ${editingIndex + 1}`
      };
      actions.updateTabataInSequence(editingIndex, tabataConfig);
      setEditingIndex(null);
      setNewTabataName('');
      setNewTabataConfig({
        workTime: 20,
        restTime: 10,
        cycles: 8,
        sets: 1,
        restBetweenSets: 60
      });
    }
  };

  const handleEditTabata = (index: number) => {
    const tabata = state.tabataSequence[index];
    setEditingIndex(index);
    setNewTabataName(tabata.name || '');
    setNewTabataConfig({
      workTime: tabata.workTime,
      restTime: tabata.restTime,
      cycles: tabata.cycles,
      sets: tabata.sets,
      restBetweenSets: tabata.restBetweenSets
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewTabataName('');
    setNewTabataConfig({
      workTime: 20,
      restTime: 10,
      cycles: 8,
      sets: 1,
      restBetweenSets: 60
    });
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="tabata" data-testid="tab-tabata">Tabata</TabsTrigger>
                  <TabsTrigger value="timer" data-testid="tab-timer">Timer</TabsTrigger>
                  <TabsTrigger value="stopwatch" data-testid="tab-stopwatch">Cronómetro</TabsTrigger>
                  <TabsTrigger value="sequences" data-testid="tab-sequences">
                    <ListOrdered className="h-4 w-4 mr-1" />
                    Secuencias
                  </TabsTrigger>
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
                
                <TabsContent value="sequences" className="space-y-4">
                  <div className="space-y-4">
                    {/* Switch para activar modo secuencia */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sequence-mode" className="text-sm font-medium">Modo Secuencia</Label>
                      <Switch
                        id="sequence-mode"
                        checked={state.isSequenceMode}
                        onCheckedChange={actions.enableSequenceMode}
                        data-testid="switch-sequence-mode"
                      />
                    </div>
                    
                    {/* Lista de Tabatas en la secuencia */}
                    {state.tabataSequence.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Secuencia Actual ({state.tabataSequence.length} Tabatas)</Label>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {state.tabataSequence.map((tabata, index) => (
                            <div 
                              key={index} 
                              className={`p-3 border rounded-lg flex items-center justify-between ${
                                state.isSequenceMode && state.currentTabataIndex === index ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                              }`}
                              data-testid={`sequence-item-${index}`}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{tabata.name || `Tabata ${index + 1}`}</div>
                                <div className="text-xs text-muted-foreground">
                                  {tabata.workTime}s trabajo / {tabata.restTime}s descanso × {tabata.cycles} ciclos × {tabata.sets} sets
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTabata(index)}
                                  data-testid={`button-edit-tabata-${index}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => actions.removeTabataFromSequence(index)}
                                  data-testid={`button-remove-tabata-${index}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={actions.clearTabataSequence}
                          className="w-full"
                          data-testid="button-clear-sequence"
                        >
                          Limpiar Secuencia
                        </Button>
                      </div>
                    )}
                    
                    {/* Formulario para agregar/editar Tabata */}
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-sm font-medium">
                        {editingIndex !== null ? 'Editar Tabata' : 'Agregar Nuevo Tabata'}
                      </Label>
                      
                      <div>
                        <Label htmlFor="tabata-name">Nombre del Tabata</Label>
                        <Input
                          id="tabata-name"
                          type="text"
                          placeholder="Ej: Calentamiento, Principal, Enfriamiento"
                          value={newTabataName}
                          onChange={(e) => setNewTabataName(e.target.value)}
                          data-testid="input-tabata-name"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="new-work-time">Trabajo (seg)</Label>
                          <Input
                            id="new-work-time"
                            type="number"
                            value={newTabataConfig.workTime}
                            onChange={(e) => setNewTabataConfig({...newTabataConfig, workTime: e.target.value === '' ? '' : parseInt(e.target.value)})}
                            onBlur={(e) => setNewTabataConfig({...newTabataConfig, workTime: parseInt(e.target.value) || 20})}
                            data-testid="input-new-work-time"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-rest-time">Descanso (seg)</Label>
                          <Input
                            id="new-rest-time"
                            type="number"
                            value={newTabataConfig.restTime}
                            onChange={(e) => setNewTabataConfig({...newTabataConfig, restTime: e.target.value === '' ? '' : parseInt(e.target.value)})}
                            onBlur={(e) => setNewTabataConfig({...newTabataConfig, restTime: parseInt(e.target.value) || 10})}
                            data-testid="input-new-rest-time"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="new-cycles">Ciclos</Label>
                          <Input
                            id="new-cycles"
                            type="number"
                            value={newTabataConfig.cycles}
                            onChange={(e) => setNewTabataConfig({...newTabataConfig, cycles: e.target.value === '' ? '' : parseInt(e.target.value)})}
                            onBlur={(e) => setNewTabataConfig({...newTabataConfig, cycles: parseInt(e.target.value) || 8})}
                            data-testid="input-new-cycles"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-sets">Sets</Label>
                          <Input
                            id="new-sets"
                            type="number"
                            value={newTabataConfig.sets}
                            onChange={(e) => setNewTabataConfig({...newTabataConfig, sets: e.target.value === '' ? '' : parseInt(e.target.value)})}
                            onBlur={(e) => setNewTabataConfig({...newTabataConfig, sets: parseInt(e.target.value) || 1})}
                            data-testid="input-new-sets"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-rest-between-sets">Descanso entre sets (seg)</Label>
                        <Input
                          id="new-rest-between-sets"
                          type="number"
                          value={newTabataConfig.restBetweenSets}
                          onChange={(e) => setNewTabataConfig({...newTabataConfig, restBetweenSets: e.target.value === '' ? '' : parseInt(e.target.value)})}
                          onBlur={(e) => setNewTabataConfig({...newTabataConfig, restBetweenSets: parseInt(e.target.value) || 60})}
                          data-testid="input-new-rest-between-sets"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {editingIndex !== null ? (
                          <>
                            <Button
                              onClick={handleUpdateTabataInSequence}
                              className="flex-1"
                              data-testid="button-update-tabata"
                            >
                              Actualizar Tabata
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              data-testid="button-cancel-edit"
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleAddTabataToSequence}
                            className="w-full"
                            data-testid="button-add-tabata"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar a Secuencia
                          </Button>
                        )}
                      </div>
                    </div>
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