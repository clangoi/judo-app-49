
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJudoSessions } from "@/hooks/useJudoSessions";
import NavHeader from "@/components/NavHeader";
import JudoSessionCard from "@/components/training/JudoSessionCard";
import JudoTrainingForm from "@/components/training/JudoTrainingForm";
import JudoTrainingDetails from "@/components/training/JudoTrainingDetails";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Loader2 } from "lucide-react";

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoJudo {
  id: string;
  fecha: string;
  tipo: string;
  duracion: number;
  tecnicasPracticadas: string;
  queFunciono: string;
  queNoFunciono: string;
  comentarios?: string;
  randory?: RandoryInfo;
  videoUrl?: string;
}

const EntrenamientosJudo = () => {
  const { user } = useAuth();
  const { sessions, isLoading, createSessionMutation, updateSessionMutation, deleteSessionMutation } = useJudoSessions(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoEntrenamiento, setEditandoEntrenamiento] = useState<EntrenamientoJudo | null>(null);
  const [entrenamientoDetalle, setEntrenamientoDetalle] = useState<EntrenamientoJudo | null>(null);

  const resetForm = () => {
    setMostrarFormulario(false);
    setEditandoEntrenamiento(null);
  };

  const iniciarEdicion = (entrenamiento: EntrenamientoJudo) => {
    setEditandoEntrenamiento(entrenamiento);
    setMostrarFormulario(true);
  };

  const handleEliminar = (entrenamiento: EntrenamientoJudo) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.")) {
      deleteSessionMutation.mutate(entrenamiento.id);
    }
  };

  const handleFormSubmit = (entrenamientoData: any) => {
    if (editandoEntrenamiento) {
      updateSessionMutation.mutate({
        id: editandoEntrenamiento.id,
        entrenamiento: entrenamientoData
      }, {
        onSuccess: () => resetForm()
      });
    } else {
      createSessionMutation.mutate(entrenamientoData, {
        onSuccess: () => resetForm()
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Entrenamientos" 
        subtitle="Registro y análisis de entrenamientos"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Entrenamiento
        </Button>

        {mostrarFormulario && (
          <JudoTrainingForm
            editandoEntrenamiento={editandoEntrenamiento}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
            isLoading={createSessionMutation.isPending || updateSessionMutation.isPending}
          />
        )}

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay entrenamientos registrados aún</p>
                <p className="text-sm text-slate-500">Agrega tu primer entrenamiento de judo</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((entrenamiento) => (
              <JudoSessionCard
                key={entrenamiento.id}
                entrenamiento={entrenamiento}
                onView={setEntrenamientoDetalle}
                onEdit={iniciarEdicion}
                onDelete={handleEliminar}
                isDeleting={deleteSessionMutation.isPending}
              />
            ))
          )}
        </div>

        <JudoTrainingDetails
          entrenamiento={entrenamientoDetalle}
          onClose={() => setEntrenamientoDetalle(null)}
        />
      </div>
    </div>
  );
};

export default EntrenamientosJudo;
