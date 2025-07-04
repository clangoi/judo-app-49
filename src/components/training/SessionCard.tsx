
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

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
}

const SessionCard = ({ sesion }: SessionCardProps) => {
  const getIntensidadColor = (intensidad: number) => {
    if (intensidad <= 2) return "bg-green-100 text-green-800";
    if (intensidad <= 5) return "bg-yellow-100 text-yellow-800";
    if (intensidad <= 13) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="bg-white border-[#C5A46C]">
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
              <p className="text-[#575757]">{sesion.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
