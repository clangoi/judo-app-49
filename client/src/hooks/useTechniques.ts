
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(technique => ({
        id: technique.id,
        nombre: technique.name,
        categoria: technique.belt_level,
        descripcion: technique.description || '',
        puntosClaves: technique.description?.split('PUNTOS_CLAVE:')[1]?.split('ERRORES:')[0] || '',
        erroresComunes: technique.description?.split('ERRORES:')[1] || '',
        fechaCreacion: new Date(technique.created_at!).toLocaleDateString(),
        fotos: technique.image_url ? [technique.image_url] : [],
        videoYoutube: technique.youtube_url || undefined,
        videoUrl: technique.video_url || undefined
      })) as TecnicaJudo[];
    },
    enabled: !!userId,
  });

  const createTechniqueMutation = useMutation({
    mutationFn: async (tecnica: Omit<TecnicaJudo, 'id' | 'fechaCreacion'>) => {
      if (!userId) throw new Error('User not authenticated');

      const description = `${tecnica.descripcion}\nPUNTOS_CLAVE:${tecnica.puntosClaves}\nERRORES:${tecnica.erroresComunes}`;

      const { data, error } = await supabase
        .from('techniques')
        .insert({
          user_id: userId,
          name: tecnica.nombre,
          belt_level: tecnica.categoria as any,
          description,
          image_url: tecnica.fotos && tecnica.fotos.length > 0 ? tecnica.fotos[0] : null,
          youtube_url: tecnica.videoYoutube || null,
          video_url: tecnica.videoUrl || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques', userId] });
      toast({
        title: "Éxito",
        description: "Técnica guardada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la técnica",
        variant: "destructive",
      });
      console.error('Error creating technique:', error);
    },
  });

  const updateTechniqueMutation = useMutation({
    mutationFn: async ({ id, tecnica }: { id: string; tecnica: Omit<TecnicaJudo, 'id' | 'fechaCreacion'> }) => {
      const description = `${tecnica.descripcion}\nPUNTOS_CLAVE:${tecnica.puntosClaves}\nERRORES:${tecnica.erroresComunes}`;

      const { data, error } = await supabase
        .from('techniques')
        .update({
          name: tecnica.nombre,
          belt_level: tecnica.categoria as any,
          description,
          image_url: tecnica.fotos && tecnica.fotos.length > 0 ? tecnica.fotos[0] : null,
          youtube_url: tecnica.videoYoutube || null,
          video_url: tecnica.videoUrl || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques', userId] });
      toast({
        title: "Éxito",
        description: "Técnica actualizada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la técnica",
        variant: "destructive",
      });
      console.error('Error updating technique:', error);
    },
  });

  const deleteTechniqueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('techniques')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques', userId] });
      toast({
        title: "Éxito",
        description: "Técnica eliminada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la técnica",
        variant: "destructive",
      });
      console.error('Error deleting technique:', error);
    },
  });

  return {
    techniques,
    isLoading,
    createTechniqueMutation,
    updateTechniqueMutation,
    deleteTechniqueMutation,
  };
};
