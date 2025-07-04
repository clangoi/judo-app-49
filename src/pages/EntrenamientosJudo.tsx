import { useState } from "react";
import NavHeader from "@/components/NavHeader";
import VideoUpload from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, CheckCircle, XCircle, Users } from "lucide-react";

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoJudo {
  id: string;
  fecha: string;
  tipo: string;
  duracion: number;
  tecnicasPracticadas: string;
  queFunciono: string;
  queNoFunciono: string;
  comentarios?: string;
  randory?: RandoryInfo;
  videoUrl?: string;
}

const EntrenamientosJudo = () => {
  const [entrenamientos, setEntrenamientos] = useState<EntrenamientoJudo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [incluirRandory, setIncluirRandory] = useState(false);
  const [nuevoEntrenamiento, setNuevoEntrenamiento] = useState({
    tipo: "",
    duracion: "",
    tecnicasPracticadas: "",
    queFunciono: "",
    queNoFunciono: "",
    comentarios: "",
    videoUrl: ""
  });
  const [randoryData, setRandoryData] = useState({
    oponente: "",
    tecnicasIntentadas: "",
    tecnicasFuncionaron: "",
    tecnicasNoFuncionaron: "",
    tecnicasQueRecibio: ""
  });

  const handleVideoUploaded = (videoUrl: string) => {
    setNuevoEntrenamiento({...nuevoEntrenamiento, videoUrl});
  };

  const handleRemoveVideo = () => {
    setNuevoEntrenamiento({...nuevoEntrenamiento, videoUrl: ""});
  };

  const agregarEntrenamiento = () => {
    const entrenamiento: EntrenamientoJudo = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString(),
      tipo: nuevoEntrenamiento.tipo,
      duracion: parseInt(nuevoEntrenamiento.duracion),
      tecnicasPracticadas: nuevoEntrenamiento.tecnicasPracticadas,
      queFunciono: nuevoEntrenamiento.queFunciono,
      queNoFunciono: nuevoEntrenamiento.queNoFunciono,
      comentarios: nuevoEntrenamiento.comentarios,
      randory: incluirRandory ? randoryData : undefined,
      videoUrl: nuevoEntrenamiento.videoUrl || undefined
    };

    setEntrenamientos([entrenamiento, ...entrenamientos]);
    setNuevoEntrenamiento({ 
      tipo: "", 
      duracion: "", 
      tecnicasPracticadas: "", 
      queFunciono: "", 
      queNoFunciono: "", 
      comentarios: "",
      videoUrl: ""
    });
    setRandoryData({
      oponente: "",
      tecnicasIntentadas: "",
      tecnicasFuncionaron: "",
      tecnicasNoFuncionaron: "",
      tecnicasQueRecibio: ""
    });
    setIncluirRandory(false);
    setMostrarFormulario(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Entrenamientos de Judo" 
        subtitle="Registro y análisis de entrenamientos"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Entrenamiento
        </Button>

        {mostrarFormulario && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuevo Entrenamiento de Judo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo de Entrenamiento</Label>
                <Input
                  id="tipo"
                  placeholder="Randori, Kata, Técnica, Competencia..."
                  value={nuevoEntrenamiento.tipo}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, tipo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Input
                  id="duracion"
                  type="number"
                  placeholder="90"
                  value={nuevoEntrenamiento.duracion}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, duracion: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tecnicas">Técnicas Practicadas</Label>
                <Textarea
                  id="tecnicas"
                  placeholder="Lista de técnicas trabajadas durante el entrenamiento..."
                  value={nuevoEntrenamiento.tecnicasPracticadas}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, tecnicasPracticadas: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="funciono">¿Qué funcionó bien?</Label>
                <Textarea
                  id="funciono"
                  placeholder="Aspectos positivos del entrenamiento..."
                  value={nuevoEntrenamiento.queFunciono}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, queFunciono: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="no-funciono">¿Qué no funcionó?</Label>
                <Textarea
                  id="no-funciono"
                  placeholder="Aspectos a mejorar..."
                  value={nuevoEntrenamiento.queNoFunciono}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, queNoFunciono: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="comentarios">Comentarios Adicionales</Label>
                <Textarea
                  id="comentarios"
                  placeholder="Observaciones generales..."
                  value={nuevoEntrenamiento.comentarios}
                  onChange={(e) => setNuevoEntrenamiento({...nuevoEntrenamiento, comentarios: e.target.value})}
                />
              </div>
              
              <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                currentVideoUrl={nuevoEntrenamiento.videoUrl}
                onRemoveVideo={handleRemoveVideo}
              />
              
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="incluir-randory"
                    checked={incluirRandory}
                    onChange={(e) => setIncluirRandory(e.target.checked)}
                  />
                  <Label htmlFor="incluir-randory" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Incluir información de Randory
                  </Label>
                </div>
                
                {incluirRandory && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Randory</h3>
                    <div>
                      <Label htmlFor="oponente">Oponente</Label>
                      <Input
                        id="oponente"
                        placeholder="Nombre del oponente..."
                        value={randoryData.oponente}
                        onChange={(e) => setRandoryData({...randoryData, oponente: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tecnicas-intentadas">Técnicas Intentadas</Label>
                      <Textarea
                        id="tecnicas-intentadas"
                        placeholder="Técnicas que intentaste usar..."
                        value={randoryData.tecnicasIntentadas}
                        onChange={(e) => setRandoryData({...randoryData, tecnicasIntentadas: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tecnicas-funcionaron">Técnicas que Funcionaron</Label>
                      <Textarea
                        id="tecnicas-funcionaron"
                        placeholder="Técnicas que ejecutaste exitosamente..."
                        value={randoryData.tecnicasFuncionaron}
                        onChange={(e) => setRandoryData({...randoryData, tecnicasFuncionaron: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tecnicas-no-funcionaron">Técnicas que No Funcionaron</Label>
                      <Textarea
                        id="tecnicas-no-funcionaron"
                        placeholder="Técnicas que no pudiste ejecutar..."
                        value={randoryData.tecnicasNoFuncionaron}
                        onChange={(e) => setRandoryData({...randoryData, tecnicasNoFuncionaron: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tecnicas-recibio">Técnicas que te Hicieron</Label>
                      <Textarea
                        id="tecnicas-recibio"
                        placeholder="Técnicas que el oponente te aplicó..."
                        value={randoryData.tecnicasQueRecibio}
                        onChange={(e) => setRandoryData({...randoryData, tecnicasQueRecibio: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={agregarEntrenamiento}>Guardar</Button>
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {entrenamientos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay entrenamientos registrados aún</p>
                <p className="text-sm text-slate-500">Agrega tu primer entrenamiento de judo</p>
              </CardContent>
            </Card>
          ) : (
            entrenamientos.map((entrenamiento) => (
              <Card key={entrenamiento.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{entrenamiento.tipo}</CardTitle>
                      <p className="text-sm text-slate-600">{entrenamiento.fecha}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {entrenamiento.duracion} min
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entrenamiento.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-64 object-contain"
                          preload="metadata"
                        >
                          <source src={entrenamiento.videoUrl} type="video/mp4" />
                          Tu navegador no soporta videos HTML5.
                        </video>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-1">Técnicas Practicadas:</h4>
                      <p className="text-slate-600">{entrenamiento.tecnicasPracticadas}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium text-sm text-green-800">Qué funcionó:</h4>
                        </div>
                        <p className="text-green-700 text-sm">{entrenamiento.queFunciono}</p>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <h4 className="font-medium text-sm text-red-800">A mejorar:</h4>
                        </div>
                        <p className="text-red-700 text-sm">{entrenamiento.queNoFunciono}</p>
                      </div>
                    </div>
                    
                    {entrenamiento.randory && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-blue-800">Randory vs {entrenamiento.randory.oponente}</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-blue-700">Técnicas intentadas:</span>
                            <p className="text-blue-600">{entrenamiento.randory.tecnicasIntentadas}</p>
                          </div>
                          <div>
                            <span className="font-medium text-green-700">Funcionaron:</span>
                            <p className="text-green-600">{entrenamiento.randory.tecnicasFuncionaron}</p>
                          </div>
                          <div>
                            <span className="font-medium text-red-700">No funcionaron:</span>
                            <p className="text-red-600">{entrenamiento.randory.tecnicasNoFuncionaron}</p>
                          </div>
                          <div>
                            <span className="font-medium text-orange-700">Me hicieron:</span>
                            <p className="text-orange-600">{entrenamiento.randory.tecnicasQueRecibio}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {entrenamiento.comentarios && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-700 mb-1">Comentarios:</h4>
                        <p className="text-slate-600">{entrenamiento.comentarios}</p>
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

export default EntrenamientosJudo;
