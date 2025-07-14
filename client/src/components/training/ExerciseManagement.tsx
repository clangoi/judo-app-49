
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExercises } from "@/hooks/useExercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, Dumbbell } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ExerciseManagement = () => {
  const { user } = useAuth();
  const { exercises, isLoading, createExerciseMutation, deleteExerciseMutation } = useExercises(user?.id);
  const [newExerciseName, setNewExerciseName] = useState("");

  const handleCreateExercise = () => {
    if (!newExerciseName.trim()) return;
    
    createExerciseMutation.mutate(newExerciseName.trim(), {
      onSuccess: () => {
        setNewExerciseName("");
      }
    });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    deleteExerciseMutation.mutate(exerciseId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  return (
    <Card className="bg-white border-[#C5A46C]">
      <CardHeader>
        <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[#C5A46C]" />
          Gestión de Ejercicios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crear nuevo ejercicio */}
        <div className="space-y-2">
          <Label htmlFor="new-exercise" className="text-[#1A1A1A]">Crear Nuevo Ejercicio</Label>
          <div className="flex gap-2">
            <Input
              id="new-exercise"
              placeholder="Nombre del ejercicio..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateExercise()}
            />
            <Button
              onClick={handleCreateExercise}
              disabled={!newExerciseName.trim() || createExerciseMutation.isPending}
              className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
            >
              {createExerciseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Lista de ejercicios */}
        <div className="space-y-2">
          <Label className="text-[#1A1A1A]">Ejercicios Existentes ({exercises.length})</Label>
          {exercises.length === 0 ? (
            <p className="text-[#575757] text-sm italic">No tienes ejercicios creados aún.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-[#1A1A1A] font-medium">{exercise.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-3"
                        disabled={deleteExerciseMutation.isPending}
                      >
                        {deleteExerciseMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el ejercicio "{exercise.name}".
                          {"\n\n"}
                          Nota: No se puede eliminar si tiene registros asociados en sesiones de entrenamiento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseManagement;
