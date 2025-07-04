
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Utensils, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComidaRegistro {
  id: string;
  date: string;
  meal_description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

const Alimentacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    date: new Date().toISOString().split('T')[0],
    meal_description: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['nutrition_entries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (registro: Omit<ComidaRegistro, 'id'>) => {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .insert([{
          ...registro,
          user_id: user!.id,
          calories: registro.calories ? parseInt(registro.calories as string) : null,
          protein: registro.protein ? parseFloat(registro.protein as string) : null,
          carbs: registro.carbs ? parseFloat(registro.carbs as string) : null,
          fats: registro.fats ? parseFloat(registro.fats as string) : null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition_entries'] });
      toast({
        title: "Comida registrada",
        description: "Tu registro de alimentación ha sido guardado exitosamente.",
      });
      setNuevoRegistro({ 
        date: new Date().toISOString().split('T')[0],
        meal_description: "", 
        calories: "", 
        protein: "", 
        carbs: "",
        fats: ""
      });
      setMostrarFormulario(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el registro.",
        variant: "destructive",
      });
    }
  });

  const agregarRegistro = () => {
    if (!nuevoRegistro.meal_description) {
      toast({
        title: "Error",
        description: "Por favor describe los alimentos consumidos.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      date: nuevoRegistro.date,
      meal_description: nuevoRegistro.meal_description,
      calories: nuevoRegistro.calories ? parseInt(nuevoRegistro.calories) : undefined,
      protein: nuevoRegistro.protein ? parseFloat(nuevoRegistro.protein) : undefined,
      carbs: nuevoRegistro.carbs ? parseFloat(nuevoRegistro.carbs) : undefined,
      fats: nuevoRegistro.fats ? parseFloat(nuevoRegistro.fats) : undefined
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Alimentación Diaria" 
        subtitle="Registro de comidas y nutrición"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Comida
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nueva Comida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={nuevoRegistro.date}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="meal_description">Descripción de la Comida</Label>
                <Textarea
                  id="meal_description"
                  placeholder="Describe los alimentos consumidos..."
                  value={nuevoRegistro.meal_description}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, meal_description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calorías (opcional)</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="Ej: 500"
                    value={nuevoRegistro.calories}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, calories: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Proteínas (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 25.5"
                    value={nuevoRegistro.protein}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, protein: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbohidratos (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 50.0"
                    value={nuevoRegistro.carbs}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, carbs: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="fats">Grasas (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 15.0"
                    value={nuevoRegistro.fats}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, fats: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={agregarRegistro}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {registros.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Utensils className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay registros de alimentación aún</p>
                <p className="text-sm text-slate-500">Agrega tu primera comida del día</p>
              </CardContent>
            </Card>
          ) : (
            registros.map((registro) => (
              <Card key={registro.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Comida</CardTitle>
                      <p className="text-sm text-slate-600">{registro.date}</p>
                    </div>
                    {registro.calories && (
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                        {registro.calories} cal
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-slate-700">Descripción:</h4>
                      <p className="text-slate-600">{registro.meal_description}</p>
                    </div>
                    {(registro.protein || registro.carbs || registro.fats) && (
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        {registro.protein && (
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Proteínas</p>
                            <p className="font-medium text-blue-600">{registro.protein}g</p>
                          </div>
                        )}
                        {registro.carbs && (
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Carbohidratos</p>
                            <p className="font-medium text-green-600">{registro.carbs}g</p>
                          </div>
                        )}
                        {registro.fats && (
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Grasas</p>
                            <p className="font-medium text-yellow-600">{registro.fats}g</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alimentacion;
