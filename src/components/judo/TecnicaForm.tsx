
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Youtube } from "lucide-react";
import VideoUpload from "@/components/VideoUpload";

const cinturones = [
  { value: "blanco", label: "Blanco", color: "bg-white border-gray-300" },
  { value: "amarillo", label: "Amarillo", color: "bg-yellow-400" },
  { value: "naranja", label: "Naranja", color: "bg-orange-400" },
  { value: "verde", label: "Verde", color: "bg-green-400" },
  { value: "azul", label: "Azul", color: "bg-blue-400" },
  { value: "marron", label: "Marrón", color: "bg-amber-700" },
  { value: "negro", label: "Negro", color: "bg-black" }
];

interface NuevaTecnicaForm {
  nombre: string;
  categoria: string;
  cinturon: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  videoYoutube: string;
  videoUrl: string;
  fotos: string[];
}

interface TecnicaFormProps {
  nuevaTecnica: NuevaTecnicaForm;
  setNuevaTecnica: (tecnica: NuevaTecnicaForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eliminarFoto: (index: number) => void;
  handleVideoUploaded: (videoUrl: string) => void;
  handleRemoveVideo: () => void;
}

const TecnicaForm = ({
  nuevaTecnica,
  setNuevaTecnica,
  onSubmit,
  onCancel,
  onFotoChange,
  eliminarFoto,
  handleVideoUploaded,
  handleRemoveVideo
}: TecnicaFormProps) => {
  return (
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
              onChange={onFotoChange}
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
          <Button onClick={onSubmit}>Guardar</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TecnicaForm;
