import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type AvailableSlot = {
  id?: string;
  timeSlotId?: string;
  slotId?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  [key: string]: unknown;
};

export type PaginatedResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
};

export type AvailableSlotsFilter = {
  courtId: string;
  date: string;
  page?: number;
  size?: number;
};

export type CreateBookingPayload = {
  courtId: string;
  timeSlotId: string;
  bookingDate: string;
};

export type BookingResponse = {
  bookingId: string;
  paymentUrl: string;
  qrCode: string;
  orderCode: number;
};

export const BookingService = {
  getAvailableSlots: async (
    filter: AvailableSlotsFilter,
  ): Promise<PaginatedResponse<AvailableSlot>> => {
    const res: AxiosResponse<PaginatedResponse<AvailableSlot>> =
      await axiosClient.get("/available-slots", {
        params: {
          courtId: filter.courtId,
          date: filter.date,
          page: filter.page ?? 0,
          size: filter.size ?? 20,
        },
      });

    return res.data;
  },

  createBooking: async (payload: CreateBookingPayload): Promise<BookingResponse> => {
    const res: AxiosResponse<BookingResponse> = await axiosClient.post(
      "/booking",
      payload,
    );

    return res.data;
  },
};
