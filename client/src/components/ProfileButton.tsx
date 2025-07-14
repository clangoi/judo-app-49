
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useClubs } from "@/hooks/useClubs";
import { Button } from "@/components/ui/button";
import { ProfileModal } from "./ProfileModal";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// Removed supabase import

export const ProfileButton = () => {
  const { user } = useAuth();
  const { clubs } = useClubs();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener el perfil del usuario actual
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Encontrar el club del usuario
  const userClub = clubs.find(club => club.id === userProfile?.club_id);

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>{userProfile?.full_name || user.email}</span>
          {userClub && (
            <span className="text-xs text-muted-foreground">{userClub.name}</span>
          )}
        </div>
      </Button>
      
      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
