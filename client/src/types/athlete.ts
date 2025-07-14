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

export type ActivityFilter = 'all' | 'active' | 'moderate' | 'inactive';