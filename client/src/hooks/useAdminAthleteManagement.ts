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
      // Return empty array for now - placeholder
      return [];
    },
  });

  return {
    athletesData,
    isLoading,
    error,
  };
};