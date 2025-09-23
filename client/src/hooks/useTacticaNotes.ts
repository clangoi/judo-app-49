/**
 * Refactored Tactical Notes hook using generic CRUD operations
 * Eliminates 100+ lines of duplicated code with complex content parsing
 */
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { api } from '@/lib/api';

export interface PlanTactico {
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

interface CreateTacticalNoteInput {
  nombre: string;
  oponente?: string;
  objetivo: string;
  estrategia: string;
  tecnicasClaves: string;
  contraataques: string;
  notas?: string;
  fotos?: string[];
  videoUrl?: string;
}

// Advanced content parsing for tactical notes
const transformFromApi = (note: any): PlanTactico => {
  const content = note.content;
  const lines = content.split('\n');
  
  let objetivo = '';
  let estrategia = '';
  let tecnicasClaves = '';
  let contraataques = '';
  let notas = '';
  
  // Enhanced content parsing
  if (content.includes('ANÁLISIS') || content.includes('ESTRATEGIA')) {
    objetivo = lines[0] || '';
    estrategia = content.replace(lines[0], '').trim();
    tecnicasClaves = 'Revisar contenido completo';
    contraataques = 'Revisar contenido completo';
    notas = '';
  } else {
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
};

const transformToApiData = (data: CreateTacticalNoteInput | Partial<CreateTacticalNoteInput>) => ({
  title: data.nombre,
  content: `${data.objetivo}\n${data.estrategia}\n${data.tecnicasClaves}\n${data.contraataques}`,
  notes: data.notas,
  image_url: data.fotos?.[0] || null,
  video_url: data.videoUrl || null,
});

export const useTacticaNotes = () => {
  const crudConfig = {
    entityName: 'plan táctico',
    queryKey: (userId?: string) => ['tactical-notes', userId],
    api: {
      getAll: api.getTacticalNotes,
      create: api.createTacticalNote,
      update: api.updateTacticalNote,
      delete: api.deleteTacticalNote,
    },
    transform: {
      fromApi: transformFromApi,
      toCreateApi: transformToApiData,
      toUpdateApi: transformToApiData,
    },
    messages: {
      created: 'El plan táctico ha sido guardado exitosamente',
      updated: 'El plan táctico ha sido actualizado exitosamente',
      deleted: 'El plan táctico ha sido eliminado exitosamente',
      createError: 'No se pudo crear el plan táctico',
      updateError: 'No se pudo actualizar el plan táctico',
      deleteError: 'No se pudo eliminar el plan táctico',
    },
  };

  const {
    items: tacticalNotes,
    isLoading,
    createMutation: createNoteMutation,
    updateMutation: updateNoteMutation,
    deleteMutation: deleteNoteMutation,
  } = useCrudOperations<PlanTactico, CreateTacticalNoteInput>(crudConfig);

  return {
    tacticalNotes,
    isLoading,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
};