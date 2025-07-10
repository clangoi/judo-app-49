
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Loader2 } from "lucide-react";

interface ReminderFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  editingReminder?: any;
}

const trainingTypes = [
  { value: 'judo', label: 'Entrenamientos de Judo' },
  { value: 'physical_preparation', label: 'Preparación Física' },
  { value: 'nutrition', label: 'Alimentación' },
  { value: 'weight', label: 'Registro de Peso' }
];

const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

const ReminderForm = ({ onSubmit, onCancel, isLoading, editingReminder }: ReminderFormProps) => {
  const [formData, setFormData] = useState({
    training_type: editingReminder?.training_type || "",
    title: editingReminder?.title || "",
    message: editingReminder?.message || "",
    time_of_day: editingReminder?.time_of_day || "09:00",
    days_of_week: editingReminder?.days_of_week || [],
    is_active: editingReminder?.is_active ?? true
  });

  const handleDayToggle = (day: number) => {
    const newDays = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter(d => d !== day)
      : [...formData.days_of_week, day];
    
    setFormData({ ...formData, days_of_week: newDays });
  };

  const handleSubmit = () => {
    if (!formData.training_type || !formData.title || formData.days_of_week.length === 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {editingReminder ? "Editar Recordatorio" : "Nuevo Recordatorio"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="training_type">Tipo de Entrenamiento</Label>
          <Select 
            value={formData.training_type} 
            onValueChange={(value) => setFormData({ ...formData, training_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de entrenamiento" />
            </SelectTrigger>
            <SelectContent>
              {trainingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Título del Recordatorio</Label>
          <Input
            id="title"
            placeholder="Ej: Recordar entrenar judo"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="message">Mensaje (Opcional)</Label>
          <Textarea
            id="message"
            placeholder="Mensaje personalizado para el recordatorio..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="time_of_day">Hora del Recordatorio</Label>
          <Input
            id="time_of_day"
            type="time"
            value={formData.time_of_day}
            onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
          />
        </div>

        <div>
          <Label>Días de la Semana</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={formData.days_of_week.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label htmlFor={`day-${day.value}`} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
          />
          <Label htmlFor="is_active">Recordatorio activo</Label>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              editingReminder ? "Actualizar" : "Crear"
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

export default ReminderForm;
