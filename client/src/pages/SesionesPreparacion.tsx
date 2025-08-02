
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import NavHeader from "@/components/NavHeader";
import CreateExerciseModal from "@/components/CreateExerciseModal";
import ExerciseManagement from "@/components/training/ExerciseManagement";
import SessionForm from "@/components/training/SessionForm";
import SessionCard from "@/components/training/SessionCard";
import SessionDetailsModal from "@/components/training/SessionDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Activity, Loader2, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

interface ExerciseRecord {
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes?: number;
  rest_seconds?: number;
  notes?: string;
  saved?: boolean;
}

const SesionesPreparacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    sesiones, 
    ejercicios, 
    isLoading, 
    createSessionMutation, 
    updateSessionMutation, 
    deleteSessionMutation,
    getSessionExercises
  } = useTrainingSessions(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [sesionAEditar, setSesionAEditar] = useState<SesionPreparacion | null>(null);
  const [sesionAVer, setSesionAVer] = useState<SesionPreparacion | null>(null);
  const [nuevaSesion, setNuevaSesion] = useState({
    date: new Date().toISOString().split('T')[0],
    session_type: "",
    duration_minutes: "",
    notes: "",
    intensity: 1
  });
  const [ejerciciosRealizados, setEjerciciosRealizados] = useState<ExerciseRecord[]>([]);
  const [ejerciciosExistentes, setEjerciciosExistentes] = useState<ExerciseRecord[]>([]);

  const nivelesIntensidad = [1, 2, 3, 5, 8, 13, 21, 34];

  const resetForm = () => {
    setNuevaSesion({ 
      date: new Date().toISOString().split('T')[0],
      session_type: "", 
      duration_minutes: "", 
      notes: "", 
      intensity: 1
    });
    setEjerciciosRealizados([]);
    setEjerciciosExistentes([]);
    setSesionAEditar(null);
  };

  const agregarSesion = () => {
    if (!nuevaSesion.session_type || !nuevaSesion.duration_minutes) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const sesionData = {
      date: nuevaSesion.date,
      session_type: nuevaSesion.session_type,
      duration_minutes: parseInt(nuevaSesion.duration_minutes),
      notes: nuevaSesion.notes,
      intensity: nuevaSesion.intensity
    };

    const ejerciciosParaGuardar = ejerciciosRealizados.map(({ saved, ...ejercicio }) => ejercicio);

    if (sesionAEditar) {
      updateSessionMutation.mutate(
        { 
          id: sesionAEditar.id, 
          sesion: sesionData, 
          ejerciciosRealizados: ejerciciosParaGuardar 
        },
        {
          onSuccess: () => {
            resetForm();
            setMostrarFormulario(false);
          }
        }
      );
    } else {
      createSessionMutation.mutate(
        { sesion: sesionData, ejerciciosRealizados: ejerciciosParaGuardar },
        {
          onSuccess: () => {
            resetForm();
            setMostrarFormulario(false);
          }
        }
      );
    }
  };

  const handleEditSesion = async (sesion: SesionPreparacion) => {
    setSesionAEditar(sesion);
    setNuevaSesion({
      date: sesion.date,
      session_type: sesion.session_type,
      duration_minutes: sesion.duration_minutes.toString(),
      notes: sesion.notes,
      intensity: sesion.intensity
    });
    
    const { data: existingExercises } = getSessionExercises(sesion.id);
    if (existingExercises && existingExercises.length > 0) {
      const exerciseRecords = existingExercises.map((record: any) => ({
        exercise_id: record.exercise_id,
        sets: record.sets,
        reps: record.reps,
        weight_kg: record.weight_kg,
        duration_minutes: record.duration_minutes,
        rest_seconds: record.rest_seconds,
        notes: record.notes,
        saved: true
      }));
      setEjerciciosRealizados(exerciseRecords);
      setEjerciciosExistentes(exerciseRecords);
    } else {
      setEjerciciosRealizados([]);
      setEjerciciosExistentes([]);
    }
    
    setMostrarFormulario(true);
    setSesionAVer(null);
  };

  const handleDeleteSesion = (id: string) => {
    deleteSessionMutation.mutate(id);
  };

  const handleNuevaSesion = () => {
    resetForm();
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    resetForm();
    setMostrarFormulario(false);
  };

  const agregarEjercicio = () => {
    setEjerciciosRealizados([...ejerciciosRealizados, {
      exercise_id: "",
      sets: 0,
      reps: 0,
      weight_kg: 0,
      duration_minutes: 0,
      rest_seconds: 0,
      notes: "",
      saved: false
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

  const guardarEjercicio = (index: number) => {
    const nuevosEjercicios = [...ejerciciosRealizados];
    if (nuevosEjercicios[index].exercise_id) {
      nuevosEjercicios[index].saved = true;
      setEjerciciosRealizados(nuevosEjercicios);
    } else {
      toast({
        title: "Error",
        description: "Debes seleccionar un ejercicio antes de guardarlo.",
        variant: "destructive",
      });
    }
  };

  const editarEjercicio = (index: number) => {
    const nuevosEjercicios = [...ejerciciosRealizados];
    nuevosEjercicios[index].saved = false;
    setEjerciciosRealizados(nuevosEjercicios);
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
        <Tabs defaultValue="sesiones" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sesiones" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
            <TabsTrigger value="ejercicios" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Gestión de Ejercicios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sesiones" className="space-y-4">
            <div className="flex gap-2 mb-6">
              <Button 
                onClick={handleNuevaSesion}
                className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Sesión
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
                isSubmitting={createSessionMutation.isPending || updateSessionMutation.isPending}
                onSubmit={agregarSesion}
                onCancel={handleCancelar}
                onAgregarEjercicio={agregarEjercicio}
                onActualizarEjercicio={actualizarEjercicio}
                onEliminarEjercicio={eliminarEjercicio}
                onGuardarEjercicio={guardarEjercicio}
                onEditarEjercicio={editarEjercicio}
                isEditing={!!sesionAEditar}
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
                sesiones.map((sesion: any) => (
                  <SessionCard 
                    key={sesion.id} 
                    sesion={sesion}
                    onView={setSesionAVer}
                    onEdit={handleEditSesion}
                    onDelete={handleDeleteSesion}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="ejercicios">
            <ExerciseManagement />
          </TabsContent>
        </Tabs>

        <SessionDetailsModal
          sesion={sesionAVer}
          isOpen={!!sesionAVer}
          onClose={() => setSesionAVer(null)}
          onEdit={handleEditSesion}
          onDelete={handleDeleteSesion}
        />
      </div>
    </div>
  );
};

export default SesionesPreparacion;
