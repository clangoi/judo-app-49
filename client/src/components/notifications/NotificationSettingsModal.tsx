import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotificationSettings } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Settings } from 'lucide-react';

const notificationSettingsSchema = z.object({
  trainingReminder: z.boolean(),
  trainingReminderTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  trainingReminderDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
  weightReminder: z.boolean(),
  weightReminderTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  weightReminderDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
  nutritionReminder: z.boolean(),
  nutritionReminderTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  nutritionReminderDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
});

type FormValues = z.infer<typeof notificationSettingsSchema>;

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, createSettings } = useNotificationSettings(user?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      trainingReminder: true,
      trainingReminderTime: '18:00',
      trainingReminderDays: ['monday', 'wednesday', 'friday'],
      weightReminder: true,
      weightReminderTime: '08:00',
      weightReminderDays: ['monday'],
      nutritionReminder: true,
      nutritionReminderTime: '20:00',
      nutritionReminderDays: ['sunday'],
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        trainingReminder: settings.trainingReminder,
        trainingReminderTime: settings.trainingReminderTime,
        trainingReminderDays: settings.trainingReminderDays,
        weightReminder: settings.weightReminder,
        weightReminderTime: settings.weightReminderTime,
        weightReminderDays: settings.weightReminderDays,
        nutritionReminder: settings.nutritionReminder,
        nutritionReminderTime: settings.nutritionReminderTime,
        nutritionReminderDays: settings.nutritionReminderDays,
      });
    }
  }, [settings, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (settings) {
        await updateSettings.mutateAsync(values);
      } else {
        await createSettings.mutateAsync({
          userId: user!.id,
          ...values,
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDayToggle = (fieldName: keyof FormValues, day: string) => {
    const currentDays = form.getValues(fieldName) as string[];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    form.setValue(fieldName, newDays);
  };

  const isSaving = updateSettings.isPending || createSettings.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Notificaciones
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando configuración...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Recordatorios de Entrenamiento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Recordatorios de Entrenamiento</h3>
                
                <FormField
                  control={form.control}
                  name="trainingReminder"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Activar recordatorios de entrenamiento</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('trainingReminder') && (
                  <>
                    <FormField
                      control={form.control}
                      name="trainingReminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora del recordatorio</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trainingReminderDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de la semana</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`training-${day.value}`}
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={() => handleDayToggle('trainingReminderDays', day.value)}
                                />
                                <label htmlFor={`training-${day.value}`} className="text-sm">
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Recordatorios de Peso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Recordatorios de Peso</h3>
                
                <FormField
                  control={form.control}
                  name="weightReminder"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Activar recordatorios de peso</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('weightReminder') && (
                  <>
                    <FormField
                      control={form.control}
                      name="weightReminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora del recordatorio</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weightReminderDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de la semana</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`weight-${day.value}`}
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={() => handleDayToggle('weightReminderDays', day.value)}
                                />
                                <label htmlFor={`weight-${day.value}`} className="text-sm">
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Recordatorios de Nutrición */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Recordatorios de Nutrición</h3>
                
                <FormField
                  control={form.control}
                  name="nutritionReminder"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Activar recordatorios de nutrición</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('nutritionReminder') && (
                  <>
                    <FormField
                      control={form.control}
                      name="nutritionReminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora del recordatorio</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nutritionReminderDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de la semana</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`nutrition-${day.value}`}
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={() => handleDayToggle('nutritionReminderDays', day.value)}
                                />
                                <label htmlFor={`nutrition-${day.value}`} className="text-sm">
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar Configuración
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};