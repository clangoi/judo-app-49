import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTechniques } from "@/hooks/useTechniques";
import NavHeader from "@/components/NavHeader";
import TechniqueForm from "@/components/techniques/TechniqueForm";
import TechniqueCard from "@/components/techniques/TechniqueCard";
import TechniqueDetail from "@/components/techniques/TechniqueDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BookOpen, Search } from "lucide-react";

interface TecnicaDeportivo {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  fechaCreacion: string;
  fotos?: string[];
  videoYoutube?: string;
  videoUrl?: string;
}

const TecnicasDeportivo = () => {
  const { user } = useAuth();
  const { techniques, isLoading, createTechniqueMutation, updateTechniqueMutation, deleteTechniqueMutation } = useTechniques(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editandoTecnica, setEditandoTecnica] = useState<TecnicaDeportivo | null>(null);
  const [tecnicaDetalle, setTecnicaDetalle] = useState<TecnicaDeportivo | null>(null);

  const agregarTecnica = async (formData: any) => {
    if (!formData.nombre || !formData.categoria || !formData.descripcion) {
      return;
    }

    try {
      if (editandoTecnica) {
        await updateTechniqueMutation.mutateAsync({
          id: editandoTecnica.id,
          ...formData
        });
      } else {
        await createTechniqueMutation.mutateAsync(formData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error al guardar técnica:', error);
    }
  };

  const resetForm = () => {
    setEditandoTecnica(null);
    setMostrarFormulario(false);
  };

  const editarTecnica = (tecnica: TecnicaDeportivo) => {
    setEditandoTecnica(tecnica);
    setMostrarFormulario(true);
  };

  const eliminarTecnica = async (id: string) => {
    try {
      await deleteTechniqueMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error al eliminar técnica:', error);
    }
  };

  const tecnicasFiltradas = techniques.filter(tecnica =>
    (tecnica.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (tecnica.categoria?.toLowerCase() || '').includes(busqueda.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Técnicas Deportivas" 
        subtitle="Notas y guías de técnicas deportivas"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Técnica
          </Button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar técnicas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {mostrarFormulario && (
          <TechniqueForm
            initialData={editandoTecnica ? {
              nombre: editandoTecnica.nombre,
              categoria: editandoTecnica.categoria,
              descripcion: editandoTecnica.descripcion,
              puntosClaves: editandoTecnica.puntosClaves,
              erroresComunes: editandoTecnica.erroresComunes,
              videoYoutube: editandoTecnica.videoYoutube || "",
              videoUrl: editandoTecnica.videoUrl || "",
              fotos: editandoTecnica.fotos || []
            } : undefined}
            onSubmit={agregarTecnica}
            onCancel={resetForm}
            isLoading={createTechniqueMutation.isPending || updateTechniqueMutation.isPending}
          />
        )}

        <div className="space-y-4">
          {tecnicasFiltradas.map((tecnica) => (
            <TechniqueCard
              key={tecnica.id}
              technique={tecnica}
              onView={() => setTecnicaDetalle(tecnica)}
              onEdit={() => editarTecnica(tecnica)}
              onDelete={() => eliminarTecnica(tecnica.id)}
              isDeleting={deleteTechniqueMutation.isPending}
            />
          ))}
        </div>

        <TechniqueDetail
          technique={tecnicaDetalle}
          onClose={() => setTecnicaDetalle(null)}
        />
      </div>
    </div>
  );
};

export default TecnicasDeportivo;
