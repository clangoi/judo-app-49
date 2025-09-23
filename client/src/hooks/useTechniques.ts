/**
 * Refactored Techniques hook using generic CRUD operations
 * Eliminates 100+ lines of duplicated code with complex data transformations
 */
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { api } from '@/lib/api';

export interface TecnicaDeportiva {
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

interface CreateTechniqueInput {
  nombre: string;
  categoria: string;
  descripcion: string;
  puntosClaves: string;
  erroresComunes: string;
  fotos?: string[];
  videoYoutube?: string;
  videoUrl?: string;
}

// Enhanced data transformations
const transformFromApi = (technique: any): TecnicaDeportiva => {
  const description = technique.description || '';
  const lines = description.split('\n');
  
  // Extract structured content
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
  
  // Belt level mapping
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
};

const transformToCreateApi = (data: CreateTechniqueInput) => ({
  name: data.nombre,
  belt_level: data.categoria,
  description: data.descripcion,
  image_url: data.fotos?.[0] || null,
  video_url: data.videoUrl || null,
  youtube_url: data.videoYoutube || null,
});

const transformToUpdateApi = (data: Partial<CreateTechniqueInput>) => ({
  name: data.nombre,
  belt_level: data.categoria,
  description: data.descripcion,
  image_url: data.fotos?.[0] || null,
  video_url: data.videoUrl || null,
  youtube_url: data.videoYoutube || null,
});

export const useTechniques = () => {
  const crudConfig = {
    entityName: 'técnica',
    queryKey: (userId?: string) => ['techniques', userId],
    api: {
      getAll: api.getTechniques,
      create: api.createTechnique,
      update: api.updateTechnique,
      delete: api.deleteTechnique,
    },
    transform: {
      fromApi: transformFromApi,
      toCreateApi: transformToCreateApi,
      toUpdateApi: transformToUpdateApi,
    },
    messages: {
      created: 'La técnica ha sido guardada exitosamente',
      updated: 'La técnica ha sido actualizada exitosamente',
      deleted: 'La técnica ha sido eliminada exitosamente',
      createError: 'No se pudo crear la técnica',
      updateError: 'No se pudo actualizar la técnica',
      deleteError: 'No se pudo eliminar la técnica',
    },
  };

  const {
    items: techniques,
    isLoading,
    createMutation: createTechniqueMutation,
    updateMutation: updateTechniqueMutation,
    deleteMutation: deleteTechniqueMutation,
  } = useCrudOperations<TecnicaDeportiva, CreateTechniqueInput>(crudConfig);

  return {
    techniques,
    isLoading,
    createTechniqueMutation,
    updateTechniqueMutation,
    deleteTechniqueMutation,
  };
};