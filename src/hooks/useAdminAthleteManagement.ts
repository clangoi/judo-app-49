
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrainerWithAthletes {
  trainer_id: string;
  trainer_name: string;
  trainer_email: string;
  athletes: AdminAthleteData[];
  totalAthletes: number;
  activeAthletes: number;
  averageWeeklySessions: number;
}

export interface AdminAthleteData {
  id: string;
  full_name: string;
  email: string;
  current_belt: string;
  club_name: string;
  assigned_at: string;
  trainer_name: string;
  trainer_email: string;
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

export const useAdminAthleteManagement = () => {
  const { toast } = useToast();

  // Obtener todos los entrenadores con sus deportistas
  const { data: trainersWithAthletes = [], isLoading } = useQuery({
    queryKey: ['admin-athletes-management'],
    queryFn: async () => {
      // Obtener todas las asignaciones trainer-student
      const { data: assignments, error: assignmentsError } = await supabase
        .from('trainer_assignments')
        .select(`
          trainer_id,
          student_id,
          assigned_at
        `);

      if (assignmentsError) throw assignmentsError;

      // Obtener información de todos los entrenadores
      const trainerIds = [...new Set(assignments?.map(a => a.trainer_id) || [])];
      const { data: trainerProfiles, error: trainersError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', trainerIds);

      if (trainersError) throw trainersError;

      // Obtener información de todos los deportistas
      const studentIds = [...new Set(assignments?.map(a => a.student_id) || [])];
      const { data: studentProfiles, error: studentsError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, current_belt, club_name')
        .in('user_id', studentIds);

      if (studentsError) throw studentsError;

      const trainersData: TrainerWithAthletes[] = [];

      for (const trainer of trainerProfiles || []) {
        const trainerAssignments = assignments?.filter(a => a.trainer_id === trainer.user_id) || [];
        const athletesData: AdminAthleteData[] = [];

        for (const assignment of trainerAssignments) {
          const studentProfile = studentProfiles?.find(s => s.user_id === assignment.student_id);
          if (!studentProfile) continue;

          // Obtener última entrada de peso
          const { data: lastWeight } = await supabase
            .from('weight_entries')
            .select('weight, date')
            .eq('user_id', assignment.student_id)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Obtener última sesión de entrenamiento
          const { data: lastSession } = await supabase
            .from('training_sessions')
            .select('session_type, date')
            .eq('user_id', assignment.student_id)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Contar sesiones de la última semana
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const { count: weeklySessionsCount } = await supabase
            .from('training_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', assignment.student_id)
            .gte('date', oneWeekAgo.toISOString().split('T')[0]);

          // Contar técnicas
          const { count: totalTechniques } = await supabase
            .from('techniques')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', assignment.student_id);

          // Contar notas tácticas
          const { count: totalTacticalNotes } = await supabase
            .from('tactical_notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', assignment.student_id);

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

          athletesData.push({
            id: assignment.student_id,
            full_name: studentProfile.full_name || '',
            email: studentProfile.email || '',
            current_belt: studentProfile.current_belt || 'white',
            club_name: studentProfile.club_name || 'Royal Strength',
            assigned_at: assignment.assigned_at || '',
            trainer_name: trainer.full_name || '',
            trainer_email: trainer.email || '',
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

        const activeAthletes = athletesData.filter(a => a.activityStatus === 'active').length;
        const averageWeeklySessions = athletesData.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / athletesData.length;

        trainersData.push({
          trainer_id: trainer.user_id,
          trainer_name: trainer.full_name || '',
          trainer_email: trainer.email || '',
          athletes: athletesData,
          totalAthletes: athletesData.length,
          activeAthletes,
          averageWeeklySessions: Math.round(averageWeeklySessions * 100) / 100 || 0
        });
      }

      return trainersData;
    },
  });

  // Obtener estadísticas globales
  const getGlobalStats = () => {
    const totalTrainers = trainersWithAthletes.length;
    const totalAthletes = trainersWithAthletes.reduce((sum, t) => sum + t.totalAthletes, 0);
    const totalActiveAthletes = trainersWithAthletes.reduce((sum, t) => sum + t.activeAthletes, 0);
    const globalAverageWeeklySessions = trainersWithAthletes.reduce((sum, t) => sum + t.averageWeeklySessions, 0) / totalTrainers;

    return {
      totalTrainers,
      totalAthletes,
      totalActiveAthletes,
      globalAverageWeeklySessions: Math.round(globalAverageWeeklySessions * 100) / 100 || 0,
      inactiveAthletes: totalAthletes - totalActiveAthletes
    };
  };

  return {
    trainersWithAthletes,
    isLoading,
    getGlobalStats
  };
};
