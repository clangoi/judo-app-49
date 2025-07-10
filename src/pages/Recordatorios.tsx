
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingReminders } from "@/hooks/useTrainingReminders";
import NavHeader from "@/components/NavHeader";
import ReminderForm from "@/components/training/ReminderForm";
import ReminderCard from "@/components/training/ReminderCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Loader2 } from "lucide-react";

const Recordatorios = () => {
  const { user } = useAuth();
  const { 
    reminders, 
    isLoading, 
    createReminderMutation, 
    updateReminderMutation, 
    deleteReminderMutation,
    toggleReminderMutation
  } = useTrainingReminders(user?.id);
  
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const handleSubmit = (data: any) => {
    if (editingReminder) {
      updateReminderMutation.mutate(
        { id: editingReminder.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingReminder(null);
          }
        }
      );
    } else {
      createReminderMutation.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        }
      });
    }
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este recordatorio?")) {
      deleteReminderMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleReminderMutation.mutate({ id, is_active: isActive });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Recordatorios" 
        subtitle="Configura notificaciones para tus entrenamientos"
      />
      
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mb-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Recordatorio
        </Button>

        {showForm && (
          <ReminderForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createReminderMutation.isPending || updateReminderMutation.isPending}
            editingReminder={editingReminder}
          />
        )}

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No hay recordatorios configurados aún</p>
                <p className="text-sm text-slate-500">Crea tu primer recordatorio de entrenamiento</p>
              </CardContent>
            </Card>
          ) : (
            reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Recordatorios;
