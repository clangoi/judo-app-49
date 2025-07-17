import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Eye, Edit, Trash2, Youtube, Camera } from "lucide-react";

interface TechniqueCardProps {
  technique: {
    id: string;
    nombre: string;
    categoria: string;
    descripcion: string;
    fechaCreacion: string;
    fotos?: string[];
    videoYoutube?: string;
    videoUrl?: string;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const TechniqueCard = ({ technique, onView, onEdit, onDelete, isDeleting }: TechniqueCardProps) => {
  const hasMedia = (technique.fotos && technique.fotos.length > 0) || technique.videoYoutube || technique.videoUrl;

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{technique.nombre}</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {technique.categoria}
              </Badge>
              {hasMedia && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Camera className="h-3 w-3 mr-1" />
                  Media
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              {new Date(technique.fechaCreacion).toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-slate-600 text-sm line-clamp-2">
          {technique.descripcion}
        </p>
        
        {hasMedia && (
          <div className="flex gap-2 mt-3">
            {technique.fotos && technique.fotos.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Camera className="h-3 w-3 mr-1" />
                {technique.fotos.length} foto{technique.fotos.length > 1 ? 's' : ''}
              </Badge>
            )}
            {technique.videoYoutube && (
              <Badge variant="outline" className="text-xs text-red-600">
                <Youtube className="h-3 w-3 mr-1" />
                YouTube
              </Badge>
            )}
            {technique.videoUrl && (
              <Badge variant="outline" className="text-xs text-blue-600">
                <Camera className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechniqueCard;