import type { ReactNode } from "react";

import { CustomerShell } from "@/components/customer/customer-shell";

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return <CustomerShell>{children}</CustomerShell>;
}