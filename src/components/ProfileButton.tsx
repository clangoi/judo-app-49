
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileModal } from "./ProfileModal";
import { User } from "lucide-react";

export const ProfileButton = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="text-sm text-[#575757] hover:text-[#C5A46C] flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        {user.email}
      </Button>
      
      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
