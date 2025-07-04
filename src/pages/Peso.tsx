
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
  fecha: string;
  peso: number;
  notas?: string;
  foto_url?: string;
}

const Peso = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    fecha: new Date().toISOString().split('T')[0],
    peso: "",
    notas: "",
    foto: ""
  });

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['peso', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peso')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (registro: Omit<RegistroPeso, 'id'>) => {
      const { data, error } = await supabase
        .from('peso')
        .insert([{
          ...registro,
          user_id: user!.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peso'] });
      toast({
        title: "Registro guardado",
        description: "Tu peso ha sido registrado exitosamente.",
      });
      setNuevoRegistro({ 
        fecha: new Date().toISOString().split('T')[0],
        peso: "", 
        notas: "",
        foto: ""
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNuevoRegistro({...nuevoRegistro, foto: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarRegistro = () => {
    if (!nuevoRegistro.peso) {
      toast({
        title: "Error",
        description: "Por favor ingresa el peso.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      fecha: nuevoRegistro.fecha,
      peso: parseFloat(nuevoRegistro.peso),
      notas: nuevoRegistro.notas || undefined,
      foto_url: nuevoRegistro.foto || undefined
    });
  };

  const calcularTendencia = (index: number) => {
    if (index >= registros.length - 1) return null;
    const actual = registros[index].peso;
    const anterior = registros[index + 1].peso;
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
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevoRegistro.fecha}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={nuevoRegistro.peso}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, peso: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="foto">Foto (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-slate-400" />
                </div>
                {nuevoRegistro.foto && (
                  <img src={nuevoRegistro.foto} alt="Vista previa" className="mt-2 max-w-32 h-32 object-cover rounded" />
                )}
              </div>
              <div>
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Input
                  id="notas"
                  placeholder="Observaciones sobre el peso..."
                  value={nuevoRegistro.notas}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, notas: e.target.value})}
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
                          {registro.peso} kg
                        </CardTitle>
                        <p className="text-sm text-slate-600">{registro.fecha}</p>
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
                  <CardContent>
                    <div className="space-y-3">
                      {registro.foto_url && (
                        <img src={registro.foto_url} alt="Registro de peso" className="w-full max-w-64 h-48 object-cover rounded" />
                      )}
                      {registro.notas && (
                        <p className="text-slate-600">{registro.notas}</p>
                      )}
                    </div>
                  </CardContent>
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
