"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Volleyball,
} from "lucide-react";

import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FeatureTone = "emerald" | "amber" | "cyan";

type FeatureCard = {
  title: string;
  desc: string;
  icon: LucideIcon;
  tone: FeatureTone;
};

const highlightCards: FeatureCard[] = [
  {
    title: "Đặt sân nhanh",
    desc: "Luồng đặt sân được tối ưu cho thao tác trên desktop và mobile.",
    icon: Volleyball,
    tone: "emerald",
  },
  {
    title: "Xem slot trống",
    desc: "Theo dõi khung giờ khả dụng trước khi quyết định đặt sân.",
    icon: Clock3,
    tone: "amber",
  },
  {
    title: "Thông tin rõ ràng",
    desc: "Cập nhật booking, tài khoản và thông báo trong một màn hình.",
    icon: ShieldCheck,
    tone: "cyan",
  },
];

const bookingSteps = [
  { icon: MapPin, title: "Chọn chi nhánh", desc: "Chọn địa điểm bạn muốn chơi." },
  { icon: LayoutGrid, title: "Chọn khu", desc: "Lọc đúng khu trong chi nhánh." },
  { icon: Volleyball, title: "Chọn sân", desc: "Chọn sân đang hoạt động." },
  { icon: CalendarDays, title: "Chọn ngày", desc: "Chọn ngày muốn đặt." },
  { icon: Clock3, title: "Chọn khung giờ", desc: "Chốt slot trống và xác nhận." },
];

