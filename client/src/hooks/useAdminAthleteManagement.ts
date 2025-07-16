import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  const { data: athletesData = [], isLoading, error } = useQuery({
    queryKey: ['admin-athlete-management'],
    queryFn: async () => {
      const response = await api.get('/api/admin/athletes');
      return response.data;
    },
  });

  const getProfileStats = (athletes: AdminAthleteData[]) => {
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