import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
      return await api.getTacticalNotes(userId);
    },
    enabled: !!userId,
  });

  const createTacticalNoteMutation = useMutation({
    mutationFn: async (noteData: Omit<PlanTactico, 'id' | 'fechaCreacion'>) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.createTacticalNote({
        ...noteData,
        userId,
        title: noteData.nombre,
        content: `${noteData.objetivo}\n${noteData.estrategia}\n${noteData.tecnicasClaves}\n${noteData.contraataques}`,
        notes: noteData.notas,
        image_url: noteData.fotos?.[0] || null,
        video_url: noteData.videoUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactical-notes'] });
      toast({
        title: "Plan táctico creado",
        description: "El plan táctico ha sido guardado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el plan táctico.",
        variant: "destructive",
      });
    },
  });

  return {
    tacticalNotes,
    isLoading,
    createTacticalNoteMutation,
  };
};