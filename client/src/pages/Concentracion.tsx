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
import { Brain, Calendar, Plus, TrendingUp, Target, Focus, Clock, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NavHeader from "@/components/NavHeader";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { ConcentrationEntry, InsertConcentrationEntry } from "@shared/schema";

const concentrationSchema = z.object({
  date: z.string(),
  focusLevel: z.number().min(1).max(10),
  attentionSpan: z.number().min(1).max(10),
  mentalClarity: z.number().min(1).max(10),
  distractionLevel: z.number().min(1).max(10),
  concentrationTechniques: z.array(z.string()).default([]),
  distractionSources: z.array(z.string()).default([]),
  taskCompleted: z.number().min(1).max(10).optional(),
  environment: z.string().optional(),
  timeOfDay: z.string().optional(),
  exerciseDuration: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type ConcentrationFormData = z.infer<typeof concentrationSchema>;

const Concentracion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTechnique, setNewTechnique] = useState("");
  const [newDistraction, setNewDistraction] = useState("");

  const form = useForm<ConcentrationFormData>({
    resolver: zodResolver(concentrationSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      focusLevel: 5,
      attentionSpan: 5,
      mentalClarity: 5,
      distractionLevel: 5,
      concentrationTechniques: [],
      distractionSources: [],
      taskCompleted: 5,
      environment: "",
      timeOfDay: "",
      exerciseDuration: 0,
      notes: "",
    },
  });

  const { data: concentrationEntries = [] } = useQuery<ConcentrationEntry[]>({
    queryKey: ["/api/concentration-entries"],
  });

  const createConcentrationMutation = useMutation({
    mutationFn: async (data: InsertConcentrationEntry) => {
      const response = await fetch("/api/concentration-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create concentration entry");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "¡Evaluación guardada!", description: "Tu evaluación de concentración ha sido registrada." });
      queryClient.invalidateQueries({ queryKey: ["/api/concentration-entries"] });
      setIsFormOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar tu evaluación.", variant: "destructive" });
    },
  });

  const todayEntry = concentrationEntries.find(entry => 
    isToday(new Date(entry.date))
  );

  const onSubmit = (data: ConcentrationFormData) => {
    createConcentrationMutation.mutate(data as InsertConcentrationEntry);
  };

  const addTechnique = () => {
    if (newTechnique.trim()) {
      const current = form.getValues("concentrationTechniques");
      form.setValue("concentrationTechniques", [...current, newTechnique.trim()]);
      setNewTechnique("");
    }
  };

  const removeTechnique = (index: number) => {
    const current = form.getValues("concentrationTechniques");
    form.setValue("concentrationTechniques", current.filter((_, i) => i !== index));
  };

  const addDistraction = () => {
    if (newDistraction.trim()) {
      const current = form.getValues("distractionSources");
      form.setValue("distractionSources", [...current, newDistraction.trim()]);
      setNewDistraction("");
    }
  };

  const removeDistraction = (index: number) => {
    const current = form.getValues("distractionSources");
    form.setValue("distractionSources", current.filter((_, i) => i !== index));
  };

  const levelColors = {
    1: "bg-red-100 text-red-800",
    2: "bg-red-50 text-red-700", 
    3: "bg-orange-100 text-orange-800",
    4: "bg-yellow-100 text-yellow-800",
    5: "bg-blue-100 text-blue-800",
    6: "bg-blue-200 text-blue-900",
    7: "bg-green-100 text-green-800",
    8: "bg-green-200 text-green-900",
    9: "bg-emerald-100 text-emerald-800",
    10: "bg-emerald-200 text-emerald-900"
  };

  const getLevelColor = (level: number) => levelColors[level as keyof typeof levelColors] || "bg-gray-100 text-gray-800";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="Concentración"
        subtitle="Evalúa y mejora tu capacidad de concentración y enfoque mental"
      />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          {todayEntry ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-green-900">¡Ya registraste tu concentración hoy!</h3>
              </div>
              <p className="text-green-700 text-sm">
                Nivel de enfoque: <Badge className={getLevelColor(todayEntry.focusLevel)}>{todayEntry.focusLevel}/10</Badge>
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evaluación de Concentración de Hoy
                </CardTitle>
                <CardDescription>
                  Evalúa tu capacidad de concentración y las técnicas que utilizas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="w-full"
                  disabled={createConcentrationMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Realizar Evaluación de Concentración
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <Focus className="h-5 w-5" />
                ¿Cómo está tu concentración hoy?
              </CardTitle>
              <CardDescription>
                Evalúa diferentes aspectos de tu capacidad de concentración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Evaluación principal de concentración */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="focusLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Nivel de Enfoque (1-10)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={`w-8 h-8 rounded text-xs font-medium ${
                                      field.value === level 
                                        ? getLevelColor(level) 
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attentionSpan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duración de Atención (1-10)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={`w-8 h-8 rounded text-xs font-medium ${
                                      field.value === level 
                                        ? getLevelColor(level) 
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">1 = Muy corta, 10 = Muy prolongada</p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mentalClarity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Claridad Mental (1-10)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={`w-8 h-8 rounded text-xs font-medium ${
                                      field.value === level 
                                        ? getLevelColor(level) 
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="distractionLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Distracción (1-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={`w-8 h-8 rounded text-xs font-medium ${
                                      field.value === level 
                                        ? getLevelColor(11 - level) // Invertido para distracciones
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">1 = Sin distracciones, 10 = Muy distraído</p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Técnicas de concentración */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Técnicas de Concentración Utilizadas</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTechnique}
                        onChange={(e) => setNewTechnique(e.target.value)}
                        placeholder="Ej: Respiración profunda, Meditación..."
                        className="flex-1 px-3 py-2 border rounded-md"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
                      />
                      <Button type="button" onClick={addTechnique}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("concentrationTechniques").map((technique, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTechnique(index)}>
                          {technique} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Fuentes de distracción */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fuentes de Distracción</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDistraction}
                        onChange={(e) => setNewDistraction(e.target.value)}
                        placeholder="Ej: Ruido, Pensamientos, Teléfono..."
                        className="flex-1 px-3 py-2 border rounded-md"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDistraction())}
                      />
                      <Button type="button" onClick={addDistraction}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("distractionSources").map((distraction, index) => (
                        <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeDistraction(index)}>
                          {distraction} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Información adicional */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="taskCompleted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tareas Completadas (1-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5,6,7,8,9,10].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={`w-8 h-8 rounded text-xs font-medium ${
                                      field.value === level 
                                        ? getLevelColor(level) 
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">¿Qué tan bien completaste tus tareas?</p>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exerciseDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ejercicio de Concentración (minutos)</FormLabel>
                          <FormControl>
                            <input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ambiente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="¿Dónde te concentraste?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casa">Casa</SelectItem>
                              <SelectItem value="oficina">Oficina</SelectItem>
                              <SelectItem value="biblioteca">Biblioteca</SelectItem>
                              <SelectItem value="cafe">Café</SelectItem>
                              <SelectItem value="aire-libre">Aire libre</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeOfDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Momento del Día</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="¿Cuándo te concentraste mejor?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="madrugada">Madrugada (00:00-06:00)</SelectItem>
                              <SelectItem value="manana">Mañana (06:00-12:00)</SelectItem>
                              <SelectItem value="tarde">Tarde (12:00-18:00)</SelectItem>
                              <SelectItem value="noche">Noche (18:00-24:00)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reflexiones Adicionales</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Qué observaste sobre tu concentración hoy? ¿Qué técnicas funcionaron mejor?"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createConcentrationMutation.isPending}>
                      {createConcentrationMutation.isPending ? "Guardando..." : "Guardar Evaluación"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Historial de evaluaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Concentración
            </CardTitle>
            <CardDescription>
              Tus evaluaciones recientes de concentración
            </CardDescription>
          </CardHeader>
          <CardContent>
            {concentrationEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no tienes evaluaciones de concentración registradas
              </p>
            ) : (
              <div className="space-y-4">
                {concentrationEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                      <div className="flex gap-2">
                        <Badge className={getLevelColor(entry.focusLevel)}>
                          Enfoque: {entry.focusLevel}/10
                        </Badge>
                        <Badge className={getLevelColor(entry.mentalClarity)}>
                          Claridad: {entry.mentalClarity}/10
                        </Badge>
                      </div>
                    </div>
                    
                    {entry.concentrationTechniques && entry.concentrationTechniques.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Técnicas: </span>
                        <span className="text-sm text-gray-600">
                          {entry.concentrationTechniques.join(", ")}
                        </span>
                      </div>
                    )}

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

export default Concentracion;