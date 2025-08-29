import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Wind, 
  Eye, 
  Activity, 
  Timer, 
  TrendingDown,
  CheckCircle,
  Zap,
  Heart,
  Brain
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

// Técnicas de crisis disponibles
const CRISIS_TECHNIQUES = [
  { 
    id: 'breathing', 
    name: 'Respiración Profunda', 
    icon: Wind,
    description: 'Técnica 4-7-8: Inhala 4, mantén 7, exhala 8 segundos',
    color: 'bg-blue-500'
  },
  { 
    id: 'grounding', 
    name: 'Técnica 5-4-3-2-1', 
    icon: Eye,
    description: '5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas',
    color: 'bg-green-500'
  },
  { 
    id: 'visualization', 
    name: 'Visualización', 
    icon: Brain,
    description: 'Imagina un lugar seguro y tranquilo en detalle',
    color: 'bg-purple-500'
  },
  { 
    id: 'movement', 
    name: 'Movimiento Suave', 
    icon: Activity,
    description: 'Estiramientos lentos o caminata tranquila',
    color: 'bg-orange-500'
  }
];

// Componente de técnica de respiración interactiva
const BreathingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setCount((prev) => {
          if (prev > 1) return prev - 1;
          
          // Cambiar de fase
          if (phase === 'inhale') {
            setPhase('hold');
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 8;
          } else {
            setPhase('inhale');
            return 4;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const phaseText = {
    inhale: 'Inhala profundamente',
    hold: 'Mantén la respiración',
    exhale: 'Exhala lentamente'
  };

  const phaseColor = {
    inhale: 'text-blue-600',
    hold: 'text-yellow-600',
    exhale: 'text-green-600'
  };

  return (
    <div className="text-center space-y-6 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
      <div className="space-y-4">
        <div className={`text-3xl font-bold ${phaseColor[phase]}`}>
          {phaseText[phase]}
        </div>
        <div className="text-6xl font-mono text-gray-800">
          {count}
        </div>
        <div className="text-sm text-gray-600">
          Técnica 4-7-8: {phase === 'inhale' ? 'Inhala 4' : phase === 'hold' ? 'Mantén 7' : 'Exhala 8'} segundos
        </div>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setIsActive(!isActive)}
          className={`${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {isActive ? 'Parar' : 'Comenzar'}
        </Button>
        <Button onClick={onComplete} variant="outline">
          Completar
        </Button>
      </div>
    </div>
  );
};

// Componente de técnica de grounding 5-4-3-2-1
const GroundingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  
  const steps = [
    { count: 5, sense: 'ves', placeholder: 'Ej: una silla, la pared, mis manos...' },
    { count: 4, sense: 'tocas', placeholder: 'Ej: la textura de mi ropa, el suelo...' },
    { count: 3, sense: 'escuchas', placeholder: 'Ej: el aire acondicionado, voces...' },
    { count: 2, sense: 'hueles', placeholder: 'Ej: café, perfume, aire fresco...' },
    { count: 1, sense: 'saboreas', placeholder: 'Ej: menta, café, un sabor dulce...' }
  ];

  const currentStep = steps[step];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-green-700">Técnica 5-4-3-2-1</h3>
        <div className="text-lg text-gray-700">
          Nombra <span className="font-bold text-green-600">{currentStep.count}</span> {' '}
          cosa{currentStep.count > 1 ? 's' : ''} que <span className="font-bold">{currentStep.sense}</span>
        </div>
        <Progress value={((step + 1) / 5) * 100} className="w-full" />
      </div>

      <div className="space-y-4">
        <Textarea
          value={answers[step]}
          onChange={(e) => {
            const newAnswers = [...answers];
            newAnswers[step] = e.target.value;
            setAnswers(newAnswers);
          }}
          placeholder={currentStep.placeholder}
          className="min-h-[100px] bg-white"
        />
      </div>

      <div className="flex gap-4 justify-center">
        {step > 0 && (
          <Button onClick={() => setStep(step - 1)} variant="outline">
            Anterior
          </Button>
        )}
        {step < 4 ? (
          <Button 
            onClick={() => setStep(step + 1)}
            disabled={!answers[step].trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            onClick={onComplete}
            disabled={!answers[step].trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Completar
          </Button>
        )}
      </div>
    </div>
  );
};

export default function ManejoCrisis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados de evaluación
  const [anxietyLevel, setAnxietyLevel] = useState<number>(5);
  const [panicLevel, setPanicLevel] = useState<number>(5);
  const [stressIntensity, setStressIntensity] = useState<number>(5);
  const [emotionalControl, setEmotionalControl] = useState<number>(5);

  // Estados de sesión
  const [currentPhase, setCurrentPhase] = useState<'assessment' | 'techniques' | 'post-assessment'>('assessment');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [activeTechnique, setActiveTechnique] = useState<string | null>(null);
  const [techniquesEffectiveness, setTechniquesEffectiveness] = useState<Record<string, number>>({});
  const [startTime] = useState<number>(Date.now());

  // Estados post-crisis
  const [postAnxietyLevel, setPostAnxietyLevel] = useState<number>(5);
  const [postPanicLevel, setPostPanicLevel] = useState<number>(5);
  const [postStressIntensity, setPostStressIntensity] = useState<number>(5);
  const [postEmotionalControl, setPostEmotionalControl] = useState<number>(5);

  // Contexto y reflexiones
  const [crisisTrigger, setCrisisTrigger] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [whatHelped, setWhatHelped] = useState<string>('');
  const [whatDidntHelp, setWhatDidntHelp] = useState<string>('');
  const [lessonsLearned, setLessonsLearned] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const crisisMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/crisis-management-sessions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": "8f1ecc02-a436-42f9-8ada-70b144243a43" // TODO: Get from auth
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save crisis session");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sesión de crisis guardada",
        description: "Has manejado bien esta situación. Recuerda estas técnicas para el futuro.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-management-sessions'] });
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

  const handleTechniqueComplete = (techniqueId: string, effectiveness: number) => {
    setTechniquesEffectiveness(prev => ({
      ...prev,
      [techniqueId]: effectiveness
    }));
    setActiveTechnique(null);
  };

  const handleSaveSession = () => {
    const duration = Math.round((Date.now() - startTime) / 60000); // en minutos
    
    const data = {
      anxietyLevel,
      panicLevel,
      stressIntensity,
      emotionalControl,
      techniquesUsed: selectedTechniques,
      breathingEffectiveness: techniquesEffectiveness.breathing || null,
      groundingEffectiveness: techniquesEffectiveness.grounding || null,
      visualizationEffectiveness: techniquesEffectiveness.visualization || null,
      movementEffectiveness: techniquesEffectiveness.movement || null,
      crisisTrigger: crisisTrigger.trim() || null,
      location: location.trim() || null,
      duration,
      postAnxietyLevel,
      postPanicLevel,
      postStressIntensity,
      postEmotionalControl,
      whatHelped: whatHelped.trim() || null,
      whatDidntHelp: whatDidntHelp.trim() || null,
      lessonsLearned: lessonsLearned.trim() || null,
      notes: notes.trim() || null
    };
    
    crisisMutation.mutate(data);
  };

  // Renderizado por fase
  if (currentPhase === 'assessment') {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="🚨 Manejo de Crisis" 
          subtitle="Herramientas para momentos de alta ansiedad"
        />
        
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Evaluación Inicial
              </CardTitle>
              <p className="text-[#575757]">
                Primero, evalúa cómo te sientes en este momento. No hay respuestas correctas o incorrectas.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nivel de Ansiedad */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Ansiedad: <span className="text-lg font-bold text-red-600">{anxietyLevel}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={anxietyLevel}
                  onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Muy calmado</span>
                  <span>Extremadamente ansioso</span>
                </div>
              </div>

              {/* Nivel de Pánico */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Nivel de Pánico: <span className="text-lg font-bold text-orange-600">{panicLevel}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={panicLevel}
                  onChange={(e) => setPanicLevel(Number(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Sin pánico</span>
                  <span>Pánico total</span>
                </div>
              </div>

              {/* Intensidad del Estrés */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Intensidad del Estrés: <span className="text-lg font-bold text-yellow-600">{stressIntensity}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressIntensity}
                  onChange={(e) => setStressIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Sin estrés</span>
                  <span>Estrés abrumador</span>
                </div>
              </div>

              {/* Control Emocional */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Control Emocional: <span className="text-lg font-bold text-blue-600">{emotionalControl}/10</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionalControl}
                  onChange={(e) => setEmotionalControl(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Sin control</span>
                  <span>Control total</span>
                </div>
              </div>

              {/* Contexto opcional */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="trigger">¿Qué desencadenó esta crisis? (opcional)</Label>
                  <Input
                    id="trigger"
                    value={crisisTrigger}
                    onChange={(e) => setCrisisTrigger(e.target.value)}
                    placeholder="Ej: examen, conflicto, noticia..."
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location">¿Dónde estás? (opcional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: casa, trabajo, transporte público..."
                    className="mt-1 bg-white"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setCurrentPhase('techniques')}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
              >
                Continuar a Técnicas de Crisis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fase de técnicas
  if (currentPhase === 'techniques') {
    if (activeTechnique) {
      const technique = CRISIS_TECHNIQUES.find(t => t.id === activeTechnique);
      
      return (
        <div className="min-h-screen bg-[#1A1A1A]">
          <NavHeader 
            title={`🚨 ${technique?.name}`} 
            subtitle="Sigue las instrucciones paso a paso"
          />
          
          <div className="max-w-2xl mx-auto p-4">
            {activeTechnique === 'breathing' && (
              <BreathingExercise 
                onComplete={() => {
                  // Preguntar efectividad
                  const effectiveness = window.prompt("¿Qué tan efectiva fue esta técnica? (1-5, donde 5 es muy efectiva)");
                  if (effectiveness) {
                    handleTechniqueComplete('breathing', parseInt(effectiveness));
                  }
                }}
              />
            )}
            
            {activeTechnique === 'grounding' && (
              <GroundingExercise 
                onComplete={() => {
                  const effectiveness = window.prompt("¿Qué tan efectiva fue esta técnica? (1-5, donde 5 es muy efectiva)");
                  if (effectiveness) {
                    handleTechniqueComplete('grounding', parseInt(effectiveness));
                  }
                }}
              />
            )}
            
            {(activeTechnique === 'visualization' || activeTechnique === 'movement') && (
              <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <div className="text-center space-y-4">
                  <technique.icon className="h-16 w-16 mx-auto text-purple-600" />
                  <h3 className="text-2xl font-bold text-purple-700">{technique.name}</h3>
                  <p className="text-gray-700 text-lg">{technique.description}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    Tómate el tiempo que necesites. Cuando te sientas mejor, evalúa la efectividad.
                  </p>
                  
                  <Button 
                    onClick={() => {
                      const effectiveness = window.prompt("¿Qué tan efectiva fue esta técnica? (1-5, donde 5 es muy efectiva)");
                      if (effectiveness) {
                        handleTechniqueComplete(activeTechnique, parseInt(effectiveness));
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Completar Técnica
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <NavHeader 
          title="🚨 Técnicas de Crisis" 
          subtitle="Elige las técnicas que quieres usar"
        />
        
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Selecciona las técnicas que quieres probar</CardTitle>
              <p className="text-[#575757]">Puedes elegir una o varias. Tomate el tiempo que necesites.</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {CRISIS_TECHNIQUES.map((technique) => {
                  const Icon = technique.icon;
                  const isSelected = selectedTechniques.includes(technique.id);
                  const isCompleted = technique.id in techniquesEffectiveness;
                  
                  return (
                    <Card 
                      key={technique.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-50 border-2 border-green-400' 
                          : isSelected 
                            ? 'bg-blue-50 border-2 border-blue-400' 
                            : 'hover:shadow-md border-gray-200'
                      }`}
                      onClick={() => {
                        if (!isCompleted) {
                          if (isSelected) {
                            setSelectedTechniques(prev => prev.filter(t => t !== technique.id));
                          } else {
                            setSelectedTechniques(prev => [...prev, technique.id]);
                          }
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg ${technique.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                              {technique.name}
                              {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {isSelected && !isCompleted && <Checkbox checked className="h-4 w-4" />}
                            </h3>
                            <p className="text-sm text-[#575757] mt-1">{technique.description}</p>
                            {isCompleted && (
                              <div className="mt-2 text-sm text-green-600 font-medium">
                                Efectividad: {techniquesEffectiveness[technique.id]}/5
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && !isCompleted && (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTechnique(technique.id);
                            }}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Practicar {technique.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {selectedTechniques.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => setCurrentPhase('post-assessment')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                    disabled={selectedTechniques.some(t => !(t in techniquesEffectiveness))}
                  >
                    {selectedTechniques.some(t => !(t in techniquesEffectiveness)) 
                      ? 'Completa las técnicas seleccionadas primero'
                      : 'Continuar a Evaluación Final'
                    }
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fase post-evaluación
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="🚨 Evaluación Final" 
        subtitle="¿Cómo te sientes ahora?"
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-green-600" />
              ¿Cómo te sientes después de las técnicas?
            </CardTitle>
            <p className="text-[#575757]">
              Evalúa tu estado actual comparado con el inicio de la sesión.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Evaluaciones post-crisis */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Nivel de Ansiedad Actual: <span className="text-lg font-bold text-green-600">{postAnxietyLevel}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={postAnxietyLevel}
                onChange={(e) => setPostAnxietyLevel(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Nivel de Pánico Actual: <span className="text-lg font-bold text-green-600">{postPanicLevel}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={postPanicLevel}
                onChange={(e) => setPostPanicLevel(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Intensidad del Estrés Actual: <span className="text-lg font-bold text-green-600">{postStressIntensity}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={postStressIntensity}
                onChange={(e) => setPostStressIntensity(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Control Emocional Actual: <span className="text-lg font-bold text-green-600">{postEmotionalControl}/10</span>
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={postEmotionalControl}
                onChange={(e) => setPostEmotionalControl(Number(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Reflexiones finales */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <Label htmlFor="helped">¿Qué fue lo que más te ayudó?</Label>
                <Textarea
                  id="helped"
                  value={whatHelped}
                  onChange={(e) => setWhatHelped(e.target.value)}
                  placeholder="Describe las técnicas o estrategias que fueron más efectivas..."
                  className="mt-1 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="didnt-help">¿Qué no funcionó? (opcional)</Label>
                <Textarea
                  id="didnt-help"
                  value={whatDidntHelp}
                  onChange={(e) => setWhatDidntHelp(e.target.value)}
                  placeholder="Esto nos ayuda a mejorar las técnicas..."
                  className="mt-1 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="lessons">¿Qué aprendiste para el futuro? (opcional)</Label>
                <Textarea
                  id="lessons"
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="Reflexiones que te pueden ayudar en situaciones similares..."
                  className="mt-1 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cualquier otra observación..."
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/mentalcheck')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSession}
                disabled={crisisMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {crisisMutation.isPending ? (
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