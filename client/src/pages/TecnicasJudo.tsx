import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTechniques } from "@/hooks/useTechniques";
import NavHeader from "@/components/NavHeader";
import VideoUpload from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Search, Camera, Youtube, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TecnicaJudo {
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

const TecnicasJudo = () => {
  const { user } = useAuth();
  const { techniques, isLoading, createTechniqueMutation, updateTechniqueMutation, deleteTechniqueMutation } = useTechniques(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editandoTecnica, setEditandoTecnica] = useState<TecnicaJudo | null>(null);
  const [tecnicaDetalle, setTecnicaDetalle] = useState<TecnicaJudo | null>(null);
  const [nuevaTecnica, setNuevaTecnica] = useState({
    nombre: "",
    categoria: "",
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

  const resetForm = () => {
    setNuevaTecnica({ 
      nombre: "", 
      categoria: "", 
      descripcion: "", 
      puntosClaves: "", 
      erroresComunes: "",
      videoYoutube: "",
      videoUrl: "",
      fotos: []
    });
    setMostrarFormulario(false);
    setEditandoTecnica(null);
  };

  const iniciarEdicion = (tecnica: TecnicaJudo) => {
    setEditandoTecnica(tecnica);
    setNuevaTecnica({
      nombre: tecnica.nombre,
      categoria: tecnica.categoria,
      descripcion: tecnica.descripcion,
      puntosClaves: tecnica.puntosClaves,
      erroresComunes: tecnica.erroresComunes,
      videoYoutube: tecnica.videoYoutube || "",
      videoUrl: tecnica.videoUrl || "",
      fotos: tecnica.fotos || []
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = (tecnica: TecnicaJudo) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta técnica? Esta acción no se puede deshacer.")) {
      deleteTechniqueMutation.mutate(tecnica.id);
    }
  };

  const agregarTecnica = () => {
    if (editandoTecnica) {
      updateTechniqueMutation.mutate({
        id: editandoTecnica.id,
        tecnica: {
          nombre: nuevaTecnica.nombre,
          categoria: nuevaTecnica.categoria,
          descripcion: nuevaTecnica.descripcion,
          puntosClaves: nuevaTecnica.puntosClaves,
          erroresComunes: nuevaTecnica.erroresComunes,
          fotos: nuevaTecnica.fotos.length > 0 ? nuevaTecnica.fotos : undefined,
          videoYoutube: nuevaTecnica.videoYoutube || undefined,
          videoUrl: nuevaTecnica.videoUrl || undefined
        }
      }, {
        onSuccess: () => resetForm()
      });
    } else {
      createTechniqueMutation.mutate({
        nombre: nuevaTecnica.nombre,
        categoria: nuevaTecnica.categoria,
        descripcion: nuevaTecnica.descripcion,
        puntosClaves: nuevaTecnica.puntosClaves,
        erroresComunes: nuevaTecnica.erroresComunes,
        fotos: nuevaTecnica.fotos.length > 0 ? nuevaTecnica.fotos : undefined,
        videoYoutube: nuevaTecnica.videoYoutube || undefined,
        videoUrl: nuevaTecnica.videoUrl || undefined
      }, {
        onSuccess: () => resetForm()
      });
    }
  };

  const tecnicasFiltradas = techniques.filter(tecnica =>
    (tecnica.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (tecnica.categoria?.toLowerCase() || '').includes(busqueda.toLowerCase())
  );

  const categorias = [...new Set(techniques.map(t => t.categoria))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editandoTecnica ? "Editar Técnica Deportiva" : "Nueva Técnica Deportiva"}
              </CardTitle>
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
                <Button 
                  onClick={agregarTecnica}
                  disabled={createTechniqueMutation.isPending || updateTechniqueMutation.isPending}
                >
                  {createTechniqueMutation.isPending || updateTechniqueMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editandoTecnica ? "Actualizar" : "Guardar"
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {categorias.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Categorías:</h3>
            <div className="flex flex-wrap gap-2">
              {categorias.map(categoria => (
                <Button
                  key={categoria}
                  variant="outline"
                  size="sm"
                  onClick={() => setBusqueda(categoria)}
                >
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tecnicasFiltradas.length === 0 && techniques.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay técnicas registradas aún</p>
                <p className="text-sm text-slate-500">Agrega tu primera técnica de judo</p>
              </CardContent>
            </Card>
          ) : tecnicasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No se encontraron técnicas con "{busqueda}"</p>
              </CardContent>
            </Card>
          ) : (
            tecnicasFiltradas.map((tecnica) => (
              <Card key={tecnica.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tecnica.nombre}</CardTitle>
                      <p className="text-sm text-slate-600">{tecnica.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500">
                        {tecnica.fechaCreacion}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setTecnicaDetalle(tecnica)}
                          variant="outline"
                          size="sm"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          onClick={() => iniciarEdicion(tecnica)}
                          variant="outline"
                          size="sm"
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleEliminar(tecnica)}
                          variant="destructive"
                          size="sm"
                          disabled={deleteTechniqueMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
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

      <Dialog open={!!tecnicaDetalle} onOpenChange={() => setTecnicaDetalle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Detalles de la Técnica
            </DialogTitle>
          </DialogHeader>
          {tecnicaDetalle && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        {tecnicaDetalle.nombre}
                      </h3>
                      <p className="text-slate-600">{tecnicaDetalle.categoria}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {tecnicaDetalle.fechaCreacion}
                    </div>
                  </div>
                  
                  {tecnicaDetalle.fotos && tecnicaDetalle.fotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {tecnicaDetalle.fotos.map((foto, index) => (
                        <img key={index} src={foto} alt={`${tecnicaDetalle.nombre} ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      ))}
                    </div>
                  )}
                  
                  {tecnicaDetalle.videoUrl && (
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                      <video 
                        controls 
                        className="w-full h-64 object-contain"
                        preload="metadata"
                      >
                        <source src={tecnicaDetalle.videoUrl} type="video/mp4" />
                        Tu navegador no soporta videos HTML5.
                      </video>
                    </div>
                  )}
                  
                  {tecnicaDetalle.videoYoutube && getYouTubeEmbedUrl(tecnicaDetalle.videoYoutube) && (
                    <div className="aspect-video mb-4">
                      <iframe
                        src={getYouTubeEmbedUrl(tecnicaDetalle.videoYoutube)!}
                        title={`Video de ${tecnicaDetalle.nombre}`}
                        className="w-full h-full rounded"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Descripción:</h4>
                      <p className="text-slate-600">{tecnicaDetalle.descripcion}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Puntos Clave:</h4>
                      <p className="text-blue-700 text-sm">{tecnicaDetalle.puntosClaves}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">Errores Comunes:</h4>
                      <p className="text-orange-700 text-sm">{tecnicaDetalle.erroresComunes}</p>
                    </div>
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

export default TecnicasJudo;
