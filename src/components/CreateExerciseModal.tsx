
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CreateExerciseModal = () => {
  const [open, setOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createExerciseMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('exercises' as any)
        .insert([{
          name: name,
          user_id: user!.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Ejercicio creado",
        description: "El ejercicio ha sido agregado exitosamente.",
      });
      setExerciseName("");
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ejercicio.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el nombre del ejercicio.",
        variant: "destructive",
      });
      return;
    }
    createExerciseMutation.mutate(exerciseName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exerciseName">Nombre del Ejercicio</Label>
            <Input
              id="exerciseName"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ej: Sentadillas, Press de banca..."
              className="border-[#C5A46C] focus:border-[#C5A46C]"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit"
              disabled={createExerciseMutation.isPending}
              className="bg-[#C5A46C] hover:bg-[#B8956A] text-white flex-1"
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
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseModal;
