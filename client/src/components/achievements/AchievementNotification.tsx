import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, X, Sparkles } from "lucide-react";
import { AchievementBadge as BadgeType } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
  badge: BadgeType;
  isVisible: boolean;
  onClose: () => void;
  autoHideDelay?: number;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  badge,
  isVisible,
  onClose,
  autoHideDelay = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onClose, 300); // Wait for animation to complete
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHideDelay, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 transition-all duration-300 transform",
      isAnimating ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
    )}>
      <Card className="w-80 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Achievement Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    ¡Nuevo logro desbloqueado!
                  </p>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {badge.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {badge.category}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAnimating(false);
                    setTimeout(onClose, 300);
                  }}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress animation effect */}
          <div className="mt-3 h-1 bg-yellow-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full bg-yellow-500 transition-all duration-1000 ease-out",
                isAnimating ? "w-full" : "w-0"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};