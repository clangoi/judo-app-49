
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Zap, Edit, Trash2 } from "lucide-react";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { useAuth } from "@/hooks/useAuth";

interface SesionPreparacion {
  id: string;
  date: string;
  session_type: string;
  duration_minutes: number;
  notes: string;
  intensity: number;
}

interface SessionDetailsModalProps {
  sesion: SesionPreparacion | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sesion: SesionPreparacion) => void;
  onDelete: (id: string) => void;
}

const SessionDetailsModal = ({ sesion, isOpen, onClose, onEdit, onDelete }: SessionDetailsModalProps) => {
  const { user } = useAuth();
  const { getSessionExercises } = useTrainingSessions(user?.id);
  
  const { data: exerciseRecords = [] } = sesion ? getSessionExercises(sesion.id) : { data: [] };

  if (!sesion) return null;

  const getIntensidadColor = (intensidad: number) => {
    if (intensidad <= 2) return "bg-green-100 text-green-800";
    if (intensidad <= 5) return "bg-yellow-100 text-yellow-800";
    if (intensidad <= 13) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.")) {
      onDelete(sesion.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold text-[#1A1A1A]">{sesion.session_type}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(sesion)}
                variant="outline"
                size="sm"
                className="border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información básica */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#575757]" />
                  <span className="text-sm text-[#575757]">{sesion.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#575757]" />
                  <span className="text-sm text-[#575757]">{sesion.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#575757]" />
                  <span className={`px-2 py-1 rounded-full text-sm ${getIntensidadColor(sesion.intensity)}`}>
                    Nivel {sesion.intensity}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          {sesion.notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-[#1A1A1A] mb-2">Notas:</h4>
                <p className="text-[#575757] whitespace-pre-wrap">{sesion.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Ejercicios realizados */}
          {exerciseRecords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-[#1A1A1A] mb-3">Ejercicios Realizados:</h4>
                <div className="space-y-3">
                  {exerciseRecords.map((record: any) => (
                    <div key={record.id} className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-[#1A1A1A]">
                        {record.exercises?.name || 'Ejercicio no encontrado'}
                      </h5>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#575757]">
                        {record.sets && <span>Series: {record.sets}</span>}
                        {record.reps && <span>Repeticiones: {record.reps}</span>}
                        {record.weight_kg && <span>Peso: {record.weight_kg}kg</span>}
                        {record.duration_minutes && <span>Duración: {record.duration_minutes}min</span>}
                      </div>
                      {record.notes && (
                        <p className="text-sm text-[#575757] mt-2 italic">"{record.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailsModal;
