
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import ExerciseForm from "./ExerciseForm";
import SavedExerciseCard from "./SavedExerciseCard";

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

interface NuevaSesion {
  date: string;
  session_type: string;
  duration_minutes: string;
  notes: string;
  intensity: number;
}

interface SessionFormProps {
  nuevaSesion: NuevaSesion;
  setNuevaSesion: (sesion: NuevaSesion) => void;
  ejerciciosRealizados: ExerciseRecord[];
  ejercicios: Exercise[];
  nivelesIntensidad: number[];
  isSubmitting: boolean;
  isEditing?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onAgregarEjercicio: () => void;
  onActualizarEjercicio: (index: number, campo: string, valor: any) => void;
  onEliminarEjercicio: (index: number) => void;
  onGuardarEjercicio?: (index: number) => void;
  onEditarEjercicio?: (index: number) => void;
}

const SessionForm = ({
  nuevaSesion,
  setNuevaSesion,
  ejerciciosRealizados,
  ejercicios,
  nivelesIntensidad,
  isSubmitting,
  isEditing = false,
  onSubmit,
  onCancel,
  onAgregarEjercicio,
  onActualizarEjercicio,
  onEliminarEjercicio,
  onGuardarEjercicio,
  onEditarEjercicio
}: SessionFormProps) => {
  return (
    <Card className="mb-6 bg-white border-[#C5A46C]">
      <CardHeader>
        <CardTitle className="text-[#1A1A1A]">
          {isEditing ? "Editar Sesión de Preparación" : "Nueva Sesión de Preparación"}
        </CardTitle>
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[#1A1A1A]">Ejercicios Realizados</Label>
            <Button
              type="button"
              onClick={onAgregarEjercicio}
              className="bg-[#575757] hover:bg-[#4A4A4A] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ejercicio
            </Button>
          </div>

          {ejerciciosRealizados.map((ejercicio, index) => (
            ejercicio.saved ? (
              <SavedExerciseCard
                key={index}
                ejercicio={ejercicio}
                index={index}
                ejercicios={ejercicios}
                onEdit={onEditarEjercicio || (() => {})}
                onDelete={onEliminarEjercicio}
              />
            ) : (
              <ExerciseForm
                key={index}
                ejercicio={ejercicio}
                index={index}
                ejercicios={ejercicios}
                onUpdate={onActualizarEjercicio}
                onDelete={onEliminarEjercicio}
                onSave={onGuardarEjercicio}
              />
            )
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
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              isEditing ? "Actualizar" : "Guardar"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionForm;
