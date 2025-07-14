import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TecnicaJudo {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  fechaCreacion: string;
  fotos?: string[];
  videoYoutube?: string;
  videoUrl?: string;
}

export const useTechniques = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: techniques = [], isLoading } = useQuery({
    queryKey: ['techniques', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await api.getTechniques(userId);
    },
    enabled: !!userId,
  });

  const createTechniqueMutation = useMutation({
    mutationFn: async (techniqueData: Omit<TecnicaJudo, 'id' | 'fechaCreacion'>) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.createTechnique({
        ...techniqueData,
        userId,
        name: techniqueData.nombre,
        belt_level: techniqueData.categoria,
        description: techniqueData.descripcion,
        image_url: techniqueData.fotos?.[0] || null,
        video_url: techniqueData.videoUrl || null,
        youtube_url: techniqueData.videoYoutube || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques'] });
      toast({
        title: "Técnica creada",
        description: "La técnica ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la técnica.",
        variant: "destructive",
      });
    },
  });

  return {
    techniques,
    isLoading,
    createTechniqueMutation,
  };
};