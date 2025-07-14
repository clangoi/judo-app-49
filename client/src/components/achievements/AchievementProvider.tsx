import React, { createContext, useContext, useState, useCallback } from "react";
import { AchievementNotification } from "./AchievementNotification";
import { AchievementBadge } from "@/hooks/useAchievements";

interface AchievementContextType {
  showAchievement: (badge: AchievementBadge) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievementNotifications = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievementNotifications must be used within AchievementProvider");
  }
  return context;
};

interface AchievementProviderProps {
  children: React.ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementBadge | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAchievement = useCallback((badge: AchievementBadge) => {
    setCurrentAchievement(badge);
    setIsVisible(true);
  }, []);

  const hideAchievement = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setCurrentAchievement(null), 300);
  }, []);

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {currentAchievement && (
        <AchievementNotification
          badge={currentAchievement}
          isVisible={isVisible}
          onClose={hideAchievement}
        />
      )}
    </AchievementContext.Provider>
  );
};