
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Calendar, Edit, Trash2 } from "lucide-react";

interface ReminderCardProps {
  reminder: any;
  onEdit: (reminder: any) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

const trainingTypeLabels = {
  'judo': 'Entrenamientos de Judo',
  'physical_preparation': 'Preparación Física',
  'nutrition': 'Alimentación',
  'weight': 'Registro de Peso'
};

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ReminderCard = ({ reminder, onEdit, onDelete, onToggle }: ReminderCardProps) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayNames = (days: number[]) => {
    return days.sort().map(day => dayLabels[day]).join(', ');
  };

  return (
    <Card className={`transition-opacity ${reminder.is_active ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className={`h-4 w-4 ${reminder.is_active ? 'text-blue-500' : 'text-gray-400'}`} />
            {reminder.title}
          </CardTitle>
          <Switch
            checked={reminder.is_active}
            onCheckedChange={(checked) => onToggle(reminder.id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          {trainingTypeLabels[reminder.training_type as keyof typeof trainingTypeLabels]}
        </Badge>

        {reminder.message && (
          <p className="text-sm text-gray-600">{reminder.message}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(reminder.time_of_day)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {getDayNames(reminder.days_of_week)}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(reminder)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(reminder.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;
