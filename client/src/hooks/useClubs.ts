
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      // Use direct query with type casting since TypeScript types haven't been updated yet
      const { data, error } = await (supabase as any)
        .from('clubs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []) as Club[];
    },
  });

  // Crear nuevo club
  const createClubMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase as any)
        .from('clubs')
        .insert({
          name,
          description,
          created_by: userData.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    }
  });

  // Actualizar club
  const updateClubMutation = useMutation({
    mutationFn: async ({ id, name, description, logo_url }: { id: string; name: string; description?: string; logo_url?: string }) => {
      const { data, error } = await (supabase as any)
        .from('clubs')
        .update({ name, description, logo_url })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    }
  });

  // Eliminar club
  const deleteClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const { error } = await (supabase as any)
        .from('clubs')
        .delete()
        .eq('id', clubId);
      
      if (error) throw error;
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
    }
  });

  // Subir logo de club
  const uploadClubLogoMutation = useMutation({
    mutationFn: async ({ file, clubId }: { file: File; clubId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clubId}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-logos')
        .getPublicUrl(filePath);

      // Actualizar el club con la URL del logo
      const { error: updateError } = await (supabase as any)
        .from('clubs')
        .update({ logo_url: publicUrl })
        .eq('id', clubId);

      if (updateError) throw updateError;

      return publicUrl;
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
    }
  });

  return {
    clubs,
    isLoading,
    createClubMutation,
    updateClubMutation,
    deleteClubMutation,
    uploadClubLogoMutation,
  };
};
