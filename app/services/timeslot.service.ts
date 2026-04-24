import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type GetAllTimeSlotsFilter = {
  page: number;
  size: number;
};

export type CreateTimeSlotPayload = {
  startTime: string;
  endTime: string;
};

export type TimeSlotMutationResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export const TimeSlotService = {
  getAllTimeSlots: async (
    filter: GetAllTimeSlotsFilter,
  ): Promise<PaginatedResponse<TimeSlot>> => {
    const res: AxiosResponse<PaginatedResponse<TimeSlot>> = await axiosClient.get(
      "/timeslot/getAll",
      {
        params: {
          page: filter.page,
          size: filter.size,
        },
      },
    );

    return res.data;
  },

  createTimeSlot: async (
    data: CreateTimeSlotPayload,
  ): Promise<TimeSlotMutationResponse> => {
    const res: AxiosResponse<TimeSlotMutationResponse> = await axiosClient.post(
      "/timeslot/create",
      {
        startTime: data.startTime,
        endTime: data.endTime,
      },
    );

    return res.data;
  },
};
