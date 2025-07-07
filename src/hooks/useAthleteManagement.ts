import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTrainerAssignments } from "./useTrainerAssignments";

export interface AthleteData {
  id: string;
  full_name: string;
  email: string;
  current_belt: string;
  club_name: string;
  assigned_at: string;
  lastWeightEntry?: {
    weight: number;
    date: string;
  };
  lastTrainingSession?: {
    session_type: string;
    date: string;
  };
  activityStatus: 'active' | 'moderate' | 'inactive';
  weeklySessionsCount: number;
  totalTechniques: number;
  totalTacticalNotes: number;
}

export interface ActivityFilter {
  activity: 'all' | 'active' | 'moderate' | 'inactive';
  belt: 'all' | 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black';
  trainingType: 'all' | 'judo' | 'physical' | 'mixed';
  period: 'week' | 'month' | 'quarter';
  search: string;
}

export const useAthleteManagement = (trainerId: string) => {
  const { toast } = useToast();
  const { getTrainerStudents } = useTrainerAssignments();
  const trainerStudentsQuery = getTrainerStudents(trainerId);

  // Obtener datos completos de cada deportista
  const { data: athletesData = [], isLoading } = useQuery({
    queryKey: ['athletes-management', trainerId],
    queryFn: async () => {
      if (!trainerStudentsQuery.data) return [];

      const athletesWithData: AthleteData[] = [];

      for (const student of trainerStudentsQuery.data) {
        // Obtener perfil del deportista
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', student.student_id)
          .single();

        // Obtener última entrada de peso
        const { data: lastWeight } = await supabase
          .from('weight_entries')
          .select('weight, date')
          .eq('user_id', student.student_id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Obtener última sesión de entrenamiento
        const { data: lastSession } = await supabase
          .from('training_sessions')
          .select('session_type, date')
          .eq('user_id', student.student_id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Contar sesiones de la última semana
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count: weeklySessionsCount } = await supabase
          .from('training_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', student.student_id)
          .gte('date', oneWeekAgo.toISOString().split('T')[0]);

        // Contar técnicas
        const { count: totalTechniques } = await supabase
          .from('techniques')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', student.student_id);

        // Contar notas tácticas
        const { count: totalTacticalNotes } = await supabase
          .from('tactical_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', student.student_id);

        // Determinar estado de actividad
        let activityStatus: 'active' | 'moderate' | 'inactive' = 'inactive';
        if (lastSession) {
          const daysSinceLastSession = Math.floor(
            (new Date().getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastSession <= 7) {
            activityStatus = 'active';
          } else if (daysSinceLastSession <= 30) {
            activityStatus = 'moderate';
          }
        }

        athletesWithData.push({
          id: student.student_id,
          full_name: student.full_name,
          email: student.email,
          current_belt: profile?.current_belt || 'white',
          club_name: profile?.club_name || 'Royal Strength',
          assigned_at: student.assigned_at,
          lastWeightEntry: lastWeight ? {
            weight: Number(lastWeight.weight),
            date: lastWeight.date
          } : undefined,
          lastTrainingSession: lastSession ? {
            session_type: lastSession.session_type,
            date: lastSession.date
          } : undefined,
          activityStatus,
          weeklySessionsCount: weeklySessionsCount || 0,
          totalTechniques: totalTechniques || 0,
          totalTacticalNotes: totalTacticalNotes || 0
        });
      }

      return athletesWithData;
    },
    enabled: !!trainerStudentsQuery.data && trainerStudentsQuery.data.length > 0,
  });

  // Obtener datos de un deportista específico
  const getAthleteDetails = (athleteId: string) => {
    return useQuery({
      queryKey: ['athlete-details', athleteId],
      queryFn: async () => {
        // Obtener todas las entradas de peso
        const { data: weightEntries } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', athleteId)
          .order('date', { ascending: true });

        // Obtener todas las sesiones de entrenamiento
        const { data: trainingSessions } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('user_id', athleteId)
          .order('date', { ascending: false });

        // Obtener técnicas
        const { data: techniques } = await supabase
          .from('techniques')
          .select('*')
          .eq('user_id', athleteId)
          .order('created_at', { ascending: false });

        // Obtener notas tácticas
        const { data: tacticalNotes } = await supabase
          .from('tactical_notes')
          .select('*')
          .eq('user_id', athleteId)
          .order('created_at', { ascending: false });

        // Obtener sesiones de randori
        const { data: randoriSessions } = await supabase
          .from('randori_sessions')
          .select('*')
          .eq('user_id', athleteId)
          .order('created_at', { ascending: false });

        return {
          weightEntries: weightEntries || [],
          trainingSessions: trainingSessions || [],
          techniques: techniques || [],
          tacticalNotes: tacticalNotes || [],
          randoriSessions: randoriSessions || []
        };
      },
      enabled: !!athleteId,
    });
  };

  // Filtrar deportistas (sin filtro de progreso de peso)
  const filterAthletes = (athletes: AthleteData[], filters: ActivityFilter) => {
    return athletes.filter(athlete => {
      // Filtro por actividad
      if (filters.activity !== 'all' && athlete.activityStatus !== filters.activity) {
        return false;
      }

      // Filtro por cinturón
      if (filters.belt !== 'all' && athlete.current_belt !== filters.belt) {
        return false;
      }

      // Filtro por búsqueda
      if (filters.search && !athlete.full_name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  // Estadísticas del grupo
  const getGroupStats = (athletes: AthleteData[]) => {
    const totalAthletes = athletes.length;
    const activeAthletes = athletes.filter(a => a.activityStatus === 'active').length;
    const averageWeeklySessions = athletes.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / totalAthletes;
    
    const beltDistribution = athletes.reduce((acc, athlete) => {
      acc[athlete.current_belt] = (acc[athlete.current_belt] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAthletes,
      activeAthletes,
      averageWeeklySessions: Math.round(averageWeeklySessions * 100) / 100,
      beltDistribution,
      inactiveAthletes: athletes.filter(a => a.activityStatus === 'inactive').length,
      moderateAthletes: athletes.filter(a => a.activityStatus === 'moderate').length
    };
  };

  return {
    athletesData,
    isLoading: isLoading || trainerStudentsQuery.isLoading,
    getAthleteDetails,
    filterAthletes,
    getGroupStats
  };
};
