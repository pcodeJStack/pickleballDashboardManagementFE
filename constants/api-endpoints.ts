export const AUTH_API = {
  LOGIN: "/auth/login",
  CUSTOMER_REGISTER: "/auth/customer/register",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
};

export const BRANCH_API ={
  GET_ALL: "/branches",
  GET_BY_ID: (id: string | number) => `/branches/${id}`,
  CREATE: "/branch",
  UPDATE: (id: string | number) => `/branch/${id}`,
  DELETE: (id: string | number) => `/branch/${id}`,
}

export const COURT_API = {
  GET_ALL: "/courts",
  GET_BY_ID: (id: string | number) => `/courts/${id}`,
  CREATE: "/court",
  UPDATE: (id: string | number) => `/court/${id}`,
  DELETE: (id: string | number) => `/court/${id}`,
};

export const ZONE_API = {
  GET_ALL: "/zones",
  GET_BY_ID: (id: string | number) => `/zones/${id}`,
  CREATE: "/zone",
  UPDATE: (id: string | number) => `/zone/${id}`,
  DELETE: (id: string | number) => `/zone/${id}`,
};

export const TIMESLOT_API = {
  GET_ALL: "/timeSlots",
  CREATE: "/timeslot",
};

export const COURT_PRICING_API = {
  GET_ALL: "/court-pricings",
  CREATE: "/court-pricings",
};

export const AVAILABLE_SLOT_API = {
  GET_ALL: "/available-slots",
};

export const BOOKING_API = {
  CREATE: "/booking",
};

export const PAYMENT_API = {
  STATUS: (orderCode: string | number) => `/payment/${orderCode}/status`,
};
