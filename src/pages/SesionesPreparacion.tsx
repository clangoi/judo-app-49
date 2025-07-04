
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import NavHeader from "@/components/NavHeader";
import CreateExerciseModal from "@/components/CreateExerciseModal";
import SessionForm from "@/components/training/SessionForm";
import SessionCard from "@/components/training/SessionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExerciseRecord {
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  notes?: string;
  saved?: boolean;
}

const SesionesPreparacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sesiones, ejercicios, isLoading, createSessionMutation } = useTrainingSessions(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({
    date: new Date().toISOString().split('T')[0],
    session_type: "",
    duration_minutes: "",
    notes: "",
    intensity: 1
  });
  const [ejerciciosRealizados, setEjerciciosRealizados] = useState<ExerciseRecord[]>([]);

  const nivelesIntensidad = [1, 2, 3, 5, 8, 13, 21, 34];

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
      sesion: {
        date: nuevaSesion.date,
        session_type: nuevaSesion.session_type,
        duration_minutes: parseInt(nuevaSesion.duration_minutes),
        notes: nuevaSesion.notes,
        intensity: nuevaSesion.intensity
      },
      ejerciciosRealizados
    });

    // Reset form after successful submission
    if (createSessionMutation.isSuccess) {
      setNuevaSesion({ 
        date: new Date().toISOString().split('T')[0],
        session_type: "", 
        duration_minutes: "", 
        notes: "", 
        intensity: 1
      });
      setEjerciciosRealizados([]);
      setMostrarFormulario(false);
    }
  };

  const agregarEjercicio = () => {
    setEjerciciosRealizados([...ejerciciosRealizados, {
      exercise_id: "",
      sets: 0,
      reps: 0,
      weight_kg: 0,
      duration_minutes: 0,
      notes: "",
      saved: false
    }]);
  };

  const actualizarEjercicio = (index: number, campo: string, valor: any) => {
    const nuevosEjercicios = [...ejerciciosRealizados];
    nuevosEjercicios[index] = { ...nuevosEjercicios[index], [campo]: valor, saved: false };
    setEjerciciosRealizados(nuevosEjercicios);
  };

  const guardarEjercicio = (index: number) => {
    const ejercicio = ejerciciosRealizados[index];
    if (!ejercicio.exercise_id) {
      toast({
        title: "Error",
        description: "Por favor selecciona un ejercicio.",
        variant: "destructive",
      });
      return;
    }
    
    const nuevosEjercicios = [...ejerciciosRealizados];
    nuevosEjercicios[index] = { ...nuevosEjercicios[index], saved: true };
    setEjerciciosRealizados(nuevosEjercicios);
    
    toast({
      title: "Ejercicio guardado",
      description: "El ejercicio se ha guardado temporalmente.",
    });
  };

  const eliminarEjercicio = (index: number) => {
    setEjerciciosRealizados(ejerciciosRealizados.filter((_, i) => i !== index));
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
          <SessionForm
            nuevaSesion={nuevaSesion}
            setNuevaSesion={setNuevaSesion}
            ejerciciosRealizados={ejerciciosRealizados}
            ejercicios={ejercicios}
            nivelesIntensidad={nivelesIntensidad}
            isSubmitting={createSessionMutation.isPending}
            onSubmit={agregarSesion}
            onCancel={() => setMostrarFormulario(false)}
            onAgregarEjercicio={agregarEjercicio}
            onActualizarEjercicio={actualizarEjercicio}
            onGuardarEjercicio={guardarEjercicio}
            onEliminarEjercicio={eliminarEjercicio}
          />
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
              <SessionCard key={sesion.id} sesion={sesion} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SesionesPreparacion;
