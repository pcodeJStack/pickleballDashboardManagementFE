import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type CreateCourtPricingPayload = {
  courtId: string;
  timeSlotId: string;
  dayOfWeek: DayOfWeek;
  price: number;
};

export type CourtPricingItem = {
  id: string;
  courtName: string;
  courtId: string;
  zoneName: string;
  zoneId: string;
  branchName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  price: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type GetAllCourtPricingsFilter = {
  page: number;
  size: number;
  branchId?: string;
  zoneId?: string;
  courtId?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
};

export type CourtPricingMutationResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export const CourtPricingService = {
  getAllCourtPricings: async (
    filter: GetAllCourtPricingsFilter,
  ): Promise<PaginatedResponse<CourtPricingItem>> => {
    const res: AxiosResponse<PaginatedResponse<CourtPricingItem>> =
      await axiosClient.get("/court-pricing/getAll", {
        params: {
          page: filter.page,
          size: filter.size,
          branchId: cleanString(filter.branchId),
          zoneId: cleanString(filter.zoneId),
          courtId: cleanString(filter.courtId),
          dayOfWeek: cleanString(filter.dayOfWeek),
          startTime: cleanString(filter.startTime),
          endTime: cleanString(filter.endTime),
        },
      });

    return res.data;
  },

  createCourtPricing: async (
    data: CreateCourtPricingPayload,
  ): Promise<CourtPricingMutationResponse> => {
    const res: AxiosResponse<CourtPricingMutationResponse> = await axiosClient.post(
      "/court-pricing/create",
      {
        courtId: data.courtId,
        timeSlotId: data.timeSlotId,
        dayOfWeek: data.dayOfWeek,
        price: data.price,
      },
    );

    return res.data;
  },
};

const cleanString = (value?: string) =>
  value && value.trim() !== "" ? value.trim() : undefined;