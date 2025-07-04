
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
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

  const createMutation = useMutation({
    mutationFn: async (sesion: Omit<SesionPreparacion, 'id'>) => {
      const { data, error } = await supabase
        .from('training_sessions')
        .insert([{
          ...sesion,
          user_id: user!.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_sessions'] });
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

    createMutation.mutate({
      date: nuevaSesion.date,
      session_type: nuevaSesion.session_type,
      duration_minutes: parseInt(nuevaSesion.duration_minutes),
      notes: nuevaSesion.notes,
      intensity: nuevaSesion.intensity
    });
  };

  const getIntensidadColor = (intensidad: number) => {
    if (intensidad <= 2) return "bg-green-100 text-green-800";
    if (intensidad <= 5) return "bg-yellow-100 text-yellow-800";
    if (intensidad <= 13) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Preparación Física" 
        subtitle="Sesiones de acondicionamiento físico"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nueva Sesión de Preparación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={nuevaSesion.date}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="session_type">Tipo de Entrenamiento</Label>
                <Input
                  id="session_type"
                  placeholder="Cardio, Fuerza, Flexibilidad, etc."
                  value={nuevaSesion.session_type}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, session_type: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  placeholder="60"
                  value={nuevaSesion.duration_minutes}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, duration_minutes: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="intensity">Intensidad (Escala Fibonacci)</Label>
                <Select value={nuevaSesion.intensity.toString()} onValueChange={(value) => setNuevaSesion({...nuevaSesion, intensity: parseInt(value)})}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Observaciones sobre la sesión..."
                  value={nuevaSesion.notes}
                  onChange={(e) => setNuevaSesion({...nuevaSesion, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={agregarSesion}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sesiones.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay sesiones registradas aún</p>
                <p className="text-sm text-slate-500">Agrega tu primera sesión de preparación física</p>
              </CardContent>
            </Card>
          ) : (
            sesiones.map((sesion) => (
              <Card key={sesion.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{sesion.session_type}</CardTitle>
                      <p className="text-sm text-slate-600">{sesion.date}</p>
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
                        <h4 className="font-medium text-sm text-slate-700">Notas:</h4>
                        <p className="text-slate-600">{sesion.notes}</p>
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
