import {
  GetAllTimeSlotsFilter,
  TimeSlotService,
} from "@/app/services/timeslot.service";
import { useQuery } from "@tanstack/react-query";

export const useGetAllTimeSlotsQuery = (filter: GetAllTimeSlotsFilter) => {
  return useQuery({
    queryKey: ["getAllTimeSlots", filter],
    queryFn: () => TimeSlotService.getAllTimeSlots(filter),
  });
};
