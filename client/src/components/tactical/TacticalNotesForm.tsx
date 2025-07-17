import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, Users, BookOpen, Lightbulb, AlertTriangle, Loader2 } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";

interface TacticalNote {
  id?: string;
  titulo: string;
  oponente: string;
  categoria: string;
  estrategiaGeneral: string;
  puntosDebiles: string;
  puntosFuertes: string;
  tacticasRecomendadas: string;
  erroresEvitar: string;
  fechaCreacion?: string;
  mediaFiles?: Array<{
    url: string;
    type: 'image' | 'video';
    name: string;
  }>;
}

interface TacticalNotesFormProps {
  initialData?: TacticalNote;
  onSubmit: (data: TacticalNote & { mediaFiles: any[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const categories = [
  'Análisis de Oponente',
  'Estrategia de Competencia', 
  'Preparación Mental',
  'Táctica de Equipo',
  'Plan de Entrenamiento',
  'Observaciones Generales'
];

const TacticalNotesForm = ({ initialData, onSubmit, onCancel, isLoading }: TacticalNotesFormProps) => {
  const [formData, setFormData] = useState<TacticalNote>(
    initialData || {
      titulo: '',
      oponente: '',
      categoria: '',
      estrategiaGeneral: '',
      puntosDebiles: '',
      puntosFuertes: '',
      tacticasRecomendadas: '',
      erroresEvitar: ''
    }
  );

  const [mediaFiles, setMediaFiles] = useState<any[]>(initialData?.mediaFiles || []);

  const handleInputChange = (field: keyof TacticalNote, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUploaded = (files: any[]) => {
    setMediaFiles(files);
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, mediaFiles });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {initialData ? 'Editar Plan Táctico' : 'Nuevo Plan Táctico'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Plan</Label>
            <Input
              id="titulo"
              placeholder="Ej: Estrategia vs Juan Pérez"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="oponente" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Oponente/Situación
          </Label>
          <Input
            id="oponente"
            placeholder="Nombre del oponente o situación a analizar"
            value={formData.oponente}
            onChange={(e) => handleInputChange('oponente', e.target.value)}
          />
        </div>

        {/* Estrategia general */}
        <div className="space-y-2">
          <Label htmlFor="estrategiaGeneral" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Estrategia General
          </Label>
          <Textarea
            id="estrategiaGeneral"
            placeholder="Describe el plan general de ataque y defensa..."
            rows={3}
            value={formData.estrategiaGeneral}
            onChange={(e) => handleInputChange('estrategiaGeneral', e.target.value)}
          />
        </div>

        {/* Análisis de puntos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="puntosFuertes" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              Puntos Fuertes
            </Label>
            <Textarea
              id="puntosFuertes"
              placeholder="Fortalezas del oponente o aspectos positivos..."
              rows={3}
              value={formData.puntosFuertes}
              onChange={(e) => handleInputChange('puntosFuertes', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="puntosDebiles" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Puntos Débiles
            </Label>
            <Textarea
              id="puntosDebiles"
              placeholder="Debilidades que se pueden explotar..."
              rows={3}
              value={formData.puntosDebiles}
              onChange={(e) => handleInputChange('puntosDebiles', e.target.value)}
            />
          </div>
        </div>

        {/* Tácticas y errores */}
        <div className="space-y-2">
          <Label htmlFor="tacticasRecomendadas">Tácticas Recomendadas</Label>
          <Textarea
            id="tacticasRecomendadas"
            placeholder="Técnicas y estrategias específicas a utilizar..."
            rows={3}
            value={formData.tacticasRecomendadas}
            onChange={(e) => handleInputChange('tacticasRecomendadas', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="erroresEvitar">Errores a Evitar</Label>
          <Textarea
            id="erroresEvitar"
            placeholder="Qué no hacer durante el enfrentamiento..."
            rows={2}
            value={formData.erroresEvitar}
            onChange={(e) => handleInputChange('erroresEvitar', e.target.value)}
          />
        </div>

        {/* Upload de medios */}
        <div className="space-y-2">
          <Label>Material de Apoyo</Label>
          <MediaUpload 
            currentMediaFiles={mediaFiles}
            onMediaUploaded={handleMediaUploaded}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              initialData ? "Actualizar" : "Guardar"
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TacticalNotesForm;