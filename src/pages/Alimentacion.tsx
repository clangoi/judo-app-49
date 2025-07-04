
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
  fecha: string;
  tipo_alimento: string;
  alimento: string;
  cantidad?: string;
  notas?: string;
  foto_url?: string;
}

const Alimentacion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo_alimento: "",
    alimento: "",
    cantidad: "",
    notas: "",
    foto: ""
  });

  const tiposComida = ["Desayuno", "Colacion", "Almuerzo", "Cena"];

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['alimentacion', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alimentacion')
        .select('*')
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (registro: Omit<ComidaRegistro, 'id'>) => {
      const { data, error } = await supabase
        .from('alimentacion')
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
      queryClient.invalidateQueries({ queryKey: ['alimentacion'] });
      toast({
        title: "Comida registrada",
        description: "Tu registro de alimentación ha sido guardado exitosamente.",
      });
      setNuevoRegistro({ 
        fecha: new Date().toISOString().split('T')[0],
        tipo_alimento: "", 
        alimento: "", 
        cantidad: "", 
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
    if (!nuevoRegistro.tipo_alimento || !nuevoRegistro.alimento) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      fecha: nuevoRegistro.fecha,
      tipo_alimento: nuevoRegistro.tipo_alimento,
      alimento: nuevoRegistro.alimento,
      cantidad: nuevoRegistro.cantidad || undefined,
      notas: nuevoRegistro.notas || undefined,
      foto_url: nuevoRegistro.foto || undefined
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
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevoRegistro.fecha}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tipo_alimento">Tipo de Comida</Label>
                <Select value={nuevoRegistro.tipo_alimento} onValueChange={(value) => setNuevoRegistro({...nuevoRegistro, tipo_alimento: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de comida" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposComida.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alimento">Alimentos</Label>
                <Textarea
                  id="alimento"
                  placeholder="Lista de alimentos consumidos..."
                  value={nuevoRegistro.alimento}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, alimento: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad (opcional)</Label>
                <Input
                  id="cantidad"
                  placeholder="Cantidad consumida"
                  value={nuevoRegistro.cantidad}
                  onChange={(e) => setNuevoRegistro({...nuevoRegistro, cantidad: e.target.value})}
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
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Observaciones adicionales..."
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
                      <CardTitle className="text-lg">{registro.tipo_alimento}</CardTitle>
                      <p className="text-sm text-slate-600">{registro.fecha}</p>
                    </div>
                    {registro.cantidad && (
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                        {registro.cantidad}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {registro.foto_url && (
                      <img src={registro.foto_url} alt="Comida" className="w-full max-w-64 h-48 object-cover rounded" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm text-slate-700">Alimentos:</h4>
                      <p className="text-slate-600">{registro.alimento}</p>
                    </div>
                    {registro.notas && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-700">Notas:</h4>
                        <p className="text-slate-600">{registro.notas}</p>
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
