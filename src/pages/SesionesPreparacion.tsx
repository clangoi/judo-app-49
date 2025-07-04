
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import CreateExerciseModal from "@/components/CreateExerciseModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Activity, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

interface Exercise {
  id: string;
  name: string;
}

interface ExerciseRecord {
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  notes?: string;
}

const SesionesPreparacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({
    date: new Date().toISOString().split('T')[0],
    session_type: "",
    duration_minutes: "",
    notes: "",
    intensity: 1
  });
  const [ejerciciosRealizados, setEjerciciosRealizados] = useState<ExerciseRecord[]>([]);

  // Secuencia de Fibonacci hasta 34: 1, 1, 2, 3, 5, 8, 13, 21, 34
  const nivelesIntensidad = [1, 2, 3, 5, 8, 13, 21, 34];

  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ['training_sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: ejercicios = [] } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises' as any)
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sesion: Omit<SesionPreparacion, 'id'>) => {
      const { data: sessionData, error: sessionError } = await supabase
        .from('training_sessions')
        .insert([{
          ...sesion,
          user_id: user!.id
        }])
        .select()
        .single();
      
      if (sessionError) throw sessionError;

      // Create exercise records
      for (const ejercicio of ejerciciosRealizados) {
        if (ejercicio.exercise_id) {
          const { error: recordError } = await supabase
            .from('exercise_records' as any)
            .insert([{
              ...ejercicio,
              training_session_id: sessionData.id,
              user_id: user!.id,
              date: sesion.date
            }]);
          
          if (recordError) throw recordError;
        }
      }
      
      return sessionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Sesión guardada",
        description: "Tu sesión de preparación ha sido registrada exitosamente.",
      });
      setNuevaSesion({ 
        date: new Date().toISOString().split('T')[0],
        session_type: "", 
        duration_minutes: "", 
        notes: "", 
        intensity: 1
      });
      setEjerciciosRealizados([]);
      setMostrarFormulario(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la sesión.",
        variant: "destructive",
      });
    }
  });

  const agregarSesion = () => {
    if (!nuevaSesion.session_type || !nuevaSesion.duration_minutes) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      date: nuevaSesion.date,
      session_type: nuevaSesion.session_type,
      duration_minutes: parseInt(nuevaSesion.duration_minutes),
      notes: nuevaSesion.notes,
      intensity: nuevaSesion.intensity
    });
  };

  const agregarEjercicio = () => {
    setEjerciciosRealizados([...ejerciciosRealizados, {
      exercise_id: "",
      sets: 0,
      reps: 0,
      weight_kg: 0,
      duration_minutes: 0,
      notes: ""
    }]);
  };

  const actualizarEjercicio = (index: number, campo: string, valor: any) => {
    const nuevosEjercicios = [...ejerciciosRealizados];
    nuevosEjercicios[index] = { ...nuevosEjercicios[index], [campo]: valor };
    setEjerciciosRealizados(nuevosEjercicios);
  };

  const eliminarEjercicio = (index: number) => {
    setEjerciciosRealizados(ejerciciosRealizados.filter((_, i) => i !== index));
  };

  const getIntensidadColor = (intensidad: number) => {
    if (intensidad <= 2) return "bg-green-100 text-green-800";
    if (intensidad <= 5) return "bg-yellow-100 text-yellow-800";
    if (intensidad <= 13) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Preparación Física" 
        subtitle="Sesiones de acondicionamiento físico"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sesión
          </Button>
          <CreateExerciseModal />
        </div>

        {mostrarFormulario && (
          <Card className="mb-6 bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Nueva Sesión de Preparación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-[#1A1A1A]">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={nuevaSesion.date}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, date: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div>
                <Label htmlFor="session_type" className="text-[#1A1A1A]">Tipo de Entrenamiento</Label>
                <Input
                  id="session_type"
                  placeholder="Cardio, Fuerza, Flexibilidad, etc."
                  value={nuevaSesion.session_type}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, session_type: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes" className="text-[#1A1A1A]">Duración (minutos)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  placeholder="60"
                  value={nuevaSesion.duration_minutes}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, duration_minutes: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div>
                <Label htmlFor="intensity" className="text-[#1A1A1A]">Intensidad (Escala Fibonacci)</Label>
                <Select value={nuevaSesion.intensity.toString()} onValueChange={(value) => setNuevaSesion({...nuevaSesion, intensity: parseInt(value)})}>
                  <SelectTrigger className="border-[#C5A46C] focus:border-[#C5A46C]">
                    <SelectValue placeholder="Selecciona la intensidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelesIntensidad.map((nivel) => (
                      <SelectItem key={nivel} value={nivel.toString()}>
                        Nivel {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sección de ejercicios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[#1A1A1A]">Ejercicios Realizados</Label>
                  <Button
                    type="button"
                    onClick={agregarEjercicio}
                    className="bg-[#575757] hover:bg-[#4A4A4A] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Ejercicio
                  </Button>
                </div>

                {ejerciciosRealizados.map((ejercicio, index) => (
                  <Card key={index} className="p-4 border border-[#C5A46C]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#1A1A1A]">Ejercicio</Label>
                        <Select 
                          value={ejercicio.exercise_id} 
                          onValueChange={(value) => actualizarEjercicio(index, 'exercise_id', value)}
                        >
                          <SelectTrigger className="border-[#C5A46C]">
                            <SelectValue placeholder="Seleccionar ejercicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {ejercicios.map((ej: any) => (
                              <SelectItem key={ej.id} value={ej.id}>
                                {ej.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A]">Series</Label>
                        <Input
                          type="number"
                          value={ejercicio.sets || ''}
                          onChange={(e) => actualizarEjercicio(index, 'sets', parseInt(e.target.value) || 0)}
                          className="border-[#C5A46C]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A]">Repeticiones</Label>
                        <Input
                          type="number"
                          value={ejercicio.reps || ''}
                          onChange={(e) => actualizarEjercicio(index, 'reps', parseInt(e.target.value) || 0)}
                          className="border-[#C5A46C]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A]">Peso (kg)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={ejercicio.weight_kg || ''}
                          onChange={(e) => actualizarEjercicio(index, 'weight_kg', parseFloat(e.target.value) || 0)}
                          className="border-[#C5A46C]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#1A1A1A]">Duración (min)</Label>
                        <Input
                          type="number"
                          value={ejercicio.duration_minutes || ''}
                          onChange={(e) => actualizarEjercicio(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                          className="border-[#C5A46C]"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-[#1A1A1A]">Notas del ejercicio</Label>
                      <Textarea
                        value={ejercicio.notes || ''}
                        onChange={(e) => actualizarEjercicio(index, 'notes', e.target.value)}
                        className="border-[#C5A46C]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => eliminarEjercicio(index)}
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                    >
                      Eliminar
                    </Button>
                  </Card>
                ))}
              </div>

              <div>
                <Label htmlFor="notes" className="text-[#1A1A1A]">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones sobre la sesión..."
                  value={nuevaSesion.notes}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, notes: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={agregarSesion}
                  disabled={createSessionMutation.isPending}
                  className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarFormulario(false)}
                  className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sesiones.length === 0 ? (
            <Card className="bg-white border-[#C5A46C]">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-[#575757] mb-4" />
                <p className="text-[#575757]">No hay sesiones registradas aún</p>
                <p className="text-sm text-[#575757]">Agrega tu primera sesión de preparación física</p>
              </CardContent>
            </Card>
          ) : (
            sesiones.map((sesion) => (
              <Card key={sesion.id} className="bg-white border-[#C5A46C]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-[#1A1A1A]">{sesion.session_type}</CardTitle>
                      <p className="text-sm text-[#575757]">{sesion.date}</p>
                    </div>
                    <div className="flex gap-2">
                      {sesion.intensity && (
                        <div className={`px-2 py-1 rounded-full text-sm ${getIntensidadColor(sesion.intensity)}`}>
                          Nivel {sesion.intensity}
                        </div>
                      )}
                      {sesion.duration_minutes && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          <Clock className="h-3 w-3" />
                          {sesion.duration_minutes} min
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sesion.notes && (
                      <div>
                        <h4 className="font-medium text-sm text-[#1A1A1A]">Notas:</h4>
                        <p className="text-[#575757]">{sesion.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SesionesPreparacion;
