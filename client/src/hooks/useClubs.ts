import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useClubs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los clubes (para entrenadores y admins)
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      return [];
    },
  });

  // Crear nuevo club
  const createClubMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      // Placeholder for club creation
      return { id: '1', name, description };
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
      return await api.uploadFile(file);
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

  return {
    clubs,
    isLoading,
    createClubMutation,
    uploadLogoMutation,
  };
};