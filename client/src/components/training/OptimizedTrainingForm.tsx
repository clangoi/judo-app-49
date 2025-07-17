import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Target, Loader2 } from "lucide-react";

interface TrainingFormData {
  fecha: string;
  duracion: string;
  tipo: string;
  intensidad: string;
  ubicacion: string;
  compañeros: string;
  objetivo: string;
  notas: string;
  ejercicios: string[];
  tecnicasPracticadas: string[];
  observaciones: string;
}

interface OptimizedTrainingFormProps {
  initialData?: TrainingFormData;
  onSubmit: (data: TrainingFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  formType: 'physical' | 'sport';
}

const intensityLevels = [
  { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'muy_alta', label: 'Muy Alta', color: 'bg-red-100 text-red-800' }
];

const trainingTypes = {
  physical: [
    'Cardio', 'Fuerza', 'Flexibilidad', 'Resistencia', 'Velocidad', 'Agilidad', 'Equilibrio'
  ],
  sport: [
    'Técnica', 'Táctica', 'Randori', 'Kata', 'Competencia', 'Sparring', 'Drills'
  ]
};

const OptimizedTrainingForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  formType 
}: OptimizedTrainingFormProps) => {
  const [formData, setFormData] = useState<TrainingFormData>(
    initialData || {
      fecha: new Date().toISOString().split('T')[0],
      duracion: '',
      tipo: '',
      intensidad: 'media',
      ubicacion: '',
      compañeros: '',
      objetivo: '',
      notas: '',
      ejercicios: [],
      tecnicasPracticadas: [],
      observaciones: ''
    }
  );

  const handleInputChange = (field: keyof TrainingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'ejercicios' | 'tecnicasPracticadas', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const getIntensityColor = (intensity: string) => {
    return intensityLevels.find(level => level.value === intensity)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {initialData ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
          <Badge variant="outline" className="ml-2">
            {formType === 'physical' ? 'Preparación Física' : 'Entrenamiento Deportivo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha
            </Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duración (min)
            </Label>
            <Input
              id="duracion"
              type="number"
              placeholder="90"
              value={formData.duracion}
              onChange={(e) => handleInputChange('duracion', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensidad">Intensidad</Label>
            <Select 
              onValueChange={(value) => handleInputChange('intensidad', value)} 
              value={formData.intensidad}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona intensidad" />
              </SelectTrigger>
              <SelectContent>
                {intensityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={`px-2 py-1 rounded text-xs ${level.color}`}>
                      {level.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tipo y ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Entrenamiento</Label>
            <Select 
              onValueChange={(value) => handleInputChange('tipo', value)} 
              value={formData.tipo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes[formType].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              placeholder="Gimnasio, Dojo, Casa..."
              value={formData.ubicacion}
              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
            />
          </div>
        </div>

        {/* Compañeros y objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="compañeros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Compañeros de Entrenamiento
            </Label>
            <Input
              id="compañeros"
              placeholder="Nombres de los compañeros..."
              value={formData.compañeros}
              onChange={(e) => handleInputChange('compañeros', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo del Entrenamiento</Label>
            <Input
              id="objetivo"
              placeholder="Mejorar técnica, resistencia..."
              value={formData.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
            />
          </div>
        </div>

        {/* Ejercicios/Técnicas */}
        <div className="space-y-2">
          <Label htmlFor={formType === 'physical' ? 'ejercicios' : 'tecnicas'}>
            {formType === 'physical' ? 'Ejercicios Realizados' : 'Técnicas Practicadas'}
          </Label>
          <Input
            id={formType === 'physical' ? 'ejercicios' : 'tecnicas'}
            placeholder={formType === 'physical' ? 
              "Sentadillas, Flexiones, Burpees... (separados por comas)" :
              "Ippon-seoi-nage, Uchi-mata, O-soto-gari... (separados por comas)"
            }
            value={formType === 'physical' ? 
              formData.ejercicios.join(', ') : 
              formData.tecnicasPracticadas.join(', ')
            }
            onChange={(e) => handleArrayInputChange(
              formType === 'physical' ? 'ejercicios' : 'tecnicasPracticadas', 
              e.target.value
            )}
          />
        </div>

        {/* Notas y observaciones */}
        <div className="space-y-2">
          <Label htmlFor="notas">Notas del Entrenamiento</Label>
          <Textarea
            id="notas"
            placeholder="Describe cómo te sentiste, logros, dificultades..."
            rows={3}
            value={formData.notas}
            onChange={(e) => handleInputChange('notas', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones Adicionales</Label>
          <Textarea
            id="observaciones"
            placeholder="Comentarios del entrenador, áreas de mejora..."
            rows={2}
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
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

export default OptimizedTrainingForm;