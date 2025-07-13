
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AthleteData } from "@/types/athlete";

export const useAthleteData = (trainerId: string) => {
  return useQuery({
    queryKey: ['athlete-management', trainerId],
    queryFn: async () => {
      console.log('Fetching athletes for trainer:', trainerId);
      
      if (!trainerId) {
        console.log('No trainer ID provided');
        return [];
      }

      // Primero verificar si el usuario es admin
      const { data: userRole } = await supabase
        .rpc('get_user_role', { _user_id: trainerId });

      console.log('User role:', userRole);

      let trainerStudents;
      
      if (userRole === 'admin') {
        // Si es admin, obtener todos los usuarios con rol de practicante
        const { data: allStudents, error: studentsError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'practicante');

        if (studentsError) {
          console.error('Error fetching all students:', studentsError);
          throw studentsError;
        }

        if (!allStudents || allStudents.length === 0) {
          console.log('No students found');
          return [];
        }

        // Obtener los perfiles de estos estudiantes
        const studentIds = allStudents.map(student => student.user_id);
        const { data: studentsProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', studentIds);

        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
          throw profilesError;
        }

        // Transformar los datos para que coincidan con el formato esperado
        trainerStudents = studentsProfiles?.map(profile => ({
          student_id: profile.user_id,
          full_name: profile.full_name || 'Sin nombre',
          email: profile.email || '',
          assigned_at: new Date().toISOString()
        })) || [];
      } else {
        // Si es entrenador, usar la función existente que solo devuelve sus estudiantes asignados
        const { data: assignedStudents, error: studentsError } = await supabase
          .rpc('get_trainer_students', { _trainer_id: trainerId });

        if (studentsError) {
          console.error('Error fetching trainer students:', studentsError);
          throw studentsError;
        }

        trainerStudents = assignedStudents || [];
      }

      if (!trainerStudents || trainerStudents.length === 0) {
        console.log('No students found for trainer/admin:', trainerId);
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
};
