import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import { SocialShare } from "./achievements/SocialShare";
import { Card, CardContent } from "@/components/ui/card";

export const SocialShareButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const { user } = useAuth();
  const { userAchievements, isLoading } = useAchievements();

  const earnedAchievements = userAchievements.filter(ua => 
    ua.badge && ua.badge.criteriaValue && ua.achievement.progress >= ua.badge.criteriaValue
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
        title="Compartir logros en redes sociales"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compartir tus Logros en Redes Sociales</DialogTitle>
            <DialogDescription>
              Selecciona un logro para compartir en tus redes sociales
            </DialogDescription>
          </DialogHeader>

          {earnedAchievements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aún no tienes logros desbloqueados para compartir.</p>
              <p className="text-sm text-gray-400">Sigue entrenando para conseguir tus primeros logros!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lista de logros */}
              <div className="space-y-3">
                <h3 className="font-semibold">Tus Logros Desbloqueados:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {earnedAchievements.map((userAchievement) => (
                    <Card 
                      key={userAchievement.achievement.id}
                      className={`cursor-pointer transition-colors ${
                        selectedAchievement?.achievement.id === userAchievement.achievement.id 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAchievement(userAchievement)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">🏆</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{userAchievement.badge.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {userAchievement.badge.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Panel de compartir */}
              <div className="space-y-3">
                {selectedAchievement ? (
                  <>
                    <h3 className="font-semibold">Compartir: {selectedAchievement.badge.name}</h3>
                    <SocialShare 
                      achievement={selectedAchievement.badge}
                      userProgress={selectedAchievement.achievement}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500">
                    Selecciona un logro para compartir
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};