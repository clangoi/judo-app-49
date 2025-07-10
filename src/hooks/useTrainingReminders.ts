
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrainingReminder {
  id: string;
  user_id: string;
  training_type: string;
  title: string;
  message?: string;
  days_of_week: number[];
  time_of_day: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateReminderData {
  training_type: string;
  title: string;
  message?: string;
  days_of_week: number[];
  time_of_day: string;
  is_active?: boolean;
}

export const useTrainingReminders = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['training_reminders', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('training_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TrainingReminder[];
    },
    enabled: !!userId,
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: CreateReminderData) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('training_reminders')
        .insert([{
          ...reminderData,
          user_id: userId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_reminders', userId] });
      toast({
        title: "Recordatorio creado",
        description: "El recordatorio ha sido configurado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el recordatorio.",
        variant: "destructive",
      });
    }
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateReminderData> }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data: updatedData, error } = await supabase
        .from('training_reminders')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_reminders', userId] });
      toast({
        title: "Recordatorio actualizado",
        description: "El recordatorio ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el recordatorio.",
        variant: "destructive",
      });
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('training_reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_reminders', userId] });
      toast({
        title: "Recordatorio eliminado",
        description: "El recordatorio ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el recordatorio.",
        variant: "destructive",
      });
    }
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('training_reminders')
        .update({ 
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_reminders', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del recordatorio.",
        variant: "destructive",
      });
    }
  });

  return {
    reminders,
    isLoading,
    createReminderMutation,
    updateReminderMutation,
    deleteReminderMutation,
    toggleReminderMutation
  };
};
