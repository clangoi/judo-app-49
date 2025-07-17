import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export interface AdminAthleteData {
  id: string;
  full_name: string;
  email: string;
  club_name: string;
  current_belt: string;
  gender?: 'male' | 'female';
  competition_category?: string;
  injuries?: string[];
  injury_description?: string;
  profile_image_url?: string;
  activityStatus: 'active' | 'moderate' | 'inactive';
  weeklySessionsCount: number;
  totalTechniques: number;
  totalTacticalNotes: number;
  trainer?: {
    id: string;
    full_name: string;
    email: string;
    assigned_at: string;
  };
  trainer_name?: string;
  trainer_email?: string;
  assigned_at?: string;
  lastWeightEntry?: {
    weight: number;
    date: string;
  };
  lastTrainingSession?: {
    session_type: string;
    date: string;
  };
}

export const useAdminAthleteManagement = () => {
  const { user } = useAuth();
  
  const { data: athletesData = [], isLoading, error } = useQuery({
    queryKey: ['admin-athlete-management'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/admin/athletes', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch athletes data');
      }
      
      return response.json();
    },
    enabled: !!user?.id,
  });

  const getProfileStats = (athletes: AdminAthleteData[]) => {
    const maleCount = athletes.filter(a => a.gender === 'male').length;
    const femaleCount = athletes.filter(a => a.gender === 'female').length;
    const unspecifiedCount = athletes.length - maleCount - femaleCount;
    
    const withInjuries = athletes.filter(a => a.injuries && a.injuries.length > 0).length;
    const withoutInjuries = athletes.length - withInjuries;
    
    const clubDistribution = athletes.reduce((acc, athlete) => {
      const club = athlete.club_name || 'Sin club';
      acc[club] = (acc[club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryDistribution = athletes.reduce((acc, athlete) => {
      const category = athlete.competition_category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAthletes: athletes.length,
      activeAthletes: athletes.filter(a => a.activityStatus === 'active').length,
      moderateAthletes: athletes.filter(a => a.activityStatus === 'moderate').length,
      inactiveAthletes: athletes.filter(a => a.activityStatus === 'inactive').length,
      averageWeeklySessions: athletes.length > 0 
        ? Math.round(athletes.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / athletes.length * 10) / 10 
        : 0,
      totalTechniques: athletes.reduce((sum, a) => sum + a.totalTechniques, 0),
      totalTacticalNotes: athletes.reduce((sum, a) => sum + a.totalTacticalNotes, 0),
      genderDistribution: { male: maleCount, female: femaleCount, unspecified: unspecifiedCount },
      injuryStats: { withInjuries, withoutInjuries },
      clubDistribution,
      categoryDistribution,
    };
  };

  const getTrainerStats = (athletes: AdminAthleteData[]) => {
    const trainers = new Set(athletes.map(a => a.trainer?.id).filter(Boolean));
    const athletesWithTrainer = athletes.filter(a => a.trainer);
    const athletesWithoutTrainer = athletes.filter(a => !a.trainer);
    
    return {
      totalTrainers: trainers.size,
      athletesWithTrainer: athletesWithTrainer.length,
      athletesWithoutTrainer: athletesWithoutTrainer.length,
      averageAthletesPerTrainer: trainers.size > 0 
        ? Math.round(athletesWithTrainer.length / trainers.size * 10) / 10 
        : 0,
    };
  };

  return {
    athletesData,
    isLoading,
    error,
    getProfileStats,
    getTrainerStats,
  };
};