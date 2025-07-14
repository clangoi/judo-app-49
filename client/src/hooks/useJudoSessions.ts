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
      if (!userId) return [];
      return await api.getTrainingSessions(userId);
    },
    enabled: !!userId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<EntrenamientoJudo, 'id'>) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.createTrainingSession({
        ...sessionData,
        userId,
        date: sessionData.fecha,
        session_type: sessionData.tipo,
        duration_minutes: sessionData.duracion,
        notes: sessionData.comentarios || '',
        training_category: 'judo',
        video_url: sessionData.videoUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judo-sessions'] });
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

  return {
    sessions,
    isLoading,
    refetch,
    createSessionMutation,
  };
};