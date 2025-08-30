import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Brain, Heart, Activity, Smile, Calendar, Plus, TrendingUp, Target, Focus, Clock, Lightbulb, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NavHeader from "@/components/NavHeader";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { DeepAssessmentEntry, InsertDeepAssessmentEntry } from "@shared/schema";

const deepAssessmentSchema = z.object({
  date: z.string(),
  // Estado de ánimo (1-5)
  moodLevel: z.number().min(1).max(5),
  energyLevel: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  motivation: z.number().min(1).max(5),
  moodFactors: z.array(z.string()).default([]),
  
  // Niveles de estrés (1-5)
  stressLevel: z.number().min(1).max(5),
  stressType: z.string().optional(),
  stressTriggers: z.array(z.string()).default([]),
  copingStrategies: z.array(z.string()).default([]),
  copingEffectiveness: z.number().min(1).max(5).optional(),
  
  // Concentración (1-10)
  focusLevel: z.number().min(1).max(10),
  attentionSpan: z.number().min(1).max(10),
  mentalClarity: z.number().min(1).max(10),
  distractionLevel: z.number().min(1).max(10),
  concentrationTechniques: z.array(z.string()).default([]),
  distractionSources: z.array(z.string()).default([]),
  taskCompleted: z.number().min(1).max(10).optional(),
  
  // Bienestar mental (1-10)
  overallWellness: z.number().min(1).max(10),
  lifeSatisfaction: z.number().min(1).max(10),
  selfEsteem: z.number().min(1).max(10),
  socialConnection: z.number().min(1).max(10),
  purposeMeaning: z.number().min(1).max(10),
  emotionalRegulation: z.number().min(1).max(10),
  anxietyLevel: z.number().min(1).max(10),
  
  // Reflexiones
  positiveThoughts: z.array(z.string()).default([]),
  challengesOvercome: z.array(z.string()).default([]),
  gratitudeItems: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type DeepAssessmentFormData = z.infer<typeof deepAssessmentSchema>;

const EvaluacionProfunda = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  // Estados para arrays dinámicos
  const [newMoodFactor, setNewMoodFactor] = useState("");
  const [newStressTrigger, setNewStressTrigger] = useState("");
  const [newCopingStrategy, setNewCopingStrategy] = useState("");
  const [newConcentrationTechnique, setNewConcentrationTechnique] = useState("");
  const [newDistraction, setNewDistraction] = useState("");
  const [newPositiveThought, setNewPositiveThought] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [newGratitude, setNewGratitude] = useState("");

  const form = useForm<DeepAssessmentFormData>({
    resolver: zodResolver(deepAssessmentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      // Estado de ánimo
      moodLevel: 3,
      energyLevel: 3,
      sleepQuality: 3,
      motivation: 3,
      moodFactors: [],
      // Estrés
      stressLevel: 3,
      stressType: "",
      stressTriggers: [],
      copingStrategies: [],
      copingEffectiveness: 3,
      // Concentración
      focusLevel: 5,
      attentionSpan: 5,
      mentalClarity: 5,
      distractionLevel: 5,
      concentrationTechniques: [],
      distractionSources: [],
      taskCompleted: 5,
      // Bienestar
      overallWellness: 5,
      lifeSatisfaction: 5,
      selfEsteem: 5,
      socialConnection: 5,
      purposeMeaning: 5,
      emotionalRegulation: 5,
      anxietyLevel: 5,
      // Reflexiones
      positiveThoughts: [],
      challengesOvercome: [],
      gratitudeItems: [],
      notes: "",
    },
  });

  const { data: deepAssessments = [] } = useQuery<DeepAssessmentEntry[]>({
    queryKey: ["/api/deep-assessment-entries"],
  });

  const createDeepAssessmentMutation = useMutation({
    mutationFn: async (data: InsertDeepAssessmentEntry) => {
      const response = await fetch("/api/deep-assessment-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create deep assessment entry");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "¡Evaluación completa guardada!", description: "Tu evaluación profunda ha sido registrada exitosamente." });
      queryClient.invalidateQueries({ queryKey: ["/api/deep-assessment-entries"] });
      setIsFormOpen(false);
      setCurrentSection(1);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar tu evaluación.", variant: "destructive" });
    },
  });

  const todayEntry = deepAssessments.find(entry => 
    isToday(new Date(entry.date))
  );

  const onSubmit = (data: DeepAssessmentFormData) => {
    createDeepAssessmentMutation.mutate(data as InsertDeepAssessmentEntry);
  };

  // Funciones para arrays dinámicos
  const addMoodFactor = () => {
    if (newMoodFactor.trim()) {
      const current = form.getValues("moodFactors");
      form.setValue("moodFactors", [...current, newMoodFactor.trim()]);
      setNewMoodFactor("");
    }
  };

  const removeMoodFactor = (index: number) => {
    const current = form.getValues("moodFactors");
    form.setValue("moodFactors", current.filter((_, i) => i !== index));
  };

  // Color utilities
  const getLevelColor5 = (level: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-green-100 text-green-800",
      5: "bg-emerald-100 text-emerald-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getLevelColor10 = (level: number) => {
    const colors = {
      1: "bg-red-100 text-red-800", 2: "bg-red-50 text-red-700", 
      3: "bg-orange-100 text-orange-800", 4: "bg-yellow-100 text-yellow-800",
      5: "bg-blue-100 text-blue-800", 6: "bg-blue-200 text-blue-900",
      7: "bg-green-100 text-green-800", 8: "bg-green-200 text-green-900",
      9: "bg-emerald-100 text-emerald-800", 10: "bg-emerald-200 text-emerald-900"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const sections = [
    { id: 1, title: "Estado de Ánimo", icon: Smile, color: "blue" },
    { id: 2, title: "Niveles de Estrés", icon: Activity, color: "orange" },
    { id: 3, title: "Concentración", icon: Brain, color: "purple" },
    { id: 4, title: "Bienestar Mental", icon: Heart, color: "pink" },
    { id: 5, title: "Reflexiones", icon: Lightbulb, color: "green" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="Evaluación Profunda"
        subtitle="Evaluación integral de tu estado mental, emocional y cognitivo"
      />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Welcome section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bienvenido a tu evaluación mental
          </h2>
          <p className="text-gray-600 mb-4">
            Tu salud mental es tan importante como tu entrenamiento físico. Utiliza estas herramientas para monitorear y mejorar tu bienestar psicológico.
          </p>
          
          {/* Explanation cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Smile className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Estado de Ánimo</h3>
              </div>
              <p className="text-xs text-blue-700">
                <strong>¿Cómo me siento en general hoy?</strong><br/>
                Evalúa tu bienestar emocional completo del día
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-900">Niveles de Estrés</h3>
              </div>
              <p className="text-xs text-orange-700">
                <strong>¿Qué me estresa y cómo lo manejo?</strong><br/>
                Identifica causas del estrés y mejora tus estrategias
              </p>
            </div>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-pink-600" />
                <h3 className="text-sm font-medium text-pink-900">Evaluación del Día</h3>
              </div>
              <p className="text-xs text-pink-700">
                <strong>¿Cómo está mi salud psicológica integral?</strong><br/>
                Evalúa autoestima, propósito, conexiones y crecimiento
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Concentración</h3>
              </div>
              <p className="text-xs text-purple-700">
                <strong>¿Cómo está mi capacidad de enfoque?</strong><br/>
                Evalúa concentración, claridad mental y técnicas
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          {todayEntry ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-green-900">¡Ya completaste tu evaluación profunda hoy!</h3>
              </div>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge className={getLevelColor5(todayEntry.moodLevel)}>Ánimo: {todayEntry.moodLevel}/5</Badge>
                <Badge className={getLevelColor5(6 - todayEntry.stressLevel)}>Estrés: {todayEntry.stressLevel}/5</Badge>
                <Badge className={getLevelColor10(todayEntry.focusLevel)}>Concentración: {todayEntry.focusLevel}/10</Badge>
                <Badge className={getLevelColor10(todayEntry.overallWellness)}>Bienestar: {todayEntry.overallWellness}/10</Badge>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evaluación Profunda del Día
                </CardTitle>
                <CardDescription>
                  Una evaluación completa que integra estado de ánimo, estrés, concentración y bienestar mental
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="w-full"
                  disabled={createDeepAssessmentMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Comenzar Evaluación Profunda
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="h-5 w-5" />
                Evaluación Profunda - Sección {currentSection} de 5
              </CardTitle>
              <CardDescription>
                {sections.find(s => s.id === currentSection)?.title}
              </CardDescription>
              
              {/* Progress indicator */}
              <div className="flex gap-2 mt-4">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <div
                      key={section.id}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        currentSection === section.id 
                          ? `bg-${section.color}-100 text-${section.color}-800 font-medium`
                          : currentSection > section.id
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span className="hidden sm:inline">{section.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* SECCIÓN 1: ESTADO DE ÁNIMO */}
                  {currentSection === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Smile className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">¿Cómo te sientes hoy en general?</h3>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="moodLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Ánimo General (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">1 = Muy mal, 3 = Regular, 5 = Excelente</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="energyLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel de Energía (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">¿Qué tanta energía tienes?</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sleepQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calidad del Sueño (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">¿Cómo dormiste anoche?</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="motivation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel de Motivación (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">¿Qué tan motivado te sientes?</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Factores que Afectaron tu Estado de Ánimo</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMoodFactor}
                            onChange={(e) => setNewMoodFactor(e.target.value)}
                            placeholder="Ej: Trabajo estresante, ejercicio, música..."
                            className="flex-1 px-3 py-2 border rounded-md"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMoodFactor())}
                          />
                          <Button type="button" onClick={addMoodFactor}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {form.watch("moodFactors").map((factor, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeMoodFactor(index)}>
                              {factor} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 2: NIVELES DE ESTRÉS */}
                  {currentSection === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-orange-900">¿Qué te estresa y cómo lo manejas?</h3>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="stressLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel de Estrés General (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(6 - level)
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">1 = Muy relajado, 5 = Muy estresado</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stressType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Estrés Principal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="¿Qué tipo de estrés sientes?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fisico">Físico</SelectItem>
                                  <SelectItem value="mental">Mental</SelectItem>
                                  <SelectItem value="emocional">Emocional</SelectItem>
                                  <SelectItem value="social">Social</SelectItem>
                                  <SelectItem value="academico">Académico/Laboral</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="copingEffectiveness"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Efectividad de tus Estrategias (1-5)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-12 h-12 rounded text-sm font-medium ${
                                          field.value === level 
                                            ? getLevelColor5(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">¿Qué tan bien funcionaron?</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 3: CONCENTRACIÓN */}
                  {currentSection === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">¿Cómo está tu capacidad de enfoque?</h3>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="focusLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nivel de Enfoque (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1 flex-wrap">
                                    {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-8 h-8 rounded text-xs font-medium ${
                                          field.value === level 
                                            ? getLevelColor10(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">1 = Muy distraído, 10 = Muy concentrado</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mentalClarity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Claridad Mental (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1 flex-wrap">
                                    {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-8 h-8 rounded text-xs font-medium ${
                                          field.value === level 
                                            ? getLevelColor10(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">1 = Muy confuso, 10 = Muy claro</p>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 4: BIENESTAR MENTAL */}
                  {currentSection === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="h-5 w-5 text-pink-600" />
                        <h3 className="text-lg font-semibold text-pink-900">¿Cómo está tu bienestar psicológico integral?</h3>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="overallWellness"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bienestar General (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1 flex-wrap">
                                    {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-8 h-8 rounded text-xs font-medium ${
                                          field.value === level 
                                            ? getLevelColor10(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="selfEsteem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Autoestima (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="flex gap-1 flex-wrap">
                                    {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`w-8 h-8 rounded text-xs font-medium ${
                                          field.value === level 
                                            ? getLevelColor10(level) 
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 5: REFLEXIONES */}
                  {currentSection === 5 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Reflexiones del día</h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reflexiones Generales</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="¿Cómo fue tu día? ¿Qué aprendiste? ¿Qué te gustaría mejorar mañana?"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Navegación entre secciones */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                      disabled={currentSection === 1}
                    >
                      Anterior
                    </Button>
                    
                    {currentSection < 5 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentSection(Math.min(5, currentSection + 1))}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createDeepAssessmentMutation.isPending}>
                          {createDeepAssessmentMutation.isPending ? "Guardando..." : "Guardar Evaluación"}
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Historial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Evaluaciones Profundas
            </CardTitle>
            <CardDescription>
              Tus evaluaciones integrales recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deepAssessments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no tienes evaluaciones profundas registradas
              </p>
            ) : (
              <div className="space-y-4">
                {deepAssessments.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={getLevelColor5(entry.moodLevel)}>
                          Ánimo: {entry.moodLevel}/5
                        </Badge>
                        <Badge className={getLevelColor5(6 - entry.stressLevel)}>
                          Estrés: {entry.stressLevel}/5
                        </Badge>
                        <Badge className={getLevelColor10(entry.focusLevel)}>
                          Concentración: {entry.focusLevel}/10
                        </Badge>
                        <Badge className={getLevelColor10(entry.overallWellness)}>
                          Bienestar: {entry.overallWellness}/10
                        </Badge>
                      </div>
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvaluacionProfunda;