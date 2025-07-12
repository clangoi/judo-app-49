
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
    queryFn: async () => {
      console.log('Fetching athletes for trainer:', trainerId);
      
      if (!trainerId) {
        console.log('No trainer ID provided');
        return [];
      }

      // Usar la función de base de datos que ya funciona correctamente
      const { data: trainerStudents, error: studentsError } = await supabase
        .rpc('get_trainer_students', { _trainer_id: trainerId });

      if (studentsError) {
        console.error('Error fetching trainer students:', studentsError);
        throw studentsError;
      }

      if (!trainerStudents || trainerStudents.length === 0) {
        console.log('No students found for trainer:', trainerId);
        return [];
      }

      console.log('Students found:', trainerStudents.length);

      // Para cada estudiante, obtener sus datos de actividad
      const athletesWithData = await Promise.all(
        trainerStudents.map(async (student) => {
          // Obtener sesiones de entrenamiento recientes (últimos 30 días)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: sessions } = await supabase
            .from('training_sessions')
            .select('*')
            .eq('user_id', student.student_id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false });

          // Obtener conteo de técnicas
          const { data: techniques } = await supabase
            .from('techniques')
            .select('id')
            .eq('user_id', student.student_id);

          // Obtener conteo de notas tácticas
          const { data: tacticalNotes } = await supabase
            .from('tactical_notes')
            .select('id')
            .eq('user_id', student.student_id);

          // Obtener última entrada de peso
          const { data: weightEntries } = await supabase
            .from('weight_entries')
            .select('*')
            .eq('user_id', student.student_id)
            .order('date', { ascending: false })
            .limit(1);

          // Calcular estado de actividad
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

          // Obtener el perfil completo del estudiante
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', student.student_id)
            .single();

          // Try to get club name if club_id exists
          let clubName = profile?.club_name || 'Sin club';
          if ((profile as any)?.club_id) {
            try {
              const { data: clubData } = await (supabase as any)
                .from('clubs')
                .select('name')
                .eq('id', (profile as any).club_id)
                .single();
              
              if (clubData?.name) {
                clubName = clubData.name;
              }
            } catch (error) {
              console.log('Could not fetch club name, using fallback');
            }
          }

          return {
            id: student.student_id,
            full_name: student.full_name || profile?.full_name || 'Sin nombre',
            email: student.email || profile?.email || '',
            club_name: clubName,
            current_belt: profile?.current_belt || 'white',
            gender: profile?.gender,
            competition_category: profile?.competition_category,
            injuries: profile?.injuries,
            injury_description: profile?.injury_description,
            profile_image_url: profile?.profile_image_url,
            activityStatus,
            weeklySessionsCount,
            totalTechniques: techniques?.length || 0,
            totalTacticalNotes: tacticalNotes?.length || 0,
            lastWeightEntry: weightEntries?.[0] ? {
              weight: Number(weightEntries[0].weight),
              date: weightEntries[0].date
            } : undefined,
            lastTrainingSession: sessions?.[0] ? {
              session_type: sessions[0].session_type,
              date: sessions[0].date
            } : undefined,
          } as AthleteData;
        })
      );

      console.log('Athletes with data:', athletesWithData.length);
      return athletesWithData;
    },
    enabled: !!trainerId,
  });

  const filterAthletes = (athletes: AthleteData[], filters: ActivityFilter): AthleteData[] => {
    return athletes.filter(athlete => {
      // Activity filter
      if (filters.activity !== 'all' && athlete.activityStatus !== filters.activity) {
        return false;
      }

      // Belt filter
      if (filters.belt !== 'all' && athlete.current_belt !== filters.belt) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!athlete.full_name.toLowerCase().includes(searchLower) &&
            !athlete.email.toLowerCase().includes(searchLower) &&
            !athlete.club_name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  };

  const getGroupStats = (athletes: AthleteData[]) => {
    const totalAthletes = athletes.length;
    const activeAthletes = athletes.filter(a => a.activityStatus === 'active').length;
    const moderateAthletes = athletes.filter(a => a.activityStatus === 'moderate').length;
    const inactiveAthletes = athletes.filter(a => a.activityStatus === 'inactive').length;
    
    const averageWeeklySessions = Math.round(
      athletes.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / totalAthletes || 0
    );

    const beltDistribution = athletes.reduce((acc, athlete) => {
      acc[athlete.current_belt] = (acc[athlete.current_belt] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAthletes,
      activeAthletes,
      moderateAthletes,
      inactiveAthletes,
      averageWeeklySessions,
      beltDistribution,
    };
  };

  const getProfileStats = (athletes: AthleteData[]) => {
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

  return {
    athletesData,
    isLoading,
    error,
    filterAthletes,
    getGroupStats,
    getProfileStats,
  };
};
