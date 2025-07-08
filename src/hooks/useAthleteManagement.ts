import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AthleteData {
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
  lastWeightEntry?: {
    weight: number;
    date: string;
  };
  lastTrainingSession?: {
    session_type: string;
    date: string;
  };
}

export interface ActivityFilter {
  activity: 'all' | 'active' | 'moderate' | 'inactive';
  belt: 'all' | 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black';
  trainingType: 'all' | 'judo' | 'physical_preparation';
  period: 'week' | 'month' | 'quarter' | 'year';
  search: string;
}

export const useAthleteManagement = (trainerId: string) => {
  const { data: athletesData = [], isLoading, error } = useQuery({
    queryKey: ['athlete-management', trainerId],
    queryFn: async (): Promise<AthleteData[]> => {
      if (!trainerId) {
        return [];
      }

      // 1) Traigo asignaciones con perfil embebido
      const { data: assignments, error: assignError } = await supabase
        .from('trainer_assignments')
        .select(`
          student_id,
          assigned_at,
          profiles:user_id (
            full_name,
            email,
            club_name,
            current_belt,
            gender,
            competition_category,
            injuries,
            injury_description,
            profile_image_url
          )
        `)
        .eq('coach_id', trainerId);

      if (assignError) {
        console.error('Error fetching assignments with profiles:', assignError);
        throw assignError;
      }
      if (!assignments || assignments.length === 0) {
        return [];
      }

      // 2) Para cada asignación, obtengo sesiones, técnicas, notas y peso
      const athletesWithData = await Promise.all(
        assignments.map(async (assignment) => {
          const userId = assignment.student_id;
          const profile = assignment.profiles!;

          // Fecha hace 30 días
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const since = thirtyDaysAgo.toISOString().split('T')[0];

          // a) Sesiones de entrenamiento últimos 30 días
          const { data: sessions = [] } = await supabase
            .from('training_sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('date', since)
            .order('date', { ascending: false });

          // b) Técnicas
          const { data: techniques = [] } = await supabase
            .from('techniques')
            .select('id')
            .eq('user_id', userId);

          // c) Notas tácticas
          const { data: tacticalNotes = [] } = await supabase
            .from('tactical_notes')
            .select('id')
            .eq('user_id', userId);

          // d) Última entrada de peso
          const { data: weightEntries = [] } = await supabase
            .from('weight_entries')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(1);

          // Cálculo de estado de actividad
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weeklySessionsCount = sessions.filter(s => new Date(s.date) >= weekAgo).length;

          let activityStatus: 'active' | 'moderate' | 'inactive' = 'inactive';
          if (weeklySessionsCount >= 3) activityStatus = 'active';
          else if (weeklySessionsCount >= 1) activityStatus = 'moderate';

          return {
            id: userId,
            full_name: profile.full_name || profile.email || 'Sin nombre',
            email: profile.email || '',
            club_name: profile.club_name || 'Sin club',
            current_belt: profile.current_belt || 'white',
            gender: profile.gender as 'male' | 'female' | undefined,
            competition_category: profile.competition_category,
            injuries: profile.injuries,
            injury_description: profile.injury_description,
            profile_image_url: profile.profile_image_url,
            activityStatus,
            weeklySessionsCount,
            totalTechniques: techniques.length,
            totalTacticalNotes: tacticalNotes.length,
            lastWeightEntry: weightEntries[0]
              ? { weight: Number(weightEntries[0].weight), date: weightEntries[0].date }
              : undefined,
            lastTrainingSession: sessions[0]
              ? { session_type: sessions[0].session_type, date: sessions[0].date }
              : undefined,
          } as AthleteData;
        })
      );

      return athletesWithData;
    },
    enabled: !!trainerId,
  });

  const filterAthletes = (athletes: AthleteData[], filters: ActivityFilter): AthleteData[] => {
    return athletes.filter(athlete => {
      if (filters.activity !== 'all' && athlete.activityStatus !== filters.activity) return false;
      if (filters.belt !== 'all' && athlete.current_belt !== filters.belt) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !athlete.full_name.toLowerCase().includes(q) &&
          !athlete.email.toLowerCase().includes(q) &&
          !athlete.club_name.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  };

  const getGroupStats = (athletes: AthleteData[]) => {
    const totalAthletes = athletes.length;
    const activeAthletes = athletes.filter(a => a.activityStatus === 'active').length;
    const moderateAthletes = athletes.filter(a => a.activityStatus === 'moderate').length;
    const inactiveAthletes = athletes.filter(a => a.activityStatus === 'inactive').length;
    const averageWeeklySessions =
      Math.round(athletes.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / (totalAthletes || 1));

    const beltDistribution = athletes.reduce((acc, a) => {
      acc[a.current_belt] = (acc[a.current_belt] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalAthletes, activeAthletes, moderateAthletes, inactiveAthletes, averageWeeklySessions, beltDistribution };
  };

  const getProfileStats = (athletes: AthleteData[]) => {
    const totalAthletes = athletes.length;
    const genderDistribution = athletes.reduce((acc, a) => {
      if (a.gender === 'male') acc.male++;
      else if (a.gender === 'female') acc.female++;
      else acc.unspecified++;
      return acc;
    }, { male: 0, female: 0, unspecified: 0 });

    const clubDistribution = athletes.reduce((acc, a) => {
      const club = a.club_name || 'Sin club';
      acc[club] = (acc[club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const injuryStats = athletes.reduce((acc, a) => {
      if (a.injuries && a.injuries.length) acc.withInjuries++;
      else acc.withoutInjuries++;
      return acc;
    }, { withInjuries: 0, withoutInjuries: 0 });

    const categoryDistribution = athletes.reduce((acc, a) => {
      const cat = a.competition_category || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalAthletes, genderDistribution, clubDistribution, injuryStats, categoryDistribution };
  };

  return {
    athletesData,
    isLoading,
    error,
    filterAthletes,
    getGroupStats,
    getProfileStats,
  };
};
