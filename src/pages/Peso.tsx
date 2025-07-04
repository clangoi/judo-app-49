
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Weight, TrendingUp, TrendingDown, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistroPeso {
  id: string;
  date: string;
  weight: number;
}

const Peso = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: ""
  });

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['weight_entries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (registro: Omit<RegistroPeso, 'id'>) => {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert([{
          ...registro,
          user_id: user!.id,
          weight: parseFloat(registro.weight.toString())
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight_entries'] });
      toast({
        title: "Registro guardado",
        description: "Tu peso ha sido registrado exitosamente.",
      });
      setNuevoRegistro({ 
        date: new Date().toISOString().split('T')[0],
        weight: ""
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
    if (!nuevoRegistro.weight) {
      toast({
        title: "Error",
        description: "Por favor ingresa el peso.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      date: nuevoRegistro.date,
      weight: parseFloat(nuevoRegistro.weight)
    });
  };

  const calcularTendencia = (index: number) => {
    if (index >= registros.length - 1) return null;
    const actual = registros[index].weight;
    const anterior = registros[index + 1].weight;
    return actual - anterior;
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
        title="Peso Semanal" 
        subtitle="Seguimiento de peso corporal"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Peso
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuevo Registro de Peso</CardTitle>
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
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={nuevoRegistro.weight}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, weight: e.target.value})}
                />
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
                <Weight className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay registros de peso aún</p>
                <p className="text-sm text-slate-500">Agrega tu primer registro de peso</p>
              </CardContent>
            </Card>
          ) : (
            registros.map((registro, index) => {
              const tendencia = calcularTendencia(index);
              return (
                <Card key={registro.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {registro.weight} kg
                        </CardTitle>
                        <p className="text-sm text-slate-600">{registro.date}</p>
                      </div>
                      {tendencia !== null && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                          tendencia > 0 
                            ? 'bg-red-100 text-red-800' 
                            : tendencia < 0 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tendencia > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : tendencia < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {tendencia > 0 ? '+' : ''}{tendencia.toFixed(1)} kg
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Peso;
