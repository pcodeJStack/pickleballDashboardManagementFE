import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type Zone = {
  id: string;
  name: string;
  branchId: string;
  description?: string;
  maxCourts: number;
  currentCourts: number;
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

export type GetAllZonesFilter = {
  page: number;
  size: number;
  name?: string;
  branchId?: string;
};

export type CreateZonePayload = {
  name: string;
  branchId: string;
  description?: string;
  maxCourts: number;
};

export type UpdateZonePayload = {
  id: string;
  name: string;
  description?: string;
  maxCourts: number;
};

export type ZoneMutationResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export type DeleteZoneResponse = {
  code: number;
  message: string;
};

export const ZoneService = {
  getAllZones: async (
    filter: GetAllZonesFilter,
  ): Promise<PaginatedResponse<Zone>> => {
    const res: AxiosResponse<PaginatedResponse<Zone>> = await axiosClient.get(
      "/zone/getAll",
      {
        params: {
          page: filter.page,
          size: filter.size,
          name: cleanString(filter.name),
          branchId: cleanString(filter.branchId),
        },
      },
    );

    return res.data;
  },

  getZoneById: async (id: string): Promise<Zone> => {
    const res: AxiosResponse<Zone> = await axiosClient.get(`/zone/${id}`);
    return res.data;
  },

  createZone: async (data: CreateZonePayload): Promise<ZoneMutationResponse> => {
    const res: AxiosResponse<ZoneMutationResponse> = await axiosClient.post(
      "/zone/create",
      data,
    );
    return res.data;
  },

  updateZone: async (data: UpdateZonePayload): Promise<ZoneMutationResponse> => {
    const { id, ...payload } = data;
    const res: AxiosResponse<ZoneMutationResponse> = await axiosClient.put(
      `/zone/${id}`,
      payload,
    );
    return res.data;
  },

  deleteZone: async (id: string): Promise<DeleteZoneResponse> => {
    const res: AxiosResponse<DeleteZoneResponse> = await axiosClient.delete(
      `/zone/${id}`,
    );
    return res.data;
  },
};

const cleanString = (value?: string) =>
  value && value.trim() !== "" ? value.trim() : undefined;