
import { useState } from "react";
import NavHeader from "@/components/NavHeader";
import VideoUpload from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Search, Camera, Youtube, Filter } from "lucide-react";

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

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
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

        <div className="flex gap-4 mb-6">
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCinturon} onValueChange={setFiltroCinturon}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por cinturón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los cinturones</SelectItem>
              {cinturones.map(cinturon => (
                <SelectItem key={cinturon.value} value={cinturon.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${cinturon.color} border`}></div>
                    {cinturon.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filtroCategoria || filtroCinturon) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFiltroCategoria("");
                setFiltroCinturon("");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nueva Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Técnica</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Seoi-nage, O-soto-gari..."
                  value={nuevaTecnica.nombre}
                  onChange={(e) => setNuevaTecnica({...nuevaTecnica, nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  placeholder="Nage-waza, Katame-waza, Ne-waza..."
                  value={nuevaTecnica.categoria}
                  onChange={(e) => setNuevaTecnica({...nuevaTecnica, categoria: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cinturon">Cinturón</Label>
                <Select value={nuevaTecnica.cinturon} onValueChange={(value) => setNuevaTecnica({...nuevaTecnica, cinturon: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el cinturón" />
                  </SelectTrigger>
                  <SelectContent>
                    {cinturones.map(cinturon => (
                      <SelectItem key={cinturon.value} value={cinturon.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${cinturon.color} border`}></div>
                          {cinturon.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción de la Técnica</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Explicación detallada de cómo ejecutar la técnica..."
                  value={nuevaTecnica.descripcion}
                  onChange={(e) => setNuevaTecnica({...nuevaTecnica, descripcion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="puntos">Puntos Clave</Label>
                <Textarea
                  id="puntos"
                  placeholder="Aspectos importantes para la correcta ejecución..."
                  value={nuevaTecnica.puntosClaves}
                  onChange={(e) => setNuevaTecnica({...nuevaTecnica, puntosClaves: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="errores">Errores Comunes</Label>
                <Textarea
                  id="errores"
                  placeholder="Errores frecuentes y cómo evitarlos..."
                  value={nuevaTecnica.erroresComunes}
                  onChange={(e) => setNuevaTecnica({...nuevaTecnica, erroresComunes: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="fotos">Fotos (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotoChange}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-slate-400" />
                </div>
                {nuevaTecnica.fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {nuevaTecnica.fotos.map((foto, index) => (
                      <div key={index} className="relative">
                        <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => eliminarFoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                currentVideoUrl={nuevaTecnica.videoUrl}
                onRemoveVideo={handleRemoveVideo}
              />
              
              <div>
                <Label htmlFor="video">Video de YouTube (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={nuevaTecnica.videoYoutube}
                    onChange={(e) => setNuevaTecnica({...nuevaTecnica, videoYoutube: e.target.value})}
                    className="flex-1"
                  />
                  <Youtube className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={agregarTecnica}>Guardar</Button>
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {tecnicasFiltradas.length === 0 && tecnicas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay técnicas registradas aún</p>
                <p className="text-sm text-slate-500">Agrega tu primera técnica</p>
              </CardContent>
            </Card>
          ) : tecnicasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No se encontraron técnicas con los filtros aplicados</p>
              </CardContent>
            </Card>
          ) : (
            tecnicasFiltradas.map((tecnica) => (
              <Card key={tecnica.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tecnica.nombre}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-slate-600">{tecnica.categoria}</p>
                        <span className="text-slate-400">•</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${cinturonColor(tecnica.cinturon)} border`}></div>
                          <span className="text-sm text-slate-600 capitalize">{tecnica.cinturon}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {tecnica.fechaCreacion}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tecnica.fotos && tecnica.fotos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tecnica.fotos.map((foto, index) => (
                          <img key={index} src={foto} alt={`${tecnica.nombre} ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    
                    {tecnica.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-64 object-contain"
                          preload="metadata"
                        >
                          <source src={tecnica.videoUrl} type="video/mp4" />
                          Tu navegador no soporta videos HTML5.
                        </video>
                      </div>
                    )}
                    
                    {tecnica.videoYoutube && getYouTubeEmbedUrl(tecnica.videoYoutube) && (
                      <div className="aspect-video">
                        <iframe
                          src={getYouTubeEmbedUrl(tecnica.videoYoutube)!}
                          title={`Video de ${tecnica.nombre}`}
                          className="w-full h-full rounded"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-1">Descripción:</h4>
                      <p className="text-slate-600">{tecnica.descripcion}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-800 mb-1">Puntos Clave:</h4>
                      <p className="text-blue-700 text-sm">{tecnica.puntosClaves}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-orange-800 mb-1">Errores Comunes:</h4>
                      <p className="text-orange-700 text-sm">{tecnica.erroresComunes}</p>
                    </div>
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

export default TecnicasJudo;
