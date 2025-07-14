
import { AthleteData, GroupStats, ProfileStats } from "@/types/athlete";

export const getGroupStats = (athletes: AthleteData[]): GroupStats => {
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

export const getProfileStats = (athletes: AthleteData[]): ProfileStats => {
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
