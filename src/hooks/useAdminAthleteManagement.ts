import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      console.log('Fetching all athletes for admin view');
      
      // Get all profiles with their trainer assignments
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          trainer_assignments!trainer_assignments_student_id_fkey(
            trainer_id,
            assigned_at,
            trainer:profiles!trainer_assignments_trainer_id_fkey(
              full_name,
              email
            )
          )
        `);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      console.log('All profiles found:', profiles?.length || 0);

      // For each profile, get their activity data
      const athletesWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Extract trainer assignment info
          const trainerAssignment = Array.isArray(profile.trainer_assignments) 
            ? profile.trainer_assignments[0] 
            : profile.trainer_assignments;

          // Get recent training sessions (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: sessions } = await supabase
            .from('training_sessions')
            .select('*')
            .eq('user_id', profile.user_id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false });

          // Get techniques count
          const { data: techniques } = await supabase
            .from('techniques')
            .select('id')
            .eq('user_id', profile.user_id);

          // Get tactical notes count
          const { data: tacticalNotes } = await supabase
            .from('tactical_notes')
            .select('id')
            .eq('user_id', profile.user_id);

          // Get last weight entry
          const { data: weightEntries } = await supabase
            .from('weight_entries')
            .select('*')
            .eq('user_id', profile.user_id)
            .order('date', { ascending: false })
            .limit(1);

          // Calculate activity status
          const weeklySessionsCount = sessions?.filter(s => {
            const sessionDate = new Date(s.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
          }).length || 0;

          let activityStatus: 'active' | 'moderate' | 'inactive' = 'inactive';
          if (weeklySessionsCount >= 3) {
            activityStatus = 'active';
          } else if (weeklySessionsCount >= 1) {
            activityStatus = 'moderate';
          }

          return {
            id: profile.user_id,
            full_name: profile.full_name || profile.email || 'Sin nombre',
            email: profile.email || '',
            club_name: profile.club_name || 'Sin club',
            current_belt: profile.current_belt || 'white',
            gender: profile.gender,
            competition_category: profile.competition_category,
            injuries: profile.injuries,
            injury_description: profile.injury_description,
            profile_image_url: profile.profile_image_url,
            activityStatus,
            weeklySessionsCount,
            totalTechniques: techniques?.length || 0,
            totalTacticalNotes: tacticalNotes?.length || 0,
            trainer: trainerAssignment ? {
              id: trainerAssignment.trainer_id,
              full_name: (trainerAssignment.trainer as any)?.full_name || 'Sin nombre',
              email: (trainerAssignment.trainer as any)?.email || '',
              assigned_at: trainerAssignment.assigned_at
            } : undefined,
            trainer_name: trainerAssignment ? (trainerAssignment.trainer as any)?.full_name || 'Sin entrenador' : 'Sin entrenador',
            trainer_email: trainerAssignment ? (trainerAssignment.trainer as any)?.email || '' : '',
            assigned_at: trainerAssignment?.assigned_at,
            lastWeightEntry: weightEntries?.[0] ? {
              weight: Number(weightEntries[0].weight),
              date: weightEntries[0].date
            } : undefined,
            lastTrainingSession: sessions?.[0] ? {
              session_type: sessions[0].session_type,
              date: sessions[0].date
            } : undefined,
          } as AdminAthleteData;
        })
      );

      console.log('Admin athletes with data:', athletesWithData.length);
      return athletesWithData;
    },
  });

  const getProfileStats = (athletes: AdminAthleteData[]) => {
    const totalAthletes = athletes.length;
    
    const genderDistribution = athletes.reduce((acc, athlete) => {
      if (athlete.gender === 'male') acc.male++;
      else if (athlete.gender === 'female') acc.female++;
      else acc.unspecified++;
      return acc;
    }, { male: 0, female: 0, unspecified: 0 });

    const clubDistribution = athletes.reduce((acc, athlete) => {
      const club = athlete.club_name || 'Sin club';
      acc[club] = (acc[club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const injuryStats = athletes.reduce((acc, athlete) => {
      if (athlete.injuries && athlete.injuries.length > 0) {
        acc.withInjuries++;
      } else {
        acc.withoutInjuries++;
      }
      return acc;
    }, { withInjuries: 0, withoutInjuries: 0 });

    const categoryDistribution = athletes.reduce((acc, athlete) => {
      const category = athlete.competition_category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAthletes,
      genderDistribution,
      clubDistribution,
      injuryStats,
      categoryDistribution,
    };
  };

  const getTrainerStats = (athletes: AdminAthleteData[]) => {
    const trainerDistribution = athletes.reduce((acc, athlete) => {
      const trainerName = athlete.trainer?.full_name || 'Sin entrenador';
      acc[trainerName] = (acc[trainerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { trainerDistribution };
  };

  return {
    athletesData,
    isLoading,
    error,
    getProfileStats,
    getTrainerStats,
  };
};
