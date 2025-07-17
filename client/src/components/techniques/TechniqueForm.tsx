import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Youtube, X, Loader2 } from "lucide-react";
import VideoUpload from "@/components/VideoUpload";

interface TechniqueFormData {
  nombre: string;
  categoria: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  videoYoutube: string;
  videoUrl: string;
  fotos: string[];
}

interface TechniqueFormProps {
  initialData?: TechniqueFormData;
  onSubmit: (data: TechniqueFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TechniqueForm = ({ initialData, onSubmit, onCancel, isLoading }: TechniqueFormProps) => {
  const [formData, setFormData] = useState<TechniqueFormData>(
    initialData || {
      nombre: "",
      categoria: "",
      descripcion: "",
      puntosClaves: "",
      erroresComunes: "",
      videoYoutube: "",
      videoUrl: "",
      fotos: []
    }
  );

  const handleInputChange = (field: keyof TechniqueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...newFotos] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const eliminarFoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setFormData(prev => ({ ...prev, videoUrl }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Técnica" : "Nueva Técnica"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Técnica</Label>
            <Input
              id="nombre"
              placeholder="Ej: Seoi-nage, Kata-guruma..."
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría/Grado</Label>
            <Input
              id="categoria"
              placeholder="Ej: Blanco, Amarillo, Naranja..."
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Describe la técnica y cómo se ejecuta..."
            rows={3}
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="puntosClaves">Puntos Clave</Label>
          <Textarea
            id="puntosClaves"
            placeholder="Los aspectos más importantes para ejecutar correctamente la técnica..."
            rows={3}
            value={formData.puntosClaves}
            onChange={(e) => handleInputChange('puntosClaves', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="erroresComunes">Errores Comunes</Label>
          <Textarea
            id="erroresComunes"
            placeholder="Errores que se suelen cometer al ejecutar esta técnica..."
            rows={3}
            value={formData.erroresComunes}
            onChange={(e) => handleInputChange('erroresComunes', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="videoYoutube">Video de YouTube (opcional)</Label>
          <Input
            id="videoYoutube"
            placeholder="https://youtube.com/watch?v=..."
            value={formData.videoYoutube}
            onChange={(e) => handleInputChange('videoYoutube', e.target.value)}
          />
        </div>

        <VideoUpload onVideoUploaded={handleVideoUploaded} />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4" />
            <Label>Fotos</Label>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFotoChange}
            className="w-full p-2 border rounded"
          />
          {formData.fotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {formData.fotos.map((foto, index) => (
                <div key={index} className="relative">
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6"
                    onClick={() => eliminarFoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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

export default TechniqueForm;