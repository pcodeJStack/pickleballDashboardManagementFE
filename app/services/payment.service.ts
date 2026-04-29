import { axiosClient } from "../lib/axiosClient";
export type PollingPaymentStatusResponse = {
  status: "PENDING" | "SUCCESS" | "FAILED" | "PAID" | "UNPAID";
  bookingId: string;
  amount: number;
};
export const PaymentService = {
    getPaymentStatus: async (orderCode: number): Promise<PollingPaymentStatusResponse> => {
        const res = await axiosClient.get(`/payment/${orderCode}/status`, {
            withCredentials: true,
        });
        return res.data;
    }
};  
