"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Volleyball,
} from "lucide-react";

import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomerShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/home", label: "Trang chủ" },
  { href: "/booking-court", label: "Đặt sân" },
  { href: "/customerLogin", label: "Đăng nhập" },
];

const isActivePath = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === "/home") {
    return pathname === "/home" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function CustomerShell({ children }: CustomerShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const displayName = user?.fullName?.trim() || "Khách";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="dark min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_right,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#020617_45%,#07111f_100%)] text-slate-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
          <Link href="/home" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <Volleyball className="h-5 w-5 text-emerald-200" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-[0.14em] text-slate-50 uppercase">
                Pickleball Smart
              </p>
              <p className="text-[11px] text-slate-400">Customer booking experience</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/6 bg-white/5 p-1 md:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-slate-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 lg:flex">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Đặt sân trong vài bước</span>
            </div>

            {isHydrated && isAuthenticated ? (
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-semibold text-slate-950">
                  {initials || "U"}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-medium text-slate-50">{displayName}</p>
                  <p className="text-[11px] text-slate-400">Tài khoản khách hàng</p>
                </div>
              </div>
            ) : (
              <Button asChild className="h-11 rounded-full bg-emerald-400 px-5 text-slate-950 hover:bg-emerald-300">
                <Link href="/customerLogin" className="inline-flex items-center gap-2">
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/8 bg-slate-950/80">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-500/10">
                <Volleyball className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-50">Pickleball Smart</p>
                <p className="text-sm text-slate-400">Booking platform for clubs and players</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Một trải nghiệm đặt sân gọn, rõ, dễ dùng cho khách hàng. Tập trung vào tốc độ đặt sân,
              minh bạch thông tin và luồng thao tác ổn định trên mobile lẫn desktop.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                Nhiều chi nhánh
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Clock3 className="h-3.5 w-3.5 text-amber-300" />
                Khung giờ linh hoạt
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <CalendarDays className="h-3.5 w-3.5 text-cyan-300" />
                Đặt trước nhanh
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
              Điều hướng
            </p>
            <div className="space-y-3 text-sm text-slate-400">
              <Link href="/home" className="block transition-colors hover:text-slate-50">
                Trang chủ
              </Link>
              <Link href="/booking-court" className="block transition-colors hover:text-slate-50">
                Đặt sân ngay
              </Link>
              <Link href="/customerLogin" className="block transition-colors hover:text-slate-50">
                Đăng nhập khách hàng
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
              Hỗ trợ
            </p>
            <div className="space-y-3 text-sm text-slate-400">
              <p>Hotline: 1900 1234</p>
              <p>Email: support@pickleballsmart.vn</p>
              <p>Giờ làm việc: 08:00 - 22:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 px-4 py-4 md:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Pickleball Smart. All rights reserved.</p>
            <p>Thiết kế dành cho trải nghiệm đặt sân chuyên nghiệp.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}