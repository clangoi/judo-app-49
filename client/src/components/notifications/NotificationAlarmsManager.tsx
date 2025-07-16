import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  Calendar,
  Dumbbell,
  Scale,
  Apple
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationAlarms, type NotificationAlarm } from "@/hooks/useNotificationAlarms";
import { NotificationAlarmModal } from "./NotificationAlarmModal";
import { cn } from "@/lib/utils";

interface NotificationAlarmsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryConfig = {
  training: {
    label: "Entrenamiento",
    icon: Dumbbell,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-950/30"
  },
  weight: {
    label: "Peso",
    icon: Scale,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50 dark:bg-green-950/30"
  },
  nutrition: {
    label: "Nutrición",
    icon: Apple,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 dark:bg-orange-950/30"
  }
};

const dayLabels = {
  monday: "Lun",
  tuesday: "Mar", 
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

export const NotificationAlarmsManager: React.FC<NotificationAlarmsManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<NotificationAlarm | null>(null);

  const {
    alarms,
    isLoading,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
  } = useNotificationAlarms(user?.id || "");

  const handleCreateAlarm = () => {
    setEditingAlarm(null);
    setIsAlarmModalOpen(true);
  };

  const handleEditAlarm = (alarm: NotificationAlarm) => {
    setEditingAlarm(alarm);
    setIsAlarmModalOpen(true);
  };

  const handleSaveAlarm = async (data: any) => {
    try {
      if (editingAlarm) {
        await updateAlarm.mutateAsync({
          alarmId: editingAlarm.id,
          ...data,
        });
      } else {
        await createAlarm.mutateAsync({
          userId: user?.id || "",
          ...data,
        });
      }
      setIsAlarmModalOpen(false);
      setEditingAlarm(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleDeleteAlarm = async (alarmId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta alarma?")) {
      await deleteAlarm.mutateAsync(alarmId);
    }
  };

  const handleToggleAlarm = async (alarmId: string, isActive: boolean) => {
    try {
      console.log('Frontend calling toggle for alarm:', alarmId, 'with isActive:', isActive);
      await toggleAlarm.mutateAsync({ alarmId, isActive });
      console.log('Toggle completed successfully');
    } catch (error) {
      console.error('Toggle failed in component:', error);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return time;
    }
  };

  const formatDays = (days: string[]) => {
    return days.map(day => dayLabels[day as keyof typeof dayLabels]).join(", ");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gestión de Alarmas
            </DialogTitle>
            <DialogDescription>
              Administra tus alarmas de notificación personalizadas para recordatorios de entrenamiento, peso y nutrición.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {alarms.length} alarma{alarms.length !== 1 ? 's' : ''} configurada{alarms.length !== 1 ? 's' : ''}
              </div>
              <Button onClick={handleCreateAlarm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Alarma
              </Button>
            </div>

            <ScrollArea className="max-h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Cargando alarmas...</div>
                </div>
              ) : alarms.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <div className="text-muted-foreground">No tienes alarmas configuradas</div>
                  <div className="text-sm text-muted-foreground">
                    Crea tu primera alarma para recibir recordatorios personalizados
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {alarms.map((alarm) => {
                    const config = categoryConfig[alarm.category];
                    const IconComponent = config.icon;
                    
                    return (
                      <Card
                        key={alarm.id}
                        className={cn(
                          "transition-all duration-200",
                          alarm.isActive ? config.bgColor : "bg-muted/30",
                          !alarm.isActive && "opacity-60"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={cn(
                                "p-2 rounded-lg",
                                alarm.isActive ? config.color : "bg-muted",
                                "text-white"
                              )}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {alarm.title}
                                  </h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "text-xs",
                                      alarm.isActive ? config.textColor : "text-muted-foreground"
                                    )}
                                  >
                                    {config.label}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(alarm.time)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDays(alarm.days)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={alarm.isActive}
                                onCheckedChange={(checked) => 
                                  handleToggleAlarm(alarm.id, checked)
                                }
                                size="sm"
                              />
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAlarm(alarm)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAlarm(alarm.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <NotificationAlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => {
          setIsAlarmModalOpen(false);
          setEditingAlarm(null);
        }}
        onSave={handleSaveAlarm}
        alarm={editingAlarm}
        isLoading={createAlarm.isPending || updateAlarm.isPending}
      />
    </>
  );
};