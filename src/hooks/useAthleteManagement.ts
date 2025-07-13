
import { useAthleteData } from "./useAthleteData";
import { filterAthletes } from "@/utils/athleteFilters";
import { getGroupStats, getProfileStats } from "@/utils/athleteStats";

export type { AthleteData, ActivityFilter } from "@/types/athlete";

export const useAthleteManagement = (trainerId: string) => {
  const { data: athletesData = [], isLoading, error } = useAthleteData(trainerId);

  return {
    athletesData,
    isLoading,
    error,
    filterAthletes,
    getGroupStats,
    getProfileStats,
  };
};