const CustomerHomePage = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const fullName = user?.fullName?.trim() ?? "";
  const phone = user?.phone?.trim() ?? "";
  const role = (user?.role ?? "CUSTOMER").toUpperCase();

  if (!isHydrated) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/5">
          <CardHeader className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl md:col-span-2 xl:col-span-1" />
            </div>
            <div className="grid gap-4 lg:grid-cols-12">
              <Skeleton className="h-64 rounded-3xl lg:col-span-7" />
              <Skeleton className="h-64 rounded-3xl lg:col-span-5" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
          <CardHeader className="space-y-3 border-b border-white/8 bg-white/5 p-6 md:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Customer dashboard
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight md:text-3xl">
              Bạn chưa đăng nhập
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-300">
              Đăng nhập để xem booking, quản lý thông tin cá nhân và đặt sân nhanh hơn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {highlightCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/8 bg-slate-950/55 p-4"
                  >
                    <div
                      className={cn(
                        "mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border",
                        item.tone === "amber"
                          ? "border-amber-300/30 bg-amber-400/10"
                          : item.tone === "cyan"
                            ? "border-cyan-300/30 bg-cyan-400/10"
                            : "border-emerald-300/30 bg-emerald-400/10",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          item.tone === "amber"
                            ? "text-amber-100"
                            : item.tone === "cyan"
                              ? "text-cyan-100"
                              : "text-emerald-100",
                        )}
                      />
                    </div>
                    <p className="text-sm font-semibold text-slate-50">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full bg-emerald-400 px-5 text-slate-950 hover:bg-emerald-300">
                <Link href="/customerLogin" className="inline-flex items-center gap-2">
                  Đi đến đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-white/12 bg-white/5 px-5 text-slate-100 hover:bg-white/10"
              >
                <Link href="/booking-court">Xem khung giờ trống</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-white/8 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),transparent_32%,rgba(251,191,36,0.08)_68%,transparent)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              Modern booking experience
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Trang chủ khách hàng
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-50 md:text-5xl md:leading-tight">
                Đặt sân pickleball nhanh, rõ ràng và gọn trong một màn hình.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Từ chọn chi nhánh đến chốt khung giờ, mọi bước đều được tối ưu để khách hàng thao tác
                nhanh trên mobile, nhưng vẫn giữ cảm giác chắc chắn và chuyên nghiệp trên desktop.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-emerald-400 px-6 text-slate-950 hover:bg-emerald-300">
                <Link href="/booking-court" className="inline-flex items-center gap-2">
                  <Volleyball className="h-4 w-4" />
                  Đặt sân ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/12 bg-white/5 px-6 text-slate-100 hover:bg-white/10"
              >
                <Link href="/booking-court" className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Xem khung giờ trống
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Đặt trong phút", value: "3" },
              { label: "Chi nhánh đang mở", value: "12" },
              { label: "Khung giờ hiển thị", value: "24/7" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-50">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {highlightCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="rounded-[1.75rem] border border-white/8 bg-white/5 shadow-[0_12px_50px_rgba(2,6,23,0.3)]"
            >
              <CardContent className="p-5">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl border",
                    item.tone === "amber"
                      ? "border-amber-300/30 bg-amber-400/10"
                      : item.tone === "cyan"
                        ? "border-cyan-300/30 bg-cyan-400/10"
                        : "border-emerald-300/30 bg-emerald-400/10",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      item.tone === "amber"
                        ? "text-amber-100"
                        : item.tone === "cyan"
                          ? "text-cyan-100"
                          : "text-emerald-100",
                    )}
                  />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-50">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.75rem] border border-white/8 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
          <CardHeader className="space-y-2 border-b border-white/8 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <CalendarClock className="h-4 w-4 text-emerald-300" />
              Booking sắp tới
            </div>
            <CardTitle className="text-xl text-slate-50 md:text-2xl">
              Chưa có booking sắp tới
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-400">
              Khi bạn đặt sân, thông tin lịch sẽ xuất hiện ở đây để theo dõi nhanh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/45 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10">
                  <CalendarClock className="h-6 w-6 text-emerald-200" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-semibold text-slate-50">Hệ thống đang sẵn sàng cho booking mới</p>
                  <p className="text-sm leading-6 text-slate-400">
                    Chọn chi nhánh, khu, sân, ngày và slot trống để hoàn tất booking trong vài thao tác.
                  </p>
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <Button asChild className="h-11 rounded-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                      <Link href="/booking-court" className="inline-flex items-center gap-2">
                        Đặt sân ngay
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full border-white/12 bg-white/5 text-slate-100 hover:bg-white/10"
                    >
                      <Link href="/booking-court">Xem khung giờ trống</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border border-white/8 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
          <CardHeader className="space-y-2 border-b border-white/8 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Users className="h-4 w-4 text-amber-300" />
              Tài khoản
            </div>
            <CardTitle className="text-xl text-slate-50 md:text-2xl">Thông tin đăng nhập hiện tại</CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-400">
              Đảm bảo dữ liệu người dùng được hiển thị rõ ràng, phù hợp cho môi trường production.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Trạng thái</p>
                <p className="mt-1 text-sm font-semibold text-slate-50">Đang đăng nhập</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: "Họ tên", value: fullName || "--" },
                { label: "Số điện thoại", value: phone || "--" },
                { label: "Vai trò", value: role },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                  {item.label === "Vai trò" ? (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      {item.value}
                    </span>
                  ) : (
                    <p className="max-w-[60%] truncate text-right text-slate-100">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.75rem] border border-white/8 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
          <CardHeader className="space-y-2 border-b border-white/8 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Quy trình đặt sân
            </div>
            <CardTitle className="text-xl text-slate-50">5 bước đơn giản để hoàn tất booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {bookingSteps.map((item, index) => {
              const Icon = item.icon;
              const isWarm = index < 2;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl border",
                      isWarm
                        ? "border-amber-300/30 bg-amber-400/10"
                        : "border-emerald-300/30 bg-emerald-400/10",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isWarm ? "text-amber-100" : "text-emerald-100")} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-50">
                      {index + 1}. {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-white/8 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
            <CardHeader className="space-y-2 border-b border-white/8 p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <Bell className="h-4 w-4 text-amber-300" />
                Thông báo / ưu đãi
              </div>
              <CardTitle className="text-xl text-slate-50">Hiện chưa có thông báo mới</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10">
                  <Bell className="h-5 w-5 text-amber-100" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-50">Chúng tôi sẽ thông báo khi có ưu đãi</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Các cập nhật về sân, giá hoặc khung giờ mới sẽ được hiển thị ngay trên màn hình này.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/8 bg-linear-to-br from-emerald-400/10 via-white/5 to-amber-400/10 shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sẵn sàng chơi</p>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Bắt đầu booking ngay khi bạn sẵn sàng.
                  </h2>
                  <p className="text-sm leading-6 text-slate-300">
                    Giao diện này được thiết kế như một trang home production: rõ ràng, có header/footer,
                    và tập trung vào hành động chính.
                  </p>
                </div>
                <Button asChild className="h-12 rounded-full bg-emerald-400 px-6 text-slate-950 hover:bg-emerald-300">
                  <Link href="/booking-court" className="inline-flex items-center gap-2">
                    Vào trang đặt sân
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomerHomePage;
