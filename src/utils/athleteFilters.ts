
import { AthleteData, ActivityFilter } from "@/types/athlete";

export const filterAthletes = (athletes: AthleteData[], filters: ActivityFilter): AthleteData[] => {
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
