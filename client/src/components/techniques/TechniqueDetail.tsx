import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, Youtube, Play } from "lucide-react";

interface TechniqueDetailProps {
  technique: {
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
  } | null;
  onClose: () => void;
}

const TechniqueDetail = ({ technique, onClose }: TechniqueDetailProps) => {
  if (!technique) return null;

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <Dialog open={!!technique} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{technique.nombre}</DialogTitle>
            <Badge variant="secondary">{technique.categoria}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            {new Date(technique.fechaCreacion).toLocaleDateString()}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Descripción</h3>
            <p className="text-slate-700">{technique.descripcion}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Puntos Clave</h3>
            <p className="text-slate-700">{technique.puntosClaves}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Errores Comunes</h3>
            <p className="text-slate-700">{technique.erroresComunes}</p>
          </div>

          {/* Videos */}
          {(technique.videoYoutube || technique.videoUrl) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Videos</h3>
              <div className="space-y-4">
                {technique.videoYoutube && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Video de YouTube</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(technique.videoYoutube) || ""}
                        title="YouTube video"
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                
                {technique.videoUrl && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Video subido</span>
                    </div>
                    <div className="bg-black rounded-lg overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-64 object-contain"
                        preload="metadata"
                      >
                        <source src={technique.videoUrl} type="video/mp4" />
                        Tu navegador no soporta videos HTML5.
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotos */}
          {technique.fotos && technique.fotos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4" />
                <h3 className="font-semibold text-lg">Fotos ({technique.fotos.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {technique.fotos.map((foto, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img 
                      src={foto} 
                      alt={`Foto ${index + 1} de ${technique.nombre}`}
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(foto, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechniqueDetail;