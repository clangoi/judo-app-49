import { useState } from "react";
import NavHeader from "@/components/NavHeader";
import VideoUpload from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Target, Users, Camera } from "lucide-react";

interface PlanTactico {
  id: string;
  nombre: string;
  oponente?: string;
  objetivo: string;
  estrategia: string;
  tecnicasClaves: string;
  contraataques: string;
  notas?: string;
  fechaCreacion: string;
  fotos?: string[];
  videoUrl?: string;
}

const TacticaJudo = () => {
  const [planes, setPlanes] = useState<PlanTactico[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPlan, setNuevoPlan] = useState({
    nombre: "",
    oponente: "",
    objetivo: "",
    estrategia: "",
    tecnicasClaves: "",
    contraataques: "",
    notas: "",
    fotos: [] as string[],
    videoUrl: ""
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
            setNuevoPlan({...nuevoPlan, fotos: [...nuevoPlan.fotos, ...newFotos]});
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const eliminarFoto = (index: number) => {
    const nuevasFotos = nuevoPlan.fotos.filter((_, i) => i !== index);
    setNuevoPlan({...nuevoPlan, fotos: nuevasFotos});
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setNuevoPlan({...nuevoPlan, videoUrl});
  };

  const handleRemoveVideo = () => {
    setNuevoPlan({...nuevoPlan, videoUrl: ""});
  };

  const agregarPlan = () => {
    const plan: PlanTactico = {
      id: Date.now().toString(),
      fechaCreacion: new Date().toLocaleDateString(),
      nombre: nuevoPlan.nombre,
      oponente: nuevoPlan.oponente,
      objetivo: nuevoPlan.objetivo,
      estrategia: nuevoPlan.estrategia,
      tecnicasClaves: nuevoPlan.tecnicasClaves,
      contraataques: nuevoPlan.contraataques,
      notas: nuevoPlan.notas,
      fotos: nuevoPlan.fotos.length > 0 ? nuevoPlan.fotos : undefined,
      videoUrl: nuevoPlan.videoUrl || undefined
    };

    setPlanes([plan, ...planes]);
    setNuevoPlan({ 
      nombre: "", 
      oponente: "", 
      objetivo: "", 
      estrategia: "", 
      tecnicasClaves: "", 
      contraataques: "", 
      notas: "",
      fotos: [],
      videoUrl: ""
    });
    setMostrarFormulario(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Táctica de Judo" 
        subtitle="Planificación estratégica y análisis"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan Táctico
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuevo Plan Táctico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Plan</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Plan vs Zurdo, Estrategia Torneo..."
                  value={nuevoPlan.nombre}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="oponente">Oponente (opcional)</Label>
                <Input
                  id="oponente"
                  placeholder="Nombre del oponente específico..."
                  value={nuevoPlan.oponente}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, oponente: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="objetivo">Objetivo Principal</Label>
                <Input
                  id="objetivo"
                  placeholder="¿Qué quieres lograr con este plan?"
                  value={nuevoPlan.objetivo}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, objetivo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="estrategia">Estrategia General</Label>
                <Textarea
                  id="estrategia"
                  placeholder="Describe la estrategia general a seguir..."
                  value={nuevoPlan.estrategia}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, estrategia: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tecnicas">Técnicas Clave</Label>
                <Textarea
                  id="tecnicas"
                  placeholder="Técnicas principales a utilizar..."
                  value={nuevoPlan.tecnicasClaves}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, tecnicasClaves: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contraataques">Contraataques y Defensas</Label>
                <Textarea
                  id="contraataques"
                  placeholder="Cómo defenderte y contraatacar..."
                  value={nuevoPlan.contraataques}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, contraataques: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  placeholder="Observaciones y detalles extra..."
                  value={nuevoPlan.notas}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, notas: e.target.value})}
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
                {nuevoPlan.fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {nuevoPlan.fotos.map((foto, index) => (
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
                currentVideoUrl={nuevoPlan.videoUrl}
                onRemoveVideo={handleRemoveVideo}
              />
              
              <div className="flex gap-2">
                <Button onClick={agregarPlan}>Guardar</Button>
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {planes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay planes tácticos aún</p>
                <p className="text-sm text-slate-500">Crea tu primer plan estratégico</p>
              </CardContent>
            </Card>
          ) : (
            planes.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.nombre}</CardTitle>
                      {plan.oponente && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span className="text-sm text-slate-600">vs {plan.oponente}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{plan.fechaCreacion}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Plan
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.fotos && plan.fotos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {plan.fotos.map((foto, index) => (
                          <img key={index} src={foto} alt={`${plan.nombre} ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    
                    {plan.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-64 object-contain"
                          preload="metadata"
                        >
                          <source src={plan.videoUrl} type="video/mp4" />
                          Tu navegador no soporta videos HTML5.
                        </video>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-800 mb-1">Objetivo:</h4>
                      <p className="text-blue-700 text-sm">{plan.objetivo}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-1">Estrategia General:</h4>
                      <p className="text-slate-600 text-sm">{plan.estrategia}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm text-green-800 mb-1">Técnicas Clave:</h4>
                        <p className="text-green-700 text-sm">{plan.tecnicasClaves}</p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm text-orange-800 mb-1">Contraataques:</h4>
                        <p className="text-orange-700 text-sm">{plan.contraataques}</p>
                      </div>
                    </div>
                    
                    {plan.notas && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-700 mb-1">Notas:</h4>
                        <p className="text-slate-600 text-sm">{plan.notas}</p>
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

export default TacticaJudo;
