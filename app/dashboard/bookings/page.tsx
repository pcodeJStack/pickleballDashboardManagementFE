"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Filter, Volleyball } from "lucide-react";

type Booking = {
  id: number;
  court: string;
  customer: string;
  phone: string;
  time: string;
  date: string;
  status: "confirmed" | "pending" | "cancelled";
};

const initialBookings: Booking[] = [
  {
    id: 1,
    court: "Sân A1",
    customer: "Nguyễn Văn A",
    phone: "0901 234 567",
    time: "18:00 - 19:30",
    date: "Hôm nay",
    status: "confirmed",
  },
  {
    id: 2,
    court: "Sân B2",
    customer: "Trần Thị B",
    phone: "0902 345 678",
    time: "19:30 - 21:00",
    date: "Hôm nay",
    status: "pending",
  },
  {
    id: 3,
    court: "Sân C1",
    customer: "Lê Văn C",
    phone: "0903 456 789",
    time: "21:00 - 22:30",
    date: "Ngày mai",
    status: "confirmed",
  },
];

const BookingManagement = () => {
  const [bookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Booking["status"] | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.court.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex  items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý đặt sân</h1>
          <p className="text-xs text-slate-400">
            Xem nhanh các lượt đặt sân theo ngày, khung giờ và trạng thái.
          </p>
        </div>
        <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
          Tạo đặt sân thủ công
        </Button>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <CardTitle>Lịch đặt sân</CardTitle>
            <CardDescription>
              Lọc theo khách hàng, sân, số điện thoại hoặc trạng thái xác nhận.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
              <CalendarClock className="h-3.5 w-3.5 text-amber-300" />
              <span>Hôm nay, 18:00 - 22:00</span>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
              <Filter className="h-3.5 w-3.5" />
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "all" ? "bg-slate-800 text-slate-100" : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "confirmed"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("confirmed")}
              >
                Đã xác nhận
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "pending"
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("pending")}
              >
                Chờ xác nhận
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "cancelled"
                    ? "bg-destructive/30 text-destructive"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("cancelled")}
              >
                Đã huỷ
              </button>
            </div>
            <Input
              placeholder="Tìm theo tên, sân hoặc SĐT..."
              className="h-8 w-52 bg-slate-900/60 border-slate-700 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
            <span>Sân</span>
            <span>Khách hàng</span>
            <span>Ngày</span>
            <span>Khung giờ</span>
            <span className="text-right">Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] items-center gap-3 rounded-xl bg-slate-900/70 px-3 py-2.5 text-xs text-slate-200 border border-slate-800/70 hover:bg-slate-800/80 hover:border-slate-600/80"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/90 text-amber-200 border border-slate-700/80">
                    <Volleyball className="h-3.5 w-3.5" />
                  </span>
                  {booking.court}
                </span>
                <span className="space-y-0.5">
                  <span className="font-medium text-slate-50">
                    {booking.customer}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {booking.phone}
                  </span>
                </span>
                <span className="text-[11px] text-slate-300">{booking.date}</span>
                <span className="text-[11px] text-slate-300">{booking.time}</span>
                <span className="flex justify-end">
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-medium tracking-wide ${
                      booking.status === "confirmed"
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                        : booking.status === "pending"
                          ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                          : "bg-destructive/20 text-destructive border border-destructive/40"
                    }`}
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : booking.status === "pending"
                        ? "Chờ xác nhận"
                        : "Đã huỷ"}
                    </span>
                  </span>
                  <span className="flex justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/80 text-[11px] text-slate-200 hover:bg-slate-800"
                    >
                      Chi tiết
                    </Button>
                    {booking.status !== "cancelled" && (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        Huỷ
                      </Button>
                    )}
                  </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-xs text-slate-500">
                Không tìm thấy lượt đặt sân nào phù hợp.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;
