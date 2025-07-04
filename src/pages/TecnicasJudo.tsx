
import { useState } from "react";
import NavHeader from "@/components/NavHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TecnicaCard from "@/components/judo/TecnicaCard";
import TecnicaForm from "@/components/judo/TecnicaForm";
import TecnicaFilters from "@/components/judo/TecnicaFilters";
import EmptyState from "@/components/judo/EmptyState";

interface TecnicaJudo {
  id: string;
  nombre: string;
  categoria: string;
  cinturon: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  fechaCreacion: string;
  fotos?: string[];
  videoYoutube?: string;
  videoUrl?: string;
}

const cinturones = [
  { value: "blanco", label: "Blanco", color: "bg-white border-gray-300" },
  { value: "amarillo", label: "Amarillo", color: "bg-yellow-400" },
  { value: "naranja", label: "Naranja", color: "bg-orange-400" },
  { value: "verde", label: "Verde", color: "bg-green-400" },
  { value: "azul", label: "Azul", color: "bg-blue-400" },
  { value: "marron", label: "Marrón", color: "bg-amber-700" },
  { value: "negro", label: "Negro", color: "bg-black" }
];

const TecnicasJudo = () => {
  const [tecnicas, setTecnicas] = useState<TecnicaJudo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCinturon, setFiltroCinturon] = useState("");
  const [nuevaTecnica, setNuevaTecnica] = useState({
    nombre: "",
    categoria: "",
    cinturon: "",
    descripcion: "",
    puntosClaves: "",
    erroresComunes: "",
    videoYoutube: "",
    videoUrl: "",
    fotos: [] as string[]
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFotos: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newFotos.push(result);
          if (newFotos.length === files.length) {
            setNuevaTecnica({...nuevaTecnica, fotos: [...nuevaTecnica.fotos, ...newFotos]});
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const eliminarFoto = (index: number) => {
    const nuevasFotos = nuevaTecnica.fotos.filter((_, i) => i !== index);
    setNuevaTecnica({...nuevaTecnica, fotos: nuevasFotos});
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setNuevaTecnica({...nuevaTecnica, videoUrl});
  };

  const handleRemoveVideo = () => {
    setNuevaTecnica({...nuevaTecnica, videoUrl: ""});
  };

  const agregarTecnica = () => {
    const tecnica: TecnicaJudo = {
      id: Date.now().toString(),
      fechaCreacion: new Date().toLocaleDateString(),
      nombre: nuevaTecnica.nombre,
      categoria: nuevaTecnica.categoria,
      cinturon: nuevaTecnica.cinturon,
      descripcion: nuevaTecnica.descripcion,
      puntosClaves: nuevaTecnica.puntosClaves,
      erroresComunes: nuevaTecnica.erroresComunes,
      fotos: nuevaTecnica.fotos.length > 0 ? nuevaTecnica.fotos : undefined,
      videoYoutube: nuevaTecnica.videoYoutube || undefined,
      videoUrl: nuevaTecnica.videoUrl || undefined
    };

    setTecnicas([tecnica, ...tecnicas]);
    setNuevaTecnica({ 
      nombre: "", 
      categoria: "", 
      cinturon: "",
      descripcion: "", 
      puntosClaves: "", 
      erroresComunes: "",
      videoYoutube: "",
      videoUrl: "",
      fotos: []
    });
    setMostrarFormulario(false);
  };

  const tecnicasFiltradas = tecnicas.filter(tecnica => {
    const matchBusqueda = tecnica.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         tecnica.categoria.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || tecnica.categoria === filtroCategoria;
    const matchCinturon = !filtroCinturon || tecnica.cinturon === filtroCinturon;
    
    return matchBusqueda && matchCategoria && matchCinturon;
  });

  const categorias = [...new Set(tecnicas.map(t => t.categoria))];
  
  const cinturonColor = (cinturon: string) => {
    const belt = cinturones.find(c => c.value === cinturon);
    return belt ? belt.color : "bg-gray-200";
  };

  const handleClearFilters = () => {
    setFiltroCategoria("");
    setFiltroCinturon("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Técnicas" 
        subtitle="Notas y guías de técnicas"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Técnica
          </Button>
          
          <TecnicaFilters
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            filtroCinturon={filtroCinturon}
            setFiltroCinturon={setFiltroCinturon}
            categorias={categorias}
            onClearFilters={handleClearFilters}
          />
        </div>

        {mostrarFormulario && (
          <TecnicaForm
            nuevaTecnica={nuevaTecnica}
            setNuevaTecnica={setNuevaTecnica}
            onSubmit={agregarTecnica}
            onCancel={() => setMostrarFormulario(false)}
            onFotoChange={handleFotoChange}
            eliminarFoto={eliminarFoto}
            handleVideoUploaded={handleVideoUploaded}
            handleRemoveVideo={handleRemoveVideo}
          />
        )}

        <div className="space-y-4">
          {tecnicasFiltradas.length === 0 && tecnicas.length === 0 ? (
            <EmptyState type="no-data" />
          ) : tecnicasFiltradas.length === 0 ? (
            <EmptyState type="no-results" />
          ) : (
            tecnicasFiltradas.map((tecnica) => (
              <TecnicaCard
                key={tecnica.id}
                tecnica={tecnica}
                cinturonColor={cinturonColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TecnicasJudo;
