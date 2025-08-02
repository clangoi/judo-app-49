
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Edit, Trash2 } from "lucide-react";

interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

interface SessionCardProps {
  sesion: SesionPreparacion;
  onView: (sesion: SesionPreparacion) => void;
  onEdit: (sesion: SesionPreparacion) => void;
  onDelete: (id: string) => void;
}

const SessionCard = ({ sesion, onView, onEdit, onDelete }: SessionCardProps) => {
  const getIntensidadColor = (intensidad: number) => {
    if (intensidad <= 3) return "bg-green-100 text-green-800";
    if (intensidad <= 6) return "bg-yellow-100 text-yellow-800";
    if (intensidad <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.")) {
      onDelete(sesion.id);
    }
  };

  return (
    <Card 
      className="bg-white border-[#C5A46C] cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onView(sesion)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-[#1A1A1A]">{sesion.session_type}</CardTitle>
            <p className="text-sm text-[#575757]">{sesion.date}</p>
          </div>
          <div className="flex gap-2">
            {sesion.intensity && (
              <div className={`px-2 py-1 rounded-full text-sm ${getIntensidadColor(sesion.intensity)}`}>
                Nivel {sesion.intensity}
              </div>
            )}
            {sesion.duration_minutes && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                <Clock className="h-3 w-3" />
                {sesion.duration_minutes} min
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sesion.notes && (
            <div>
              <h4 className="font-medium text-sm text-[#1A1A1A]">Notas:</h4>
              <p className="text-[#575757] line-clamp-2">{sesion.notes}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => onView(sesion)}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sesion);
              }}
              variant="outline"
              size="sm"
              className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
