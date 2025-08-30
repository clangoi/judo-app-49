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
  Brain, 
  Play, 
  Pause, 
  Timer, 
  TrendingUp,
  CheckCircle,
  Sparkles,
  Heart,
  Eye,
  Footprints,
  Smile
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

// Tipos de meditaciones disponibles
const MINDFULNESS_SESSIONS = [
  { 
    id: 'body_scan', 
    name: 'Escaneo Corporal', 
    description: 'Observa conscientemente cada parte de tu cuerpo desde los pies hasta la cabeza.',
    icon: Eye,
    color: 'bg-blue-500',
    duration: 3,
    guidance: 'guided',
    steps: [
      'Siéntate cómodamente y relaja tu respiración',
      'Comienza por tus pies, nota las sensaciones',
      'Sube lentamente por tus piernas, abdomen',
      'Continúa por tu pecho, brazos y manos',
      'Termina en tu cuello, cabeza y coronilla'
    ]
  },
  { 
    id: 'breath_awareness', 
    name: 'Atención a la Respiración', 
    description: 'Enfócate únicamente en el ir y venir natural de tu respiración.',
    icon: Sparkles,
    color: 'bg-green-500',
    duration: 2,
    guidance: 'guided',
    steps: [
      'Encuentra una posición cómoda',
      'Observa tu respiración natural, sin cambiarla',
      'Cuando tu mente divague, vuelve a la respiración',
      'Nota el aire entrando y saliendo',
      'Termina con 3 respiraciones profundas'
    ]
  },
  { 
    id: 'loving_kindness', 
    name: 'Bondad Amorosa', 
    description: 'Cultiva sentimientos de amor y compasión hacia ti mismo y otros.',
    icon: Heart,
    color: 'bg-pink-500',
    duration: 4,
    guidance: 'guided',
    steps: [
      'Comienza enviándote amor y buenos deseos',
      'Piensa en alguien que amas y envíale bondad',
      'Incluye a una persona neutral en tus buenos deseos',
      'Extiende compasión a alguien difícil',
      'Termina enviando amor a todos los seres'
    ]
  },
  { 
    id: 'walking_meditation', 
    name: 'Caminar Consciente', 
    description: 'Meditación en movimiento, perfecta para espacios pequeños.',
    icon: Footprints,
    color: 'bg-orange-500',
    duration: 5,
    guidance: 'guided',
    steps: [
      'Encuentra un espacio de 2-3 metros',
      'Camina muy lentamente, paso a paso',
      'Siente cada movimiento: levantar, mover, colocar',
      'Al llegar al final, date vuelta conscientemente',
      'Mantén la atención en el proceso de caminar'
    ]
  },
  { 
    id: 'gratitude', 
    name: 'Gratitud Profunda', 
    description: 'Conecta con sentimientos genuinos de agradecimiento y apreciación.',
    icon: Smile,
    color: 'bg-purple-500',
    duration: 3,
    guidance: 'guided',
    steps: [
      'Respira profundamente y relaja tu cuerpo',
      'Piensa en 3 cosas por las que te sientes agradecido',
      'Siente realmente la emoción de gratitud en tu cuerpo',
      'Incluye personas que han sido importantes para ti',
      'Termina agradeciendo por este momento presente'
    ]
  }
];

// Componente de meditación guiada
interface MindfulnessSessionProps {
  session: typeof MINDFULNESS_SESSIONS[0];
  onComplete: (duration: number) => void;
  onCancel: () => void;
}

