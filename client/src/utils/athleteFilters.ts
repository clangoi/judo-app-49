import { AthleteData, ActivityFilter } from "@/types/athlete";

export const filterAthletes = (
  athletes: AthleteData[],
  filter: ActivityFilter,
  searchQuery: string = ''
): AthleteData[] => {
  let filtered = athletes;

  // Apply activity filter
  if (filter !== 'all') {
    filtered = filtered.filter(athlete => athlete.activityStatus === filter);
  }

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(athlete => 
      athlete.full_name.toLowerCase().includes(query) ||
      athlete.email.toLowerCase().includes(query) ||
      athlete.club_name.toLowerCase().includes(query)
    );
  }

  return filtered;
};