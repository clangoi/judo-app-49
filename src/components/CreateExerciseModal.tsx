
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

const CreateExerciseModal = () => {
  const { user } = useAuth();
  const { createExerciseMutation } = useExercises(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");

  const handleSubmit = () => {
    if (!exerciseName.trim()) return;
    
    createExerciseMutation.mutate(exerciseName.trim(), {
      onSuccess: () => {
        setExerciseName("");
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">Crear Nuevo Ejercicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exercise-name" className="text-[#1A1A1A]">
              Nombre del Ejercicio
            </Label>
            <Input
              id="exercise-name"
              placeholder="Ej: Press de banca, Sentadillas..."
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="border-[#C5A46C] focus:border-[#C5A46C]"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!exerciseName.trim() || createExerciseMutation.isPending}
              className="flex-1 bg-[#C5A46C] hover:bg-[#B8956A] text-white"
            >
              {createExerciseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Ejercicio"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setExerciseName("");
              }}
              className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseModal;
