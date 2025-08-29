import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  TrendingUp,
  CheckCircle,
  Square,
  Heart,
  Sparkles
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

// Tipos de técnicas de respiración disponibles
const BREATHING_TECHNIQUES = [
  { 
    id: '4-7-8', 
    name: 'Respiración 4-7-8', 
    description: 'Inhala 4 segundos, mantén 7, exhala 8. Ideal para relajación y dormir.',
    icon: Wind,
    color: 'bg-blue-500',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    duration: 3 // minutos aproximados
  },
  { 
    id: 'box_breathing', 
    name: 'Respiración de Caja', 
    description: 'Inhala 4, mantén 4, exhala 4, pausa 4. Perfecta para enfoque y calma.',
    icon: Square,
    color: 'bg-green-500',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    cycles: 6,
    duration: 4
  },
  { 
    id: 'deep_belly', 
    name: 'Respiración Abdominal', 
    description: 'Respiración profunda desde el diafragma. Reduce estrés y ansiedad.',
    icon: Heart,
    color: 'bg-purple-500',
    inhale: 6,
    hold: 2,
    exhale: 8,
    cycles: 5,
    duration: 5
  },
  { 
    id: 'alternate_nostril', 
    name: 'Respiración Alternada', 
    description: 'Alterna fosas nasales para equilibrar el sistema nervioso.',
    icon: Sparkles,
    color: 'bg-orange-500',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 8,
    duration: 6
  }
];

