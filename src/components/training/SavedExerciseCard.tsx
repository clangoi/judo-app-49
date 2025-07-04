
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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
  saved?: boolean;
}

interface SavedExerciseCardProps {
  ejercicio: ExerciseRecord;
  index: number;
  ejercicios: Exercise[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const SavedExerciseCard = ({ ejercicio, index, ejercicios, onEdit, onDelete }: SavedExerciseCardProps) => {
  const getExerciseName = (exerciseId: string) => {
    const exercise = ejercicios.find((ej: any) => ej.id === exerciseId);
    return exercise ? exercise.name : 'Ejercicio no encontrado';
  };

  const getExerciseSummary = (ejercicio: ExerciseRecord) => {
    const parts = [];
    if (ejercicio.sets) parts.push(`${ejercicio.sets} series`);
    if (ejercicio.reps) parts.push(`${ejercicio.reps} reps`);
    if (ejercicio.weight_kg) parts.push(`${ejercicio.weight_kg}kg`);
    if (ejercicio.duration_minutes) parts.push(`${ejercicio.duration_minutes}min`);
    return parts.join(' • ');
  };

  return (
    <Card className="border-green-500 bg-green-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-[#1A1A1A]">{getExerciseName(ejercicio.exercise_id)}</h4>
            <p className="text-sm text-[#575757] mt-1">{getExerciseSummary(ejercicio)}</p>
            {ejercicio.notes && (
              <p className="text-sm text-[#575757] mt-1 italic">"{ejercicio.notes}"</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onEdit(index)}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              type="button"
              onClick={() => onDelete(index)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedExerciseCard;
