
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoJudo {
  id: string;
  fecha: string;
  tipo: string;
  duracion: number;
  tecnicasPracticadas: string;
  queFunciono: string;
  queNoFunciono: string;
  comentarios?: string;
  randory?: RandoryInfo;
  videoUrl?: string;
}

export const useJudoSessions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['judo-sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: trainingSessions, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('session_type', 'Judo')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const { data: randoriSessions, error: randoriError } = await supabase
        .from('randori_sessions')
        .select('*')
        .eq('user_id', userId);

      if (randoriError) throw randoriError;

      return trainingSessions.map(session => {
        const randori = randoriSessions.find(r => r.training_session_id === session.id);
        
        return {
          id: session.id,
          fecha: session.date,
          tipo: session.session_type,
          duracion: session.duration_minutes || 0,
          tecnicasPracticadas: session.notes?.split('FUNCIONO:')[0] || '',
          queFunciono: session.notes?.split('FUNCIONO:')[1]?.split('NO_FUNCIONO:')[0] || '',
          queNoFunciono: session.notes?.split('NO_FUNCIONO:')[1] || '',
          comentarios: '',
          randory: randori ? {
            oponente: randori.opponent_name,
            tecnicasIntentadas: randori.techniques_attempted?.join(', ') || '',
            tecnicasFuncionaron: randori.techniques_successful?.join(', ') || '',
            tecnicasNoFuncionaron: randori.techniques_failed?.join(', ') || '',
            tecnicasQueRecibio: randori.techniques_received?.join(', ') || ''
          } : undefined,
          videoUrl: undefined
        } as EntrenamientoJudo;
      });
    },
    enabled: !!userId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (entrenamiento: Omit<EntrenamientoJudo, 'id'>) => {
      if (!userId) throw new Error('User not authenticated');

      const notes = `${entrenamiento.tecnicasPracticadas}\nFUNCIONO:${entrenamiento.queFunciono}\nNO_FUNCIONO:${entrenamiento.queNoFunciono}`;

      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .insert({
          user_id: userId,
          date: entrenamiento.fecha,
          session_type: entrenamiento.tipo,
          duration_minutes: entrenamiento.duracion,
          notes,
          intensity: 5
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      if (entrenamiento.randory) {
        const { error: randoriError } = await supabase
          .from('randori_sessions')
          .insert({
            user_id: userId,
            training_session_id: session.id,
            opponent_name: entrenamiento.randory.oponente,
            techniques_attempted: entrenamiento.randory.tecnicasIntentadas.split(', ').filter(t => t.trim()),
            techniques_successful: entrenamiento.randory.tecnicasFuncionaron.split(', ').filter(t => t.trim()),
            techniques_failed: entrenamiento.randory.tecnicasNoFuncionaron.split(', ').filter(t => t.trim()),
            techniques_received: entrenamiento.randory.tecnicasQueRecibio.split(', ').filter(t => t.trim())
          });

        if (randoriError) throw randoriError;
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judo-sessions', userId] });
      toast({
        title: "Éxito",
        description: "Entrenamiento guardado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar el entrenamiento",
        variant: "destructive",
      });
      console.error('Error creating judo session:', error);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, entrenamiento }: { id: string; entrenamiento: Omit<EntrenamientoJudo, 'id'> }) => {
      const notes = `${entrenamiento.tecnicasPracticadas}\nFUNCIONO:${entrenamiento.queFunciono}\nNO_FUNCIONO:${entrenamiento.queNoFunciono}`;

      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .update({
          date: entrenamiento.fecha,
          session_type: entrenamiento.tipo,
          duration_minutes: entrenamiento.duracion,
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Delete existing randori session
      await supabase
        .from('randori_sessions')
        .delete()
        .eq('training_session_id', id);

      // Create new randori session if provided
      if (entrenamiento.randory) {
        const { error: randoriError } = await supabase
          .from('randori_sessions')
          .insert({
            user_id: userId!,
            training_session_id: id,
            opponent_name: entrenamiento.randory.oponente,
            techniques_attempted: entrenamiento.randory.tecnicasIntentadas.split(', ').filter(t => t.trim()),
            techniques_successful: entrenamiento.randory.tecnicasFuncionaron.split(', ').filter(t => t.trim()),
            techniques_failed: entrenamiento.randory.tecnicasNoFuncionaron.split(', ').filter(t => t.trim()),
            techniques_received: entrenamiento.randory.tecnicasQueRecibio.split(', ').filter(t => t.trim())
          });

        if (randoriError) throw randoriError;
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judo-sessions', userId] });
      toast({
        title: "Éxito",
        description: "Entrenamiento actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el entrenamiento",
        variant: "destructive",
      });
      console.error('Error updating judo session:', error);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete randori session first
      await supabase
        .from('randori_sessions')
        .delete()
        .eq('training_session_id', id);

      // Delete training session
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judo-sessions', userId] });
      toast({
        title: "Éxito",
        description: "Entrenamiento eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
        variant: "destructive",
      });
      console.error('Error deleting judo session:', error);
    },
  });

  return {
    sessions,
    isLoading,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
  };
};
