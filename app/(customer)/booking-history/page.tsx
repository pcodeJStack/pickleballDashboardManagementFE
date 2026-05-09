"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Users, XCircle } from "lucide-react";

import { useGetMyBookingsQuery } from "@/app/hooks/booking_hooks/useGetMyBookingsQuery";
import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const PAGE_SIZE = 10;
const statusStyles: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-emerald-300/20 bg-emerald-400/8 text-emerald-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-rose-300/20 bg-rose-400/8 text-rose-200",
    icon: XCircle,
  },
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const formatCourtType = (value: string | undefined) => {
  if (!value) return "-";
  if (value === "INDOOR") return "Trong nhà";
  if (value === "OUTDOOR") return "Ngoài trời";
  return value;
};

const formatSurfaceType = (value: string | undefined) => {
  if (!value) return "-";
  if (value === "ACRYLIC") return "Acrylic";
  if (value === "WOOD") return "Gỗ";
  return value;
};
const BookingHistoryPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useGetMyBookingsQuery(
    page,
    PAGE_SIZE,
    isAuthenticated && isHydrated,
  );

  const bookings = data?.content ?? [];
  const totalPages = data?.page?.totalPages ?? 1;
  const totalElements = data?.page?.totalElements ?? 0;

  const pageLabel = useMemo(
    () => `Trang ${page + 1} / ${totalPages}`,
    [page, totalPages],
  );
  if (!isHydrated) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <Card className="rounded-[1.75rem] border border-white/8 bg-white/5">
          <CardHeader>
            <CardTitle className="text-slate-50">Đang tải...</CardTitle>
          </CardHeader>
        </Card>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <Card className="rounded-[1.75rem] border border-white/8 bg-white/5">
          <CardHeader>
            <CardTitle className="text-slate-50">Bạn cần đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="h-11 rounded-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/customerLogin">Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 lg:px-8">
      <Card className="rounded-[1.75rem] border border-white/10 bg-slate-950/40">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-slate-50">Lịch sử đặt sân</CardTitle>
              <p className="text-sm text-slate-400">
                Tổng số {totalElements} booking
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-300" />
              {pageLabel}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-sm text-slate-400">Đang tải danh sách booking...</p>
          )}

          {isError && (
            <p className="text-sm text-rose-300">Không thể tải lịch sử booking.</p>
          )}

          {!isLoading && !isError && bookings.length === 0 && (
            <p className="text-sm text-slate-400">
              Hiện chưa có lịch sử đặt sân. Khi bạn đặt sân, thông tin sẽ được cập nhật tại đây.
            </p>
          )}

          {!isLoading && !isError && bookings.length > 0 && (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const style = statusStyles[booking.status] ?? {
                  label: booking.status,
                  className: "border-white/12 bg-white/4 text-slate-200",
                  icon: Clock3,
                };
                const StatusIcon = style.icon;

                return (
                  <div
                    key={booking.id}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.6fr_0.9fr]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                              {booking.imageUrl ? (
                                <img
                                  src={booking.imageUrl}
                                  alt={booking.courtName}
                                  className="h-[fulll] w-[full] object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-base font-semibold text-slate-50">
                                {booking.courtName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Sân {booking.courtNumber} 
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${style.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {style.label}
                          </span>
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-300 sm:grid-cols-2">
                          <div className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-emerald-300" />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-amber-300" />
                            <span>
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-cyan-300" />
                            <span>{booking.location || "Chưa cập nhật"}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-sky-300" />
                            <span>{booking.maxPlayers ?? 0} người</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Tổng giá trị
                        </div>
                        <div className="text-2xl font-semibold text-slate-50">
                          {booking.totalPrice.toLocaleString("vi-VN")} VNĐ
                        </div>
                        <div className="h-px bg-white/8" />
                        <div className="grid gap-2 text-xs text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Mã booking</span>
                            <span className="text-slate-200">{booking.id}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Tên sân</span>
                            <span className="text-slate-200">{booking.courtName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Sân số</span>
                            <span className="text-slate-200">{booking.courtNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Loại sân</span>
                            <span className="text-slate-200">
                              {formatCourtType(booking.courtType)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mặt sân</span>
                            <span className="text-slate-200">
                              {formatSurfaceType(booking.surfaceType)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
            <span>Hiển thị {bookings.length} / {totalElements} booking</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default BookingHistoryPage;
