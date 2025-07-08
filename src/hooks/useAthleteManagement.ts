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

// 1) Recupera asignaciones junto con el perfil del alumno en un solo paso
const { data: assignmentsWithProfiles, error: assignError } = await supabase
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
  .eq('coach_id', trainerId); // <-- asegúrate de usar el nombre real de la columna

if (assignError) {
  console.error('Error fetching assignments:', assignError);
  throw assignError;
}

if (!assignmentsWithProfiles || assignmentsWithProfiles.length === 0) {
  console.log('No student assignments found for trainer:', trainerId);
  return [];
}

console.log('Assignments found:', assignmentsWithProfiles.length);

// 2) A partir de aquí, mapea cada asignación para construir tu AthleteData
const athletesWithData = await Promise.all(
  assignmentsWithProfiles.map(async ({ student_id, profiles }) => {
    // profiles ya contiene full_name, email, club_name, current_belt, etc.
    const profile = profiles;

    // Ahora recupera sesiones, técnicas, notas y peso como hacías antes,
    // solo que usando student_id en lugar de profile.user_id:
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', student_id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: techniques } = await supabase
      .from('techniques')
      .select('id')
      .eq('user_id', student_id);

    const { data: tacticalNotes } = await supabase
      .from('tactical_notes')
      .select('id')
      .eq('user_id', student_id);

    const { data: weightEntries } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', student_id)
      .order('date', { ascending: false })
      .limit(1);

    // Calcula el estado de actividad, total de técnicas, notas, etc.
    const weeklySessionsCount = sessions?.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length || 0;

    let activityStatus: 'active' | 'moderate' | 'inactive' = 'inactive';
    if (weeklySessionsCount >= 3) activityStatus = 'active';
    else if (weeklySessionsCount >= 1) activityStatus = 'moderate';

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


      