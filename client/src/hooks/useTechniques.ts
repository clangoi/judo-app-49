import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TecnicaDeportiva {
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
      const rawTechniques = await api.getTechniques(userId);
      
      // Transform API data to match UI interface
      return rawTechniques.map((technique: any) => {
        // Parse description to extract structured content
        const description = technique.description || '';
        const lines = description.split('\n');
        
        // Extract sections based on content structure
        let puntosClaves = '';
        let erroresComunes = '';
        let descripcionPrincipal = '';
        
        if (description.includes('PUNTOS CLAVE:') && description.includes('ERRORES COMUNES:')) {
          const puntosIndex = description.indexOf('PUNTOS CLAVE:');
          const erroresIndex = description.indexOf('ERRORES COMUNES:');
          
          descripcionPrincipal = description.substring(0, puntosIndex).trim();
          puntosClaves = description.substring(puntosIndex + 'PUNTOS CLAVE:'.length, erroresIndex).trim();
          erroresComunes = description.substring(erroresIndex + 'ERRORES COMUNES:'.length).trim();
        } else {
          descripcionPrincipal = lines[0] || '';
          puntosClaves = 'Revisar contenido completo';
          erroresComunes = 'Revisar contenido completo';
        }
        
        // Map belt level to Spanish
        const beltLevelMap: { [key: string]: string } = {
          'white': 'Cinturón Blanco',
          'yellow': 'Cinturón Amarillo',
          'orange': 'Cinturón Naranja', 
          'green': 'Cinturón Verde',
          'blue': 'Cinturón Azul',
          'brown': 'Cinturón Marrón',
          'black': 'Cinturón Negro'
        };
        
        return {
          id: technique.id,
          nombre: technique.name,
          categoria: beltLevelMap[technique.beltLevel] || technique.beltLevel,
          descripcion: descripcionPrincipal,
          puntosClaves,
          erroresComunes,
          fechaCreacion: new Date(technique.createdAt).toLocaleDateString(),
          fotos: technique.imageUrl ? [technique.imageUrl] : [],
          videoYoutube: technique.youtubeUrl || '',
          videoUrl: technique.videoUrl || '',
        };
      });
    },
    enabled: !!userId,
  });

  const createTechniqueMutation = useMutation({
    mutationFn: async (techniqueData: Omit<TecnicaDeportiva, 'id' | 'fechaCreacion'>) => {
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

  const updateTechniqueMutation = useMutation({
    mutationFn: async ({ id, techniqueData }: { id: string; techniqueData: Omit<TecnicaDeportiva, 'id' | 'fechaCreacion'> }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.updateTechnique(id, {
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
        title: "Técnica actualizada",
        description: "La técnica ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la técnica.",
        variant: "destructive",
      });
    },
  });

  const deleteTechniqueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      return await api.deleteTechnique(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques'] });
      toast({
        title: "Técnica eliminada",
        description: "La técnica ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la técnica.",
        variant: "destructive",
      });
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