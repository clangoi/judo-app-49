import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";

export const AchievementTestButton: React.FC = () => {
  const { checkAchievements, isCheckingAchievements } = useAchievements();
  const { user } = useAuth();

  const handleTestNotification = () => {
    if (user?.id) {
      checkAchievements();
    }
  };

  if (!user) return null;

  return (
    <Button
      onClick={handleTestNotification}
      disabled={isCheckingAchievements}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Trophy className="w-4 h-4" />
      {isCheckingAchievements ? "Verificando..." : "Verificar Logros"}
    </Button>
  );
};