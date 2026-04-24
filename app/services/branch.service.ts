import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";
export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  description: string;
  openTime: string;
  closeTime: string;
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
export type CreateBranchPayload = {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  description: string;
  openTime: string;
  closeTime: string;
};

export type UpdateBranchPayload = CreateBranchPayload & {
  id: string;
};

export type CreateBranchResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export type UpdateBranchResponse = {
  code: number;
  message: string;
  data?: Record<string, string>;
};

export type DeleteBranchResponse = {
  code: number;
  message: string;
};

export const BranchService = {
  getAllBranches: async (
    page: number,
    size: number,
    name?: string,
    address?: string,
    phone?: string,
  ): Promise<PaginatedResponse<Branch>> => {
    const res: AxiosResponse<PaginatedResponse<Branch>> = await axiosClient.get(
      "/branch/getAll",
      {
        params: {
          page,
          size,
          name: clean(name),
          address: clean(address),
          phone: clean(phone),
        },
      },
    );
    return res.data;
  },
    createBranch: async (data: CreateBranchPayload): Promise<CreateBranchResponse> => {
    const res: AxiosResponse<CreateBranchResponse> = await axiosClient.post("/branch/create", {
      name: data.name,
      address: data.address,
      phone: data.phone,
      imageUrl: data.imageUrl,
      description: data.description,
      openTime: data.openTime,
      closeTime: data.closeTime,
    });

    return res.data;
  },
  updateBranch: async (data: UpdateBranchPayload): Promise<UpdateBranchResponse> => {
    const res: AxiosResponse<UpdateBranchResponse> = await axiosClient.put(
      `/branch/${data.id}`,
      {
        name: data.name,
        address: data.address,
        phone: data.phone,
        imageUrl: data.imageUrl,
        description: data.description,
        openTime: data.openTime,
        closeTime: data.closeTime,
      },
    );

    return res.data;
  },
  deleteBranch: async (id: string): Promise<DeleteBranchResponse> => {
    const res: AxiosResponse<DeleteBranchResponse> = await axiosClient.delete(
      `/branch/${id}`,
    );
    return res.data;
  },

};
const clean = (val?: string) => (val && val.trim() !== "" ? val : undefined);
