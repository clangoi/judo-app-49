import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAchievementNotifications } from "@/components/achievements/AchievementProvider";

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: 'training' | 'technique' | 'consistency' | 'weight' | 'nutrition';
  criteriaType: 'count' | 'streak' | 'milestone' | 'achievement';
  criteriaValue: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  progress: number;
  level: number;
  isNotified: boolean;
}

export interface UserAchievementWithBadge {
  achievement: UserAchievement;
  badge: AchievementBadge;
}

export const useAchievements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showAchievement } = useAchievementNotifications();

  // Get all available achievement badges
  const { data: badges = [], isLoading: isLoadingBadges } = useQuery({
    queryKey: ['achievement-badges'],
    queryFn: async (): Promise<AchievementBadge[]> => {
      const response = await fetch('/api/achievement-badges');
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json();
    },
  });

  // Get user's achievements
  const { data: userAchievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async (): Promise<UserAchievementWithBadge[]> => {
      if (!user?.id) return [];
      const response = await fetch(`/api/user-achievements?user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user achievements');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Check for new achievements
  const checkAchievementsMutation = useMutation({
    mutationFn: async (): Promise<{ newAchievements: UserAchievementWithBadge[] }> => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch(`/api/check-achievements/${user.id}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to check achievements');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.newAchievements.length > 0) {
        // Show achievement notifications
        data.newAchievements.forEach(({ badge }) => {
          showAchievement(badge);
          toast({
            title: "¡Nuevo logro desbloqueado!",
            description: `Has conseguido: ${badge.name}`,
            duration: 3000,
          });
        });
        
        // Invalidate achievements query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      }
    },
    onError: (error: any) => {
      console.error('Error checking achievements:', error);
    },
  });

  // Create a new achievement badge (admin only)
  const createBadgeMutation = useMutation({
    mutationFn: async (badge: Omit<AchievementBadge, 'id' | 'createdAt'>): Promise<AchievementBadge> => {
      const response = await fetch('/api/achievement-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badge),
      });
      if (!response.ok) throw new Error('Failed to create badge');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement-badges'] });
      toast({
        title: "Insignia creada",
        description: "Nueva insignia de logro creada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la insignia.",
        variant: "destructive",
      });
    },
  });

  // Get achievement statistics
  const getAchievementStats = () => {
    const totalBadges = badges.length;
    const earnedBadges = userAchievements.length;
    const completionRate = totalBadges > 0 ? (earnedBadges / totalBadges) * 100 : 0;
    
    const categoryCounts = badges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const earnedCategoryCounts = userAchievements.reduce((acc, { badge }) => {
      if (badge && badge.category) {
        acc[badge.category] = (acc[badge.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBadges,
      earnedBadges,
      completionRate,
      categoryCounts,
      earnedCategoryCounts,
    };
  };

  // Get recent achievements (last 30 days)
  const getRecentAchievements = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return userAchievements.filter(({ achievement }) => 
      new Date(achievement.earnedAt) >= thirtyDaysAgo
    );
  };

  return {
    badges,
    userAchievements,
    isLoading: isLoadingBadges || isLoadingAchievements,
    checkAchievements: checkAchievementsMutation.mutate,
    isCheckingAchievements: checkAchievementsMutation.isPending,
    createBadge: createBadgeMutation.mutate,
    isCreatingBadge: createBadgeMutation.isPending,
    getAchievementStats,
    getRecentAchievements,
  };
};