// Componente de ejercicio de respiración interactivo
interface BreathingExerciseProps {
  technique: typeof BREATHING_TECHNIQUES[0];
  onComplete: (cycles: number, duration: number) => void;
  onCancel: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ technique, onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [count, setCount] = useState(technique.inhale);
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setCount((prev) => {
          if (prev > 1) return prev - 1;
          
          // Cambiar de fase
          if (phase === 'inhale') {
            setPhase('hold');
            return technique.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return technique.exhale;
          } else if (phase === 'exhale') {
            if (technique.id === 'box_breathing') {
              setPhase('pause');
              return technique.pause || 4;
            } else {
              // Completar ciclo
              if (currentCycle >= technique.cycles) {
                setIsActive(false);
                const duration = Math.round((Date.now() - startTime) / 60000);
                onComplete(currentCycle, duration);
                return 0;
              }
              setCurrentCycle(c => c + 1);
              setPhase('inhale');
              return technique.inhale;
            }
          } else { // pause (solo para box breathing)
            if (currentCycle >= technique.cycles) {
              setIsActive(false);
              const duration = Math.round((Date.now() - startTime) / 60000);
              onComplete(currentCycle, duration);
              return 0;
            }
            setCurrentCycle(c => c + 1);
            setPhase('inhale');
            return technique.inhale;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, currentCycle, technique, onComplete, startTime]);

  const phaseText = {
    inhale: 'Inhala profundamente',
    hold: 'Mantén la respiración',
    exhale: 'Exhala lentamente',
    pause: 'Pausa natural'
  };

  const phaseColor = {
    inhale: 'text-blue-600',
    hold: 'text-yellow-600',
    exhale: 'text-green-600',
    pause: 'text-gray-600'
  };

  const phaseIcon = {
    inhale: '⬆️',
    hold: '⏸️',
    exhale: '⬇️',
    pause: '⏳'
  };

  const progress = ((currentCycle - 1) / technique.cycles) * 100;

  return (
    <div className="text-center space-y-6 p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-lg">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">{technique.name}</h3>
        <div className="text-sm text-gray-600">Ciclo {currentCycle} de {technique.cycles}</div>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
      </div>

      <div className="space-y-6">
        <div className={`text-4xl font-bold ${phaseColor[phase]} transition-colors duration-500`}>
          {phaseIcon[phase]} {phaseText[phase]}
        </div>
        
        <div className="relative">
          {/* Animación especial para respiración de caja */}
          {technique.id === 'box_breathing' && (
            <div className="flex flex-col items-center space-y-6 mb-8">
              {/* Cuadrado con guía animada */}
              <div className="relative w-48 h-48">
                {/* Cuadrado base */}
                <div className="absolute inset-0 border-4 border-green-400 rounded-lg bg-green-50/20"></div>
                
                {/* Punto guía que recorre el perímetro suavemente */}
                <div 
                  className="absolute w-4 h-4 bg-green-600 rounded-full shadow-lg z-10"
                  style={{
                    // Posición inicial en esquina inferior izquierda y se mueve según la fase
                    left: 
                      phase === 'inhale' ? '0px' :          // Se queda en lado izquierdo (inhalar)
                      phase === 'hold' ? '176px' :          // Se mueve hacia la derecha (mantener)
                      phase === 'exhale' ? '176px' :        // Se queda en lado derecho (exhalar)  
                      '0px',                                 // Se mueve hacia la izquierda (pausa)
                    top: 
                      phase === 'inhale' ? '0px' :          // Se mueve hacia arriba (inhalar)
                      phase === 'hold' ? '0px' :            // Se queda arriba (mantener)
                      phase === 'exhale' ? '176px' :        // Se mueve hacia abajo (exhalar)
                      '176px',                               // Se queda abajo (pausa)
                    
                    // Transición activa solo cuando el ejercicio está corriendo
                    transition: !isActive ? 'none' : 'all 4s ease-linear'
                  }}
                >
                  {/* Pulso del punto */}
                  <div className="absolute inset-0 bg-green-600 rounded-full animate-ping opacity-75"></div>
                </div>
                
                {/* Etiquetas de las fases en las esquinas */}
                <div className="absolute -bottom-6 left-0 text-xs text-green-700 font-medium">
                  Inhalar ⬆️
                </div>
                <div className="absolute -top-6 left-0 text-xs text-yellow-700 font-medium">
                  Mantener ➡️
                </div>
                <div className="absolute -top-6 right-0 text-xs text-blue-700 font-medium">
                  Exhalar ⬇️
                </div>
                <div className="absolute -bottom-6 right-0 text-xs text-gray-700 font-medium">
                  Pausa ⬅️
                </div>
                
                {/* Flecha direccional */}
                <div className={`absolute text-2xl transition-all duration-500 ${
                  phase === 'inhale' ? 'bottom-2 left-1/2 transform -translate-x-1/2' :
                  phase === 'hold' ? 'top-1/2 right-2 transform -translate-y-1/2' :
                  phase === 'exhale' ? 'top-2 left-1/2 transform -translate-x-1/2' :
                  'top-1/2 left-2 transform -translate-y-1/2'
                }`}>
                  {phase === 'inhale' ? '⬆️' : 
                   phase === 'hold' ? '➡️' : 
                   phase === 'exhale' ? '⬇️' : '⬅️'}
                </div>
              </div>
              
              {/* Contador e instrucciones */}
              <div className="text-center">
                <div className="text-6xl font-mono text-gray-800 mb-2">
                  {count}
                </div>
                <div className="text-lg text-gray-600">
                  {phase === 'inhale' ? `Inhala ${technique.inhale}s` : 
                   phase === 'hold' ? `Mantén ${technique.hold}s` : 
                   phase === 'exhale' ? `Exhala ${technique.exhale}s` :
                   `Pausa ${technique.pause || 4}s`}
                </div>
              </div>
            </div>
          )}
          
          {/* Visualización estándar para otras técnicas */}
          {technique.id !== 'box_breathing' && (
            <div>
              <div className="text-8xl font-mono text-gray-800 mb-2">
                {count}
              </div>
              <div className="text-lg text-gray-600">
                {phase === 'inhale' ? `Inhala ${technique.inhale}s` : 
                 phase === 'hold' ? `Mantén ${technique.hold}s` : 
                 phase === 'exhale' ? `Exhala ${technique.exhale}s` :
                 `Pausa ${technique.pause || 4}s`}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setIsActive(!isActive)}
          className={`${isActive ? 'bg-red-500 hover:bg-red-600' : technique.color} text-white px-8 py-3`}
        >
          {isActive ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {currentCycle === 1 ? 'Comenzar' : 'Continuar'}
            </>
          )}
        </Button>
        
        <Button
          onClick={() => {
            setPhase('inhale');
            setCount(technique.inhale);
            setCurrentCycle(1);
            setIsActive(false);
          }}
          variant="outline"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reiniciar
        </Button>
        
        <Button onClick={onCancel} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default function TecnicasRespiracion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados de evaluación
  const [stressLevelBefore, setStressLevelBefore] = useState<number>(5);
  const [anxietyLevelBefore, setAnxietyLevelBefore] = useState<number>(5);
  const [energyLevelBefore, setEnergyLevelBefore] = useState<number>(5);

  // Estados de sesión
  const [currentPhase, setCurrentPhase] = useState<'assessment' | 'technique-selection' | 'practicing' | 'post-assessment'>('assessment');
  const [selectedTechnique, setSelectedTechnique] = useState<typeof BREATHING_TECHNIQUES[0] | null>(null);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  // Estados post-práctica
  const [stressLevelAfter, setStressLevelAfter] = useState<number>(5);
  const [anxietyLevelAfter, setAnxietyLevelAfter] = useState<number>(5);
  const [energyLevelAfter, setEnergyLevelAfter] = useState<number>(5);
  const [overallEffectiveness, setOverallEffectiveness] = useState<number>(3);

  // Contexto y notas
  const [context, setContext] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const breathingSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/breathing-technique-sessions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": "8f1ecc02-a436-42f9-8ada-70b144243a43" // TODO: Get from auth
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save breathing session");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sesión de respiración guardada",
        description: "Excelente práctica. Sigue así para mejorar tu bienestar.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/breathing-technique-sessions'] });
      navigate('/mentalcheck');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleTechniqueComplete = (cycles: number, duration: number) => {
    setCompletedCycles(cycles);
    setActualDuration(duration);
    setCurrentPhase('post-assessment');
  };

  const handleSaveSession = () => {
    if (!selectedTechnique) return;
    
    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    const data = {
      techniqueType: selectedTechnique.id,
      durationMinutes: actualDuration || selectedTechnique.duration,
      cycles: completedCycles,
      stressLevelBefore,
      anxietyLevelBefore,
      energyLevelBefore,
      stressLevelAfter,
      anxietyLevelAfter,
      energyLevelAfter,
      overallEffectiveness,
      context: context.trim() || null,
      notes: notes.trim() || null,
      timeOfDay,
      dayOfWeek
    };
    
    breathingSessionMutation.mutate(data);
  };

  // Renderizado por fase
  if (currentPhase === 'assessment') {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="💨 Técnicas de Respiración" 
          subtitle="Ejercicios guiados para relajación y enfoque"
        />
        
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <Wind className="h-6 w-6 text-blue-600" />
                ¿Cómo te sientes ahora?
              </CardTitle>
              <p className="text-[#575757]">
                Evalúa tu estado actual antes de comenzar con los ejercicios de respiración.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nivel de Estrés */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Estrés: <span className="text-lg font-bold text-red-600">{stressLevelBefore}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevelBefore}
                  onChange={(e) => setStressLevelBefore(Number(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Sin estrés</span>
                  <span>Muy estresado</span>
                </div>
              </div>

              {/* Nivel de Ansiedad */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Ansiedad: <span className="text-lg font-bold text-orange-600">{anxietyLevelBefore}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={anxietyLevelBefore}
                  onChange={(e) => setAnxietyLevelBefore(Number(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Muy tranquilo</span>
                  <span>Muy ansioso</span>
                </div>
              </div>

              {/* Nivel de Energía */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Energía: <span className="text-lg font-bold text-green-600">{energyLevelBefore}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevelBefore}
                  onChange={(e) => setEnergyLevelBefore(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Muy cansado</span>
                  <span>Muy energético</span>
                </div>
              </div>

              {/* Contexto opcional */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="context">¿Por qué quieres hacer respiración? (opcional)</Label>
                  <Input
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ej: antes de dormir, después del trabajo, para concentrarme..."
                    className="mt-1 bg-white"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setCurrentPhase('technique-selection')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
              >
                Continuar a Técnicas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Selección de técnica
  if (currentPhase === 'technique-selection') {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="💨 Selecciona tu Técnica" 
          subtitle="Elige el ejercicio que más te convenga"
        />
        
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Técnicas de Respiración Disponibles</CardTitle>
              <p className="text-[#575757]">Cada técnica tiene beneficios específicos. Elige la que mejor se adapte a tu momento actual.</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {BREATHING_TECHNIQUES.map((technique) => {
                  const Icon = technique.icon;
                  
                  return (
                    <Card 
                      key={technique.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200 hover:border-blue-400"
                      onClick={() => {
                        setSelectedTechnique(technique);
                        setCurrentPhase('practicing');
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-lg ${technique.color}`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">
                              {technique.name}
                            </h3>
                            <p className="text-sm text-[#575757] mb-4 leading-relaxed">
                              {technique.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                <span>~{technique.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" />
                                <span>{technique.cycles} ciclos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className={`w-full mt-4 text-white font-semibold ${technique.color} hover:opacity-90`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTechnique(technique);
                            setCurrentPhase('practicing');
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Practicar {technique.name}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => navigate('/mentalcheck')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Menú Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Práctica de la técnica
  if (currentPhase === 'practicing' && selectedTechnique) {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title={`💨 ${selectedTechnique.name}`} 
          subtitle="Sigue el ritmo y respira conscientemente"
        />
        
        <div className="max-w-2xl mx-auto p-4">
          <BreathingExercise 
            technique={selectedTechnique}
            onComplete={handleTechniqueComplete}
            onCancel={() => setCurrentPhase('technique-selection')}
          />
        </div>
      </div>
    );
  }

  // Evaluación final
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="💨 ¿Cómo te sientes ahora?" 
        subtitle="Evalúa los beneficios de tu práctica"
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Evaluación Post-Práctica
            </CardTitle>
            <p className="text-[#575757]">
              Compara cómo te sientes después de la sesión de respiración.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Evaluaciones post-práctica */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Nivel de Estrés Actual: <span className="text-lg font-bold text-green-600">{stressLevelAfter}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevelAfter}
                onChange={(e) => setStressLevelAfter(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Nivel de Ansiedad Actual: <span className="text-lg font-bold text-green-600">{anxietyLevelAfter}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={anxietyLevelAfter}
                onChange={(e) => setAnxietyLevelAfter(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Nivel de Energía Actual: <span className="text-lg font-bold text-green-600">{energyLevelAfter}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevelAfter}
                onChange={(e) => setEnergyLevelAfter(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Efectividad general */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Label className="text-base font-medium">
                Efectividad General: <span className="text-lg font-bold text-blue-600">{overallEffectiveness}/5</span>
              </Label>
              <input
                type="range"
                min="1"
                max="5"
                value={overallEffectiveness}
                onChange={(e) => setOverallEffectiveness(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>No ayudó</span>
                <span>Muy efectivo</span>
              </div>
            </div>

            {/* Notas adicionales */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Observaciones (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Cómo te sentiste durante la práctica? ¿Alguna dificultad o beneficio particular?"
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentPhase('technique-selection')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button 
                onClick={handleSaveSession}
                disabled={breathingSessionMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {breathingSessionMutation.isPending ? (
                  <>
                    <Timer className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Guardar Sesión
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}