const MindfulnessSession: React.FC<MindfulnessSessionProps> = ({ session, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(session.duration * 60); // en segundos
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            const actualDuration = Math.round((Date.now() - startTime) / 60000);
            onComplete(actualDuration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, onComplete, startTime]);

  // Auto-avanzar pasos cada minuto
  useEffect(() => {
    const stepDuration = (session.duration * 60) / session.steps.length;
    const elapsedTime = (session.duration * 60) - timeRemaining;
    const newStep = Math.floor(elapsedTime / stepDuration);
    
    if (newStep !== currentStep && newStep < session.steps.length) {
      setCurrentStep(newStep);
    }
  }, [timeRemaining, session.duration, session.steps.length, currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((session.duration * 60 - timeRemaining) / (session.duration * 60)) * 100;

  return (
    <div className="text-center space-y-6 p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <session.icon className="h-8 w-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800">{session.name}</h3>
        </div>
        
        <div className="space-y-2">
          <div className="text-4xl font-mono text-gray-800">
            {formatTime(timeRemaining)}
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <div className="text-sm text-gray-600">
            Paso {currentStep + 1} de {session.steps.length}
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
        <div className="text-lg text-gray-700 leading-relaxed">
          {session.steps[currentStep]}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => {
            if (!isActive) {
              setIsActive(true);
              setIsPaused(false);
            } else {
              setIsPaused(!isPaused);
            }
          }}
          className={`${isActive && !isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : session.color} text-white px-8 py-3`}
        >
          {!isActive ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Comenzar Meditación
            </>
          ) : isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Continuar
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          )}
        </Button>
        
        <Button
          onClick={() => {
            const actualDuration = Math.round((Date.now() - startTime) / 60000);
            onComplete(actualDuration || 1);
          }}
          variant="outline"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Terminar Ahora
        </Button>
        
        <Button onClick={onCancel} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default function MindfulnessExpress() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados de evaluación
  const [stressLevelBefore, setStressLevelBefore] = useState<number>(5);
  const [focusLevelBefore, setFocusLevelBefore] = useState<number>(5);
  const [moodLevelBefore, setMoodLevelBefore] = useState<number>(5);

  // Estados de sesión
  const [currentPhase, setCurrentPhase] = useState<'assessment' | 'session-selection' | 'meditating' | 'post-assessment'>('assessment');
  const [selectedSession, setSelectedSession] = useState<typeof MINDFULNESS_SESSIONS[0] | null>(null);
  const [actualDuration, setActualDuration] = useState<number>(0);

  // Estados post-meditación
  const [stressLevelAfter, setStressLevelAfter] = useState<number>(5);
  const [focusLevelAfter, setFocusLevelAfter] = useState<number>(5);
  const [moodLevelAfter, setMoodLevelAfter] = useState<number>(5);
  
  // Experiencia de la sesión
  const [clarityLevel, setClarityLevel] = useState<number>(3);
  const [calmLevel, setCalmLevel] = useState<number>(3);
  const [presenceLevel, setPresenceLevel] = useState<number>(3);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(3);

  // Contexto y reflexiones
  const [intention, setIntention] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const mindfulnessMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/mindfulness-sessions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": "8f1ecc02-a436-42f9-8ada-70b144243a43" // TODO: Get from auth
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save mindfulness session");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sesión de mindfulness guardada",
        description: "Excelente práctica. La meditación regular mejora tu bienestar.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/mindfulness-sessions'] });
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

  const handleSessionComplete = (duration: number) => {
    setActualDuration(duration);
    setCurrentPhase('post-assessment');
  };

  const handleSaveSession = () => {
    if (!selectedSession) return;
    
    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    
    const data = {
      sessionType: selectedSession.id,
      durationMinutes: actualDuration || selectedSession.duration,
      guidance: selectedSession.guidance,
      stressLevelBefore,
      focusLevelBefore,
      moodLevelBefore,
      stressLevelAfter,
      focusLevelAfter,
      moodLevelAfter,
      clarityLevel,
      calmLevel,
      presenceLevel,
      overallSatisfaction,
      intention: intention.trim() || null,
      insights: insights.trim() || null,
      challenges: challenges.trim() || null,
      location: location.trim() || null,
      timeOfDay,
      dayOfWeek
    };
    
    mindfulnessMutation.mutate(data);
  };

  // Renderizado por fase
  if (currentPhase === 'assessment') {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader 
          title="🧘 Mindfulness Express" 
          subtitle="Meditaciones cortas para el bienestar diario"
        />
        
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                ¿Cómo estás en este momento?
              </CardTitle>
              <p className="text-muted-foreground">
                Evalúa tu estado actual antes de comenzar tu práctica de mindfulness.
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

              {/* Nivel de Enfoque */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Enfoque: <span className="text-lg font-bold text-blue-600">{focusLevelBefore}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={focusLevelBefore}
                  onChange={(e) => setFocusLevelBefore(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Muy disperso</span>
                  <span>Muy enfocado</span>
                </div>
              </div>

              {/* Estado de Ánimo */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Estado de Ánimo: <span className="text-lg font-bold text-green-600">{moodLevelBefore}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodLevelBefore}
                  onChange={(e) => setMoodLevelBefore(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Muy triste</span>
                  <span>Muy alegre</span>
                </div>
              </div>

              {/* Intención y ubicación */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="intention">¿Cuál es tu intención para esta práctica? (opcional)</Label>
                  <Input
                    id="intention"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Ej: relajarme, enfocarme, sentir paz..."
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location">¿Dónde vas a meditar? (opcional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: mi habitación, oficina, parque..."
                    className="mt-1 bg-white"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setCurrentPhase('session-selection')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6"
              >
                Continuar a Meditaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Selección de sesión
  if (currentPhase === 'session-selection') {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader 
          title="🧘 Elige tu Meditación" 
          subtitle="Cada práctica tiene beneficios únicos"
        />
        
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Card className="bg-white border-primary">
            <CardHeader>
              <CardTitle className="text-foreground">Meditaciones Disponibles</CardTitle>
              <p className="text-muted-foreground">Todas las sesiones son guiadas y duran entre 2-5 minutos. Perfectas para cualquier momento del día.</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {MINDFULNESS_SESSIONS.map((session) => {
                  const Icon = session.icon;
                  
                  return (
                    <Card 
                      key={session.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200 hover:border-purple-400"
                      onClick={() => {
                        setSelectedSession(session);
                        setCurrentPhase('meditating');
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-lg ${session.color}`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg mb-2">
                              {session.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              {session.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                <span>{session.duration} minutos</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                <span>Guiada</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className={`w-full text-white font-semibold ${session.color} hover:opacity-90`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                            setCurrentPhase('meditating');
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Meditar: {session.name}
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

  // Meditación en progreso
  if (currentPhase === 'meditating' && selectedSession) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader 
          title={`🧘 ${selectedSession.name}`} 
          subtitle="Relájate y sigue las indicaciones"
        />
        
        <div className="max-w-2xl mx-auto p-4">
          <MindfulnessSession 
            session={selectedSession}
            onComplete={handleSessionComplete}
            onCancel={() => setCurrentPhase('session-selection')}
          />
        </div>
      </div>
    );
  }

  // Evaluación final
  return (
    <div className="min-h-screen bg-background">
      <NavHeader 
        title="🧘 ¿Cómo te sientes ahora?" 
        subtitle="Evalúa los beneficios de tu meditación"
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Evaluación Post-Meditación
            </CardTitle>
            <p className="text-muted-foreground">
              Compara cómo te sientes después de tu práctica de mindfulness.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Evaluaciones después */}
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
                Nivel de Enfoque Actual: <span className="text-lg font-bold text-green-600">{focusLevelAfter}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={focusLevelAfter}
                onChange={(e) => setFocusLevelAfter(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Estado de Ánimo Actual: <span className="text-lg font-bold text-green-600">{moodLevelAfter}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={moodLevelAfter}
                onChange={(e) => setMoodLevelAfter(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Experiencia de la sesión */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900">Experiencia de la Meditación</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Claridad Mental: <span className="text-sm font-bold text-purple-600">{clarityLevel}/5</span>
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={clarityLevel}
                    onChange={(e) => setClarityLevel(Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Nivel de Calma: <span className="text-sm font-bold text-blue-600">{calmLevel}/5</span>
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={calmLevel}
                    onChange={(e) => setCalmLevel(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Presencia: <span className="text-sm font-bold text-green-600">{presenceLevel}/5</span>
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={presenceLevel}
                    onChange={(e) => setPresenceLevel(Number(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Satisfacción: <span className="text-sm font-bold text-pink-600">{overallSatisfaction}/5</span>
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={overallSatisfaction}
                    onChange={(e) => setOverallSatisfaction(Number(e.target.value))}
                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Reflexiones opcionales */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="insights">¿Qué insights o pensamientos surgieron? (opcional)</Label>
                <Textarea
                  id="insights"
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  placeholder="Reflexiones, realizaciones o pensamientos que surgieron durante la práctica..."
                  className="mt-1 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="challenges">¿Hubo alguna dificultad? (opcional)</Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Distracciones, inquietud, pensamientos persistentes..."
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentPhase('session-selection')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button 
                onClick={handleSaveSession}
                disabled={mindfulnessMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {mindfulnessMutation.isPending ? (
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