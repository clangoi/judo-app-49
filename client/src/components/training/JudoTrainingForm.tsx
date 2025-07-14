
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Loader2, Save, X } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import RandoriForm from "./RandoriForm";

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name: string;
}

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
  mediaFiles?: MediaFile[];
}

interface JudoTrainingFormProps {
  editandoEntrenamiento: EntrenamientoJudo | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const JudoTrainingForm = ({ editandoEntrenamiento, onSubmit, onCancel, isLoading }: JudoTrainingFormProps) => {
  const [incluirRandory, setIncluirRandory] = useState(!!editandoEntrenamiento?.randory);
  const [nuevoEntrenamiento, setNuevoEntrenamiento] = useState({
    tipo: editandoEntrenamiento?.tipo || "",
    duracion: editandoEntrenamiento?.duracion.toString() || "",
    tecnicasPracticadas: editandoEntrenamiento?.tecnicasPracticadas || "",
    queFunciono: editandoEntrenamiento?.queFunciono || "",
    queNoFunciono: editandoEntrenamiento?.queNoFunciono || "",
    comentarios: editandoEntrenamiento?.comentarios || "",
    mediaFiles: editandoEntrenamiento?.mediaFiles || []
  });
  const [randoryData, setRandoryData] = useState({
    oponente: editandoEntrenamiento?.randory?.oponente || "",
    tecnicasIntentadas: editandoEntrenamiento?.randory?.tecnicasIntentadas || "",
    tecnicasFuncionaron: editandoEntrenamiento?.randory?.tecnicasFuncionaron || "",
    tecnicasNoFuncionaron: editandoEntrenamiento?.randory?.tecnicasNoFuncionaron || "",
    tecnicasQueRecibio: editandoEntrenamiento?.randory?.tecnicasQueRecibio || ""
  });

  const handleMediaUploaded = (mediaFiles: MediaFile[]) => {
    setNuevoEntrenamiento({...nuevoEntrenamiento, mediaFiles});
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMediaFiles = nuevoEntrenamiento.mediaFiles.filter((_, i) => i !== index);
    setNuevoEntrenamiento({...nuevoEntrenamiento, mediaFiles: updatedMediaFiles});
  };

  const handleSubmit = () => {
    if (!nuevoEntrenamiento.tipo || !nuevoEntrenamiento.duracion) {
      console.log('Form validation failed: missing tipo or duracion');
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
      mediaFiles: nuevoEntrenamiento.mediaFiles || []
    };

    console.log('Submitting training data:', entrenamientoData);
    onSubmit(entrenamientoData);
  };

  return (
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
        
        <MediaUpload
          onMediaUploaded={handleMediaUploaded}
          currentMediaFiles={nuevoEntrenamiento.mediaFiles}
          onRemoveMedia={handleRemoveMedia}
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
            <RandoriForm 
              randoryData={randoryData}
              onRandoryDataChange={setRandoryData}
            />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JudoTrainingForm;
