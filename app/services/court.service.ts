import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CourtType = "INDOOR" | "OUTDOOR" | string;
export type SurfaceType = "ACRYLIC" | "WOOD" | "PVC" | "SYNTHETIC_GRASS" | string;
export type CourtStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | string;

export type Court = {
  id: string;
  name: string;
  description: string;
  courtNumber: number;
  courtType: CourtType;
  surfaceType: SurfaceType;
  courtStatus: CourtStatus;
  imageUrl: string;
  location: string;
  maxPlayers: number;
  zoneId: string;
  zoneName?: string;
  branchId?: string;
  pricePerHour?: number;
  openTime?: string;
  closeTime?: string;
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

export type GetAllCourtsFilter = {
  page: number;
  size: number;
  branchId: string;
  zoneId?: string;
  name?: string;
  courtType?: string;
  surfaceType?: string;
  minPrice?: number;
  maxPrice?: number;
  courtStatus?: string;
};

export type CreateCourtPayload = {
  name: string;
  description: string;
  courtNumber: number;
  courtType: CourtType;
  surfaceType: SurfaceType;
  courtStatus: CourtStatus;
  imageUrl: string;
  location: string;
  maxPlayers: number;
  zoneId: string;
};

export type UpdateCourtPayload = CreateCourtPayload & {
  id: string;
};

export type CreateCourtResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export type UpdateCourtResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export type DeleteCourtResponse = {
  code: number;
  message: string;
};

export const CourtService = {
  getAllCourts: async (
    filter: GetAllCourtsFilter,
  ): Promise<PaginatedResponse<Court>> => {
    const res: AxiosResponse<PaginatedResponse<Court>> = await axiosClient.get(
      "/courts/getAll",
      {
        params: {
          page: filter.page,
          size: filter.size,
          branchId: filter.branchId,
          zoneId: cleanString(filter.zoneId),
          name: cleanString(filter.name),
          courtType: cleanString(filter.courtType),
          surfaceType: cleanString(filter.surfaceType),
          minPrice: cleanNumber(filter.minPrice),
          maxPrice: cleanNumber(filter.maxPrice),
          courtStatus: cleanString(filter.courtStatus),
        },
      },
    );

    return res.data;
  },

  createCourt: async (data: CreateCourtPayload): Promise<CreateCourtResponse> => {
    const res: AxiosResponse<CreateCourtResponse> = await axiosClient.post(
      "/courts/create",
      {
        name: data.name,
        description: data.description,
        courtNumber: data.courtNumber,
        courtType: data.courtType,
        surfaceType: data.surfaceType,
        courtStatus: data.courtStatus,
        imageUrl: data.imageUrl,
        location: data.location,
        maxPlayers: data.maxPlayers,
        zoneId: data.zoneId,
      },
    );

    return res.data;
  },

  updateCourt: async (data: UpdateCourtPayload): Promise<UpdateCourtResponse> => {
    const res: AxiosResponse<UpdateCourtResponse> = await axiosClient.put(
      `/courts/${data.id}`,
      {
        name: data.name,
        description: data.description,
        courtNumber: data.courtNumber,
        courtType: data.courtType,
        surfaceType: data.surfaceType,
        courtStatus: data.courtStatus,
        imageUrl: data.imageUrl,
        location: data.location,
        maxPlayers: data.maxPlayers,
        zoneId: data.zoneId,
      },
    );

    return res.data;
  },

  deleteCourt: async (id: string): Promise<DeleteCourtResponse> => {
    const res: AxiosResponse<DeleteCourtResponse> = await axiosClient.delete(
      `/courts/${id}`,
    );
    return res.data;
  },
};

const cleanString = (value?: string) =>
  value && value.trim() !== "" ? value.trim() : undefined;

const cleanNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
