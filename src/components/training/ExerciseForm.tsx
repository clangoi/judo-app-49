
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2 } from "lucide-react";

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
  rest_seconds?: number;
  notes?: string;
  saved?: boolean;
}

interface ExerciseFormProps {
  ejercicio: ExerciseRecord;
  index: number;
  ejercicios: Exercise[];
  onUpdate: (index: number, campo: string, valor: any) => void;
  onDelete: (index: number) => void;
  onSave?: (index: number) => void;
}

const ExerciseForm = ({ ejercicio, index, ejercicios, onUpdate, onDelete, onSave }: ExerciseFormProps) => {
  const getExerciseName = (exerciseId: string) => {
    const exercise = ejercicios.find((ej: any) => ej.id === exerciseId);
    return exercise ? exercise.name : '';
  };

  return (
    <Card className="border-blue-500 bg-blue-50">
      <CardContent className="p-4 space-y-3">
        <div>
          <Label className="text-sm font-medium text-[#1A1A1A]">Ejercicio</Label>
          <Select value={ejercicio.exercise_id} onValueChange={(value) => onUpdate(index, 'exercise_id', value)}>
            <SelectTrigger className="border-[#C5A46C] focus:border-[#C5A46C]">
              <SelectValue placeholder="Selecciona un ejercicio" />
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-[#1A1A1A]">Series</Label>
            <Input
              type="number"
              placeholder="0"
              value={ejercicio.sets || ''}
              onChange={(e) => onUpdate(index, 'sets', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-[#1A1A1A]">Repeticiones</Label>
            <Input
              type="number"
              placeholder="0"
              value={ejercicio.reps || ''}
              onChange={(e) => onUpdate(index, 'reps', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-[#1A1A1A]">Peso (kg)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0"
              value={ejercicio.weight_kg || ''}
              onChange={(e) => onUpdate(index, 'weight_kg', parseFloat(e.target.value) || 0)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-[#1A1A1A]">Duración (min)</Label>
            <Input
              type="number"
              placeholder="0"
              value={ejercicio.duration_minutes || ''}
              onChange={(e) => onUpdate(index, 'duration_minutes', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-[#1A1A1A]">Tiempo de descanso (seg)</Label>
          <Input
            type="number"
            placeholder="0"
            value={ejercicio.rest_seconds || ''}
            onChange={(e) => onUpdate(index, 'rest_seconds', parseInt(e.target.value) || 0)}
            className="border-[#C5A46C] focus:border-[#C5A46C]"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-[#1A1A1A]">Notas</Label>
          <Textarea
            placeholder="Observaciones sobre el ejercicio..."
            value={ejercicio.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className="border-[#C5A46C] focus:border-[#C5A46C] resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-2">
          {onSave && (
            <Button
              type="button"
              onClick={() => onSave(index)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onDelete(index)}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseForm;
