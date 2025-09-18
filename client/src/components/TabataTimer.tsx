import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TabataConfig {
  workTime: number;
  restTime: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
}

const TabataTimer = () => {
  const [config, setConfig] = useState<TabataConfig>({
    workTime: 20,
    restTime: 10,
    cycles: 8,
    sets: 1,
    restBetweenSets: 60
  });

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.workTime);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isSetRest, setIsSetRest] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear audio beep usando Web Audio API para notificaciones
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) {
      try {
        createBeep();
      } catch (e) {
        console.log('Audio no disponible');
      }
    }
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handlePhaseChange();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePhaseChange = () => {
    if (isSetRest) {
      // Terminar descanso entre sets
      setIsSetRest(false);
      setCurrentSet(currentSet + 1);
      setCurrentCycle(1);
      setIsWorkPhase(true);
      setTimeLeft(config.workTime);
    } else if (isWorkPhase) {
      // Cambiar de trabajo a descanso
      setIsWorkPhase(false);
      setTimeLeft(config.restTime);
    } else {
      // Cambiar de descanso a trabajo o siguiente set
      if (currentCycle >= config.cycles) {
        // Completar set
        if (currentSet >= config.sets) {
          // Completar todos los sets
          setIsCompleted(true);
          setIsRunning(false);
          return;
        } else {
          // Descanso entre sets
          setIsSetRest(true);
          setTimeLeft(config.restBetweenSets);
          return;
        }
      } else {
        // Siguiente ciclo
        setCurrentCycle(currentCycle + 1);
        setIsWorkPhase(true);
        setTimeLeft(config.workTime);
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(config.workTime);
    setCurrentCycle(1);
    setCurrentSet(1);
    setIsWorkPhase(true);
    setIsSetRest(false);
    setIsCompleted(false);
  };

  const updateConfig = (newConfig: TabataConfig) => {
    setConfig(newConfig);
    resetTimer();
    setTimeLeft(newConfig.workTime);
  };

  const getPhaseText = () => {
    if (isCompleted) return '¡Completado!';
    if (isSetRest) return 'Descanso entre sets';
    return isWorkPhase ? 'TRABAJO' : 'DESCANSO';
  };

  const getPhaseColor = () => {
    if (isCompleted) return 'text-green-600';
    if (isSetRest) return 'text-blue-600';
    return isWorkPhase ? 'text-red-600' : 'text-yellow-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#283750]">
              <Timer className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-foreground">Timer Tabata</CardTitle>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-settings">
              <DialogHeader>
                <DialogTitle>Configuración Tabata</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workTime">Trabajo (seg)</Label>
                    <Input
                      id="workTime"
                      type="number"
                      value={config.workTime}
                      onChange={(e) => setConfig({...config, workTime: parseInt(e.target.value) || 20})}
                      data-testid="input-work-time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restTime">Descanso (seg)</Label>
                    <Input
                      id="restTime"
                      type="number"
                      value={config.restTime}
                      onChange={(e) => setConfig({...config, restTime: parseInt(e.target.value) || 10})}
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
                      value={config.cycles}
                      onChange={(e) => setConfig({...config, cycles: parseInt(e.target.value) || 8})}
                      data-testid="input-cycles"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sets">Sets totales</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={config.sets}
                      onChange={(e) => setConfig({...config, sets: parseInt(e.target.value) || 1})}
                      data-testid="input-sets"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="restBetweenSets">Descanso entre sets (seg)</Label>
                  <Input
                    id="restBetweenSets"
                    type="number"
                    value={config.restBetweenSets}
                    onChange={(e) => setConfig({...config, restBetweenSets: parseInt(e.target.value) || 60})}
                    data-testid="input-rest-between-sets"
                  />
                </div>
                <Button 
                  onClick={() => updateConfig(config)}
                  className="w-full"
                  data-testid="button-apply-config"
                >
                  Aplicar Configuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="text-muted-foreground mb-4">
          Timer de entrenamiento por intervalos de alta intensidad
        </CardDescription>
        
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getPhaseColor()}`} data-testid="text-timer">
            {formatTime(timeLeft)}
          </div>
          
          <div className={`text-xl font-semibold ${getPhaseColor()}`} data-testid="text-phase">
            {getPhaseText()}
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div data-testid="text-cycle">Ciclo: {currentCycle} / {config.cycles}</div>
            <div data-testid="text-set">Set: {currentSet} / {config.sets}</div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              onClick={toggleTimer}
              className={`${isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              disabled={isCompleted}
              data-testid="button-toggle-timer"
            >
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={resetTimer}
              variant="outline"
              data-testid="button-reset-timer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {isCompleted && (
            <div className="text-green-600 font-semibold" data-testid="text-completed">
              🎉 ¡Entrenamiento completado!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TabataTimer;