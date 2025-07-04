
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJudoSessions } from "@/hooks/useJudoSessions";
import NavHeader from "@/components/NavHeader";
import VideoUpload from "@/components/VideoUpload";
import JudoSessionCard from "@/components/training/JudoSessionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const { user } = useAuth();
  const { sessions, isLoading, createSessionMutation, updateSessionMutation, deleteSessionMutation } = useJudoSessions(user?.id);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [incluirRandory, setIncluirRandory] = useState(false);
  const [editandoEntrenamiento, setEditandoEntrenamiento] = useState<EntrenamientoJudo | null>(null);
  const [entrenamientoDetalle, setEntrenamientoDetalle] = useState<EntrenamientoJudo | null>(null);
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

  const resetForm = () => {
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
    setEditandoEntrenamiento(null);
  };

  const iniciarEdicion = (entrenamiento: EntrenamientoJudo) => {
    setEditandoEntrenamiento(entrenamiento);
    setNuevoEntrenamiento({
      tipo: entrenamiento.tipo,
      duracion: entrenamiento.duracion.toString(),
      tecnicasPracticadas: entrenamiento.tecnicasPracticadas,
      queFunciono: entrenamiento.queFunciono,
      queNoFunciono: entrenamiento.queNoFunciono,
      comentarios: entrenamiento.comentarios || "",
      videoUrl: entrenamiento.videoUrl || ""
    });
    if (entrenamiento.randory) {
      setIncluirRandory(true);
      setRandoryData(entrenamiento.randory);
    }
    setMostrarFormulario(true);
  };

  const handleEliminar = (entrenamiento: EntrenamientoJudo) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.")) {
      deleteSessionMutation.mutate(entrenamiento.id);
    }
  };

  const agregarEntrenamiento = () => {
    if (!nuevoEntrenamiento.tipo || !nuevoEntrenamiento.duracion) {
      return;
    }

    const entrenamientoData = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: nuevoEntrenamiento.tipo,
      duracion: parseInt(nuevoEntrenamiento.duracion),
      tecnicasPracticadas: nuevoEntrenamiento.tecnicasPracticadas,
      queFunciono: nuevoEntrenamiento.queFunciono,
      queNoFunciono: nuevoEntrenamiento.queNoFunciono,
      comentarios: nuevoEntrenamiento.comentarios,
      randory: incluirRandory ? randoryData : undefined,
      videoUrl: nuevoEntrenamiento.videoUrl || undefined
    };

    if (editandoEntrenamiento) {
      updateSessionMutation.mutate({
        id: editandoEntrenamiento.id,
        entrenamiento: entrenamientoData
      }, {
        onSuccess: () => resetForm()
      });
    } else {
      createSessionMutation.mutate(entrenamientoData, {
        onSuccess: () => resetForm()
      });
    }
  };

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
        title="Entrenamientos" 
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
              <CardTitle>
                {editandoEntrenamiento ? "Editar Entrenamiento de Judo" : "Nuevo Entrenamiento de Judo"}
              </CardTitle>
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
                <Button 
                  onClick={agregarEntrenamiento}
                  disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                >
                  {createSessionMutation.isPending || updateSessionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editandoEntrenamiento ? "Actualizar" : "Guardar"
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay entrenamientos registrados aún</p>
                <p className="text-sm text-slate-500">Agrega tu primer entrenamiento de judo</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((entrenamiento) => (
              <JudoSessionCard
                key={entrenamiento.id}
                entrenamiento={entrenamiento}
                onView={setEntrenamientoDetalle}
                onEdit={iniciarEdicion}
                onDelete={handleEliminar}
                isDeleting={deleteSessionMutation.isPending}
              />
            ))
          )}
        </div>

        <Dialog open={!!entrenamientoDetalle} onOpenChange={() => setEntrenamientoDetalle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Detalles del Entrenamiento
              </DialogTitle>
            </DialogHeader>
            {entrenamientoDetalle && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          {entrenamientoDetalle.tipo}
                        </h3>
                        <p className="text-slate-600">{entrenamientoDetalle.fecha}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {entrenamientoDetalle.duracion} min
                      </div>
                    </div>
                    
                    {entrenamientoDetalle.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden mb-4">
                        <video 
                          controls 
                          className="w-full h-64 object-contain"
                          preload="metadata"
                        >
                          <source src={entrenamientoDetalle.videoUrl} type="video/mp4" />
                          Tu navegador no soporta videos HTML5.
                        </video>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Técnicas Practicadas:</h4>
                        <p className="text-slate-600">{entrenamientoDetalle.tecnicasPracticadas}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Qué funcionó:</h4>
                          <p className="text-green-700 text-sm">{entrenamientoDetalle.queFunciono}</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">A mejorar:</h4>
                          <p className="text-red-700 text-sm">{entrenamientoDetalle.queNoFunciono}</p>
                        </div>
                      </div>
                      
                      {entrenamientoDetalle.randory && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">
                            Randory vs {entrenamientoDetalle.randory.oponente}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">Técnicas intentadas:</span>
                              <p className="text-blue-600">{entrenamientoDetalle.randory.tecnicasIntentadas}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Funcionaron:</span>
                              <p className="text-green-600">{entrenamientoDetalle.randory.tecnicasFuncionaron}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">No funcionaron:</span>
                              <p className="text-red-600">{entrenamientoDetalle.randory.tecnicasNoFuncionaron}</p>
                            </div>
                            <div>
                              <span className="font-medium text-orange-700">Me hicieron:</span>
                              <p className="text-orange-600">{entrenamientoDetalle.randory.tecnicasQueRecibio}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {entrenamientoDetalle.comentarios && (
                        <div>
                          <h4 className="font-medium text-slate-700 mb-2">Comentarios:</h4>
                          <p className="text-slate-600">{entrenamientoDetalle.comentarios}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EntrenamientosJudo;
