import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Club {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  logo_url?: string; // Para compatibilidad
  created_by: string;
  created_at: string;
  updated_at: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const useClubs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los clubes (para entrenadores y admins)
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      return await api.getClubs();
    },
  });

  // Crear nuevo club
  const createClubMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      return await api.createClub({ name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club creado",
        description: "El club ha sido creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el club.",
        variant: "destructive",
      });
    },
  });

  // Subir logo
  const uploadLogoMutation = useMutation({
    mutationFn: async ({ file, clubId }: { file: File; clubId: string }) => {
      // First upload the file
      const uploadResult = await api.uploadFile(file);
      // Then update the club with the logo URL
      const updatedClub = await api.updateClubLogo(clubId, uploadResult.url);
      return updatedClub;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Logo subido",
        description: "El logo del club ha sido subido exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el logo.",
        variant: "destructive",
      });
    },
  });

  // Actualizar club
  const updateClubMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      return await api.updateClub(id, { name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club actualizado",
        description: "El club ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el club.",
        variant: "destructive",
      });
    },
  });

  // Eliminar club
  const deleteClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      return await api.deleteClub(clubId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: "Club eliminado",
        description: "El club ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el club.",
        variant: "destructive",
      });
    },
  });

  return {
    clubs,
    isLoading,
    createClubMutation,
    updateClubMutation,
    deleteClubMutation,
    uploadClubLogoMutation: uploadLogoMutation,
  };
};