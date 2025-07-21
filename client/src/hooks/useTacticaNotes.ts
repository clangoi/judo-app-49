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
      const rawNotes = await api.getTacticalNotes(userId);
      
      // Transform API data to match UI interface
      return rawNotes.map((note: any) => {
        // Parse structured content
        const content = note.content;
        const lines = content.split('\n');
        
        // Extract sections based on content structure
        let objetivo = '';
        let estrategia = '';
        let tecnicasClaves = '';
        let contraataques = '';
        let notas = '';
        
        // Try to parse structured content
        if (content.includes('ANÁLISIS') || content.includes('ESTRATEGIA')) {
          // For structured content, extract the first paragraph as objetivo
          objetivo = lines[0] || '';
          // Use the rest as strategy notes
          estrategia = content.replace(lines[0], '').trim();
          tecnicasClaves = 'Revisar contenido completo';
          contraataques = 'Revisar contenido completo';
          notas = '';
        } else {
          // For simple content, split by lines
          objetivo = lines[0] || '';
          estrategia = lines[1] || '';
          tecnicasClaves = lines[2] || '';
          contraataques = lines[3] || '';
          notas = lines.slice(4).join('\n') || '';
        }
        
        return {
          id: note.id,
          nombre: note.title,
          oponente: '', // Can be extracted from title or content if needed
          objetivo,
          estrategia,
          tecnicasClaves,
          contraataques,
          notas,
          fechaCreacion: new Date(note.createdAt).toLocaleDateString(),
          fotos: note.imageUrls || [],
          videoUrl: note.videoUrl || '',
        };
      });
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

  const updateTacticalNoteMutation = useMutation({
    mutationFn: async ({ id, noteData }: { id: string; noteData: Omit<PlanTactico, 'id' | 'fechaCreacion'> }) => {
      if (!userId) throw new Error('Usuario no autenticado');
      
      return await api.updateTacticalNote(id, {
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
        title: "Plan táctico actualizado",
        description: "El plan táctico ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el plan táctico.",
        variant: "destructive",
      });
    },
  });

  const deleteTacticalNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Usuario no autenticado');
      return await api.deleteTacticalNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tactical-notes'] });
      toast({
        title: "Plan táctico eliminado",
        description: "El plan táctico ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el plan táctico.",
        variant: "destructive",
      });
    },
  });

  return {
    tacticalNotes,
    isLoading,
    createNoteMutation: createTacticalNoteMutation,
    updateNoteMutation: updateTacticalNoteMutation,
    deleteNoteMutation: deleteTacticalNoteMutation,
  };
};