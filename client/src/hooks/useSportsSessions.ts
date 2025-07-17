import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoDeportivo {
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

export const useSportsSessions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['sports-sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const rawSessions = await api.getJudoTrainingSessions(userId);
      
      // Transform database format to frontend format
      return rawSessions.map((session: any) => ({
        id: session.id,
        fecha: session.date,
        tipo: session.sessionType,
        duracion: session.durationMinutes || 0,
        tecnicasPracticadas: session.techniquesPracticed || '',
        queFunciono: session.whatWorked || '',
        queNoFunciono: session.whatDidntWork || '',
        comentarios: session.notes || '',
        videoUrl: session.videoUrl || '',
      }));
    },
    enabled: !!userId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<EntrenamientoDeportivo, 'id'>) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.createJudoTrainingSession({
        userId,
        date: sessionData.fecha,
        sessionType: sessionData.tipo,
        durationMinutes: sessionData.duracion,
        techniquesPracticed: sessionData.tecnicasPracticadas || '',
        whatWorked: sessionData.queFunciono || '',
        whatDidntWork: sessionData.queNoFunciono || '',
        notes: sessionData.comentarios || '',
        videoUrl: sessionData.videoUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports-sessions'] });
      toast({
        title: "Sesión guardada",
        description: "La sesión de entrenamiento ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la sesión.",
        variant: "destructive",
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, entrenamiento }: { id: string; entrenamiento: Omit<EntrenamientoDeportivo, 'id'> }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.updateJudoTrainingSession(id, {
        userId,
        date: entrenamiento.fecha,
        sessionType: entrenamiento.tipo,
        durationMinutes: entrenamiento.duracion,
        techniquesPracticed: entrenamiento.tecnicasPracticadas || '',
        whatWorked: entrenamiento.queFunciono || '',
        whatDidntWork: entrenamiento.queNoFunciono || '',
        notes: entrenamiento.comentarios || '',
        videoUrl: entrenamiento.videoUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports-sessions'] });
      toast({
        title: "Sesión actualizada",
        description: "La sesión de entrenamiento ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la sesión.",
        variant: "destructive",
      });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await api.deleteJudoTrainingSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports-sessions'] });
      toast({
        title: "Sesión eliminada",
        description: "La sesión de entrenamiento ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la sesión.",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    refetch,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
  };
};