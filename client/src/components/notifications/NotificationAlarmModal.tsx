import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NotificationAlarm } from "@/hooks/useNotificationAlarms";

const alarmSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  category: z.enum(["training", "weight", "nutrition"], {
    required_error: "Selecciona una categoría",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  days: z.array(z.string()).min(1, "Selecciona al menos un día"),
});

type AlarmFormValues = z.infer<typeof alarmSchema>;

interface NotificationAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AlarmFormValues) => void;
  alarm?: NotificationAlarm | null;
  isLoading?: boolean;
}

const categoryLabels = {
  training: "Entrenamiento",
  weight: "Peso",
  nutrition: "Nutrición",
};

const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes", 
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const dayOptions = Object.entries(dayLabels);

export const NotificationAlarmModal: React.FC<NotificationAlarmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  alarm,
  isLoading = false,
}) => {
  const isEditing = !!alarm;

  const form = useForm<AlarmFormValues>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      title: alarm?.title || "",
      category: alarm?.category || "training",
      time: alarm?.time || "18:00",
      days: alarm?.days || ["monday"],
    },
  });

  const onSubmit = (data: AlarmFormValues) => {
    onSave(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Alarma" : "Nueva Alarma de Notificación"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifica los detalles de la alarma de notificación."
              : "Crea una nueva alarma de notificación para recordatorios personalizados."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Alarma</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Entrenar en el dojo" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <FormLabel>Días de la Semana</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {dayOptions.map(([value, label]) => (
                      <FormField
                        key={value}
                        control={form.control}
                        name="days"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (val) => val !== value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Alarma"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};