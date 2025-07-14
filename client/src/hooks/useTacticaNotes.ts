
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlanTactico {
  id: string;
  nombre: string;
  oponente?: string;
  objetivo: string;
  estrategia: string;
  tecnicasClaves: string;
  contraataques: string;
  notas?: string;
  fechaCreacion: string;
  fotos?: string[];
  videoUrl?: string;
}

export const useTacticaNotes = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tacticalNotes = [], isLoading } = useQuery({
    queryKey: ['tactical-notes', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('tactical_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(note => ({
        id: note.id,
        nombre: note.title,
        oponente: '', // Se puede agregar esta columna más tarde si es necesario
        objetivo: note.content?.split('\n')[0] || '',
        estrategia: note.content?.split('\n')[1] || '',
        tecnicasClaves: note.content?.split('\n')[2] || '',
        contraataques: note.content?.split('\n')[3] || '',
        notas: note.content?.split('\n')[4] || '',
        fechaCreacion: new Date(note.created_at!).toLocaleDateString(),
        fotos: note.image_urls || [],
        videoUrl: note.video_url || undefined
      })) as PlanTactico[];
    },
    enabled: !!userId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (plan: Omit<PlanTactico, 'id' | 'fechaCreacion'>) => {
      if (!userId) throw new Error('User not authenticated');

      const content = [
        plan.objetivo,
        plan.estrategia,
        plan.tecnicasClaves,
        plan.contraataques,
        plan.notas || ''
      ].join('\n');

      const { data, error } = await supabase
        .from('tactical_notes')
        .insert({
          user_id: userId,
          title: plan.nombre,
          content,
          image_urls: plan.fotos && plan.fotos.length > 0 ? plan.fotos : null,
          video_url: plan.videoUrl || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactical-notes', userId] });
      toast({
        title: "Éxito",
        description: "Plan táctico guardado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar el plan táctico",
        variant: "destructive",
      });
      console.error('Error creating tactical note:', error);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: Omit<PlanTactico, 'id' | 'fechaCreacion'> }) => {
      const content = [
        plan.objetivo,
        plan.estrategia,
        plan.tecnicasClaves,
        plan.contraataques,
        plan.notas || ''
      ].join('\n');

      const { data, error } = await supabase
        .from('tactical_notes')
        .update({
          title: plan.nombre,
          content,
          image_urls: plan.fotos && plan.fotos.length > 0 ? plan.fotos : null,
          video_url: plan.videoUrl || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactical-notes', userId] });
      toast({
        title: "Éxito",
        description: "Plan táctico actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan táctico",
        variant: "destructive",
      });
      console.error('Error updating tactical note:', error);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tactical_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactical-notes', userId] });
      toast({
        title: "Éxito",
        description: "Plan táctico eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan táctico",
        variant: "destructive",
      });
      console.error('Error deleting tactical note:', error);
    },
  });

  return {
    tacticalNotes,
    isLoading,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
};
