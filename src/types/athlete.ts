
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

export interface GroupStats {
  totalAthletes: number;
  activeAthletes: number;
  moderateAthletes: number;
  inactiveAthletes: number;
  averageWeeklySessions: number;
  beltDistribution: Record<string, number>;
}

export interface ProfileStats {
  totalAthletes: number;
  genderDistribution: { male: number; female: number; unspecified: number };
  clubDistribution: Record<string, number>;
  injuryStats: { withInjuries: number; withoutInjuries: number };
  categoryDistribution: Record<string, number>;
}
