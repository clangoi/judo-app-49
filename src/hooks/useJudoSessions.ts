
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

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['judo-sessions', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No userId provided');
        return [];
      }
      
      console.log('Fetching judo sessions for user:', userId);
      
      // Filtrar solo sesiones de entrenamiento que sean específicamente de Judo usando training_category
      const { data: trainingSessions, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('training_category', 'judo')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching training sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Judo training sessions found:', trainingSessions?.length || 0);
      console.log('Judo training sessions data:', trainingSessions);

      const { data: randoriSessions, error: randoriError } = await supabase
        .from('randori_sessions')
        .select('*')
        .eq('user_id', userId);

      if (randoriError) {
        console.error('Error fetching randori sessions:', randoriError);
        throw randoriError;
      }

      console.log('Randori sessions found:', randoriSessions?.length || 0);

      const mappedSessions = trainingSessions.map(session => {
        const randori = randoriSessions.find(r => r.training_session_id === session.id);
        
        const mapped = {
          id: session.id,
          fecha: session.date,
          tipo: session.session_type,
          duracion: session.duration_minutes || 0,
          tecnicasPracticadas: session.notes?.split('FUNCIONO:')[0]?.replace(/\n/g, '') || '',
          queFunciono: session.notes?.split('FUNCIONO:')[1]?.split('NO_FUNCIONO:')[0]?.replace(/\n/g, '') || '',
          queNoFunciono: session.notes?.split('NO_FUNCIONO:')[1]?.replace(/\n/g, '') || '',
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
        
        console.log('Mapped judo session:', mapped);
        return mapped;
      });

      console.log('Final mapped judo sessions:', mappedSessions);
      return mappedSessions;
    },
    enabled: !!userId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (entrenamiento: Omit<EntrenamientoJudo, 'id'>) => {
      if (!userId) throw new Error('User not authenticated');

      console.log('Creating new training session:', entrenamiento);

      const notes = `${entrenamiento.tecnicasPracticadas}\nFUNCIONO:${entrenamiento.queFunciono}\nNO_FUNCIONO:${entrenamiento.queNoFunciono}`;

      const { data: session, error: sessionError } = await supabase
        .from('training_sessions')
        .insert({
          user_id: userId,
          date: entrenamiento.fecha,
          session_type: entrenamiento.tipo,
          duration_minutes: entrenamiento.duracion,
          notes,
          intensity: 5,
          training_category: 'judo'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating training session:', sessionError);
        throw sessionError;
      }

      console.log('Training session created successfully:', session);

      if (entrenamiento.randory) {
        console.log('Creating randori session for:', session.id);
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

        if (randoriError) {
          console.error('Error creating randori session:', randoriError);
          throw randoriError;
        }
        console.log('Randori session created successfully');
      }

      return session;
    },
    onSuccess: () => {
      console.log('Session created successfully, invalidating cache and refetching');
      queryClient.invalidateQueries({ queryKey: ['judo-sessions', userId] });
      // Forzar un refetch inmediato
      refetch();
      toast({
        title: "Éxito",
        description: "Entrenamiento guardado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error in createSessionMutation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el entrenamiento",
        variant: "destructive",
      });
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
          notes,
          training_category: 'judo'
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
      refetch();
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
      refetch();
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
