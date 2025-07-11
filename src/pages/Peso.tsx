
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Weight, TrendingUp, TrendingDown, Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [editandoRegistro, setEditandoRegistro] = useState<RegistroPeso | null>(null);
  const [registroDetalle, setRegistroDetalle] = useState<RegistroPeso | null>(null);
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
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el registro.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, registro }: { id: string, registro: Omit<RegistroPeso, 'id'> }) => {
      const { data, error } = await supabase
        .from('weight_entries')
        .update({
          date: registro.date,
          weight: parseFloat(registro.weight.toString())
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight_entries'] });
      toast({
        title: "Registro actualizado",
        description: "El registro ha sido actualizado exitosamente.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el registro.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight_entries'] });
      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el registro.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNuevoRegistro({ 
      date: new Date().toISOString().split('T')[0],
      weight: ""
    });
    setMostrarFormulario(false);
    setEditandoRegistro(null);
  };

  const iniciarEdicion = (registro: RegistroPeso) => {
    setEditandoRegistro(registro);
    setNuevoRegistro({
      date: registro.date,
      weight: registro.weight.toString()
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = (registro: RegistroPeso) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(registro.id);
    }
  };

  const guardarRegistro = () => {
    if (!nuevoRegistro.weight) {
      toast({
        title: "Error",
        description: "Por favor ingresa el peso.",
        variant: "destructive",
      });
      return;
    }

    if (editandoRegistro) {
      updateMutation.mutate({
        id: editandoRegistro.id,
        registro: {
          date: nuevoRegistro.date,
          weight: parseFloat(nuevoRegistro.weight)
        }
      });
    } else {
      createMutation.mutate({
        date: nuevoRegistro.date,
        weight: parseFloat(nuevoRegistro.weight)
      });
    }
  };

  const calcularTendencia = (index: number) => {
    if (index >= registros.length - 1) return null;
    const actual = registros[index].weight;
    const anterior = registros[index + 1].weight;
    return actual - anterior;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Peso Semanal" 
        subtitle="Seguimiento de peso corporal"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6 bg-[#C5A46C] hover:bg-[#B8956A] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Peso
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6 bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">
                {editandoRegistro ? "Editar Registro de Peso" : "Nuevo Registro de Peso"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-[#1A1A1A]">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={nuevoRegistro.date}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, date: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-[#1A1A1A]">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={nuevoRegistro.weight}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, weight: e.target.value})}
                  className="border-[#C5A46C] focus:border-[#C5A46C]"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={guardarRegistro}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editandoRegistro ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    editandoRegistro ? "Actualizar" : "Guardar"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {registros.length === 0 ? (
            <Card className="bg-white border-[#C5A46C]">
              <CardContent className="p-8 text-center">
                <Weight className="h-12 w-12 mx-auto text-[#575757] mb-4" />
                <p className="text-[#575757]">No hay registros de peso aún</p>
                <p className="text-sm text-[#575757]">Agrega tu primer registro de peso</p>
              </CardContent>
            </Card>
          ) : (
            registros.map((registro, index) => {
              const tendencia = calcularTendencia(index);
              return (
                <Card key={registro.id} className="bg-white border-[#C5A46C]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-[#1A1A1A]">
                          {registro.weight} kg
                        </CardTitle>
                        <p className="text-sm text-[#575757]">{registro.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setRegistroDetalle(registro)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            onClick={() => iniciarEdicion(registro)}
                            variant="outline"
                            size="sm"
                            className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleEliminar(registro)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!registroDetalle} onOpenChange={() => setRegistroDetalle(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
              Detalles del Registro
            </DialogTitle>
          </DialogHeader>
          {registroDetalle && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                      {registroDetalle.weight} kg
                    </h3>
                    <p className="text-[#575757]">{registroDetalle.date}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Peso;
