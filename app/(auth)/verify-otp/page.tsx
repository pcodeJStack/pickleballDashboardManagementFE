import { Suspense } from "react";

import VerifyOtpClient from "./verify-otp-client";

const VerifyOtpPage = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-slate-550 pb-grid-bg text-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-slate-400">Dang tai...</div>
        </div>
      </div>
    }
  >
    <VerifyOtpClient />
  </Suspense>
);

export default VerifyOtpPage;