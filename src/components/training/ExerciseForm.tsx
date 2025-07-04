
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  notes?: string;
  saved?: boolean;
}

interface ExerciseFormProps {
  ejercicio: ExerciseRecord;
  index: number;
  ejercicios: Exercise[];
  onUpdate: (index: number, campo: string, valor: any) => void;
  onSave: (index: number) => void;
  onDelete: (index: number) => void;
}

const ExerciseForm = ({ ejercicio, index, ejercicios, onUpdate, onSave, onDelete }: ExerciseFormProps) => {
  return (
    <Card className="border-[#C5A46C]">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[#1A1A1A]">Ejercicio</Label>
            <Select 
              value={ejercicio.exercise_id} 
              onValueChange={(value) => onUpdate(index, 'exercise_id', value)}
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
              onChange={(e) => onUpdate(index, 'sets', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C]"
            />
          </div>
          <div>
            <Label className="text-[#1A1A1A]">Repeticiones</Label>
            <Input
              type="number"
              value={ejercicio.reps || ''}
              onChange={(e) => onUpdate(index, 'reps', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C]"
            />
          </div>
          <div>
            <Label className="text-[#1A1A1A]">Peso (kg)</Label>
            <Input
              type="number"
              step="0.5"
              value={ejercicio.weight_kg || ''}
              onChange={(e) => onUpdate(index, 'weight_kg', parseFloat(e.target.value) || 0)}
              className="border-[#C5A46C]"
            />
          </div>
          <div>
            <Label className="text-[#1A1A1A]">Duración (min)</Label>
            <Input
              type="number"
              value={ejercicio.duration_minutes || ''}
              onChange={(e) => onUpdate(index, 'duration_minutes', parseInt(e.target.value) || 0)}
              className="border-[#C5A46C]"
            />
          </div>
        </div>
        <div>
          <Label className="text-[#1A1A1A]">Notas del ejercicio</Label>
          <Textarea
            value={ejercicio.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className="border-[#C5A46C]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => onSave(index)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
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
      </CardContent>
    </Card>
  );
};

export default ExerciseForm;
