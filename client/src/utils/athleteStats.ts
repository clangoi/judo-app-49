import { AthleteData } from "@/types/athlete";

export interface GroupStats {
  total: number;
  active: number;
  moderate: number;
  inactive: number;
  averageWeeklySessions: number;
  totalTechniques: number;
  totalTacticalNotes: number;
}

export interface ProfileStats {
  weeklySessionsCount: number;
  totalTechniques: number;
  totalTacticalNotes: number;
  activityStatus: 'active' | 'moderate' | 'inactive';
  lastWeightEntry?: {
    weight: number;
    date: string;
  };
  lastTrainingSession?: {
    session_type: string;
    date: string;
  };
}

export const getGroupStats = (athletes: AthleteData[]): GroupStats => {
  const total = athletes.length;
  const active = athletes.filter(a => a.activityStatus === 'active').length;
  const moderate = athletes.filter(a => a.activityStatus === 'moderate').length;
  const inactive = athletes.filter(a => a.activityStatus === 'inactive').length;
  
  const averageWeeklySessions = total > 0 
    ? athletes.reduce((sum, a) => sum + a.weeklySessionsCount, 0) / total 
    : 0;
  
  const totalTechniques = athletes.reduce((sum, a) => sum + a.totalTechniques, 0);
  const totalTacticalNotes = athletes.reduce((sum, a) => sum + a.totalTacticalNotes, 0);

  return {
    total,
    active,
    moderate,
    inactive,
    averageWeeklySessions,
    totalTechniques,
    totalTacticalNotes,
  };
};

export const getProfileStats = (athlete: AthleteData): ProfileStats => {
  return {
    weeklySessionsCount: athlete.weeklySessionsCount,
    totalTechniques: athlete.totalTechniques,
    totalTacticalNotes: athlete.totalTacticalNotes,
    activityStatus: athlete.activityStatus,
    lastWeightEntry: athlete.lastWeightEntry,
    lastTrainingSession: athlete.lastTrainingSession,
  };
};