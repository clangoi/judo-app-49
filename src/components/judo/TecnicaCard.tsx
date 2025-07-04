
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TecnicaJudo {
  id: string;
  nombre: string;
  categoria: string;
  cinturon: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  fechaCreacion: string;
  fotos?: string[];
  videoYoutube?: string;
  videoUrl?: string;
}

interface TecnicaCardProps {
  tecnica: TecnicaJudo;
  cinturonColor: (cinturon: string) => string;
}

const getYouTubeEmbedUrl = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const TecnicaCard = ({ tecnica, cinturonColor }: TecnicaCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{tecnica.nombre}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-600">{tecnica.categoria}</p>
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${cinturonColor(tecnica.cinturon)} border`}></div>
                <span className="text-sm text-slate-600 capitalize">{tecnica.cinturon}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {tecnica.fechaCreacion}
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
  );
};

export default TecnicaCard;
