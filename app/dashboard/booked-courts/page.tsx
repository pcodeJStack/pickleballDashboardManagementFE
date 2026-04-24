"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Volleyball } from "lucide-react";

type BookedCourt = {
  id: number;
  court: string;
  customer: string;
  date: string;
  time: string;
  status: "upcoming" | "playing" | "finished";
};

const initialBookedCourts: BookedCourt[] = [
  {
    id: 1,
    court: "Sân A1",
    customer: "Nguyễn Văn A",
    date: "Hôm nay",
    time: "18:00 - 19:30",
    status: "playing",
  },
  {
    id: 2,
    court: "Sân B2",
    customer: "Trần Thị B",
    date: "Hôm nay",
    time: "19:30 - 21:00",
    status: "upcoming",
  },
  {
    id: 3,
    court: "Sân C1",
    customer: "Lê Văn C",
    date: "Hôm nay",
    time: "21:00 - 22:30",
    status: "upcoming",
  },
];

const BookedCourtsPage = () => {
  const [bookedCourts] = useState<BookedCourt[]>(initialBookedCourts);
  const [search, setSearch] = useState("");

  const filtered = bookedCourts.filter((b) => {
    const keyword = search.toLowerCase();
    return (
      b.court.toLowerCase().includes(keyword) ||
      b.customer.toLowerCase().includes(keyword) ||
      b.time.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý sân đã đặt</h1>
          <p className="text-xs text-slate-400">
            Xem nhanh các sân đang có lịch, đang chơi và đã hoàn thành trong khung giờ tối.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
          <CalendarClock className="h-3.5 w-3.5 text-amber-300" />
          <span>Hôm nay, 18:00 - 22:30</span>
        </div>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <CardTitle>Danh sách sân đã đặt</CardTitle>
            <CardDescription>
              Theo dõi tình trạng từng sân trong khung giờ buổi tối.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Lọc theo sân, khách hoặc khung giờ..."
              className="h-8 w-56 bg-slate-900/60 border-slate-700 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
            <span>Sân</span>
            <span>Khách hàng</span>
            <span>Ngày</span>
            <span>Khung giờ</span>
            <span className="text-right">Tình trạng</span>
            <span className="text-right">Thao tác</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] items-center gap-3 rounded-xl bg-slate-900/70 px-3 py-2.5 text-xs text-slate-200 border border-slate-800/70 hover:bg-slate-800/80 hover:border-slate-600/80"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/90 text-amber-200 border border-slate-700/80">
                    <Volleyball className="h-3.5 w-3.5" />
                  </span>
                  {item.court}
                </span>
                <span className="space-y-0.5">
                  <span className="font-medium text-slate-50">{item.customer}</span>
                </span>
                <span className="text-[11px] text-slate-300">{item.date}</span>
                <span className="text-[11px] text-slate-300">{item.time}</span>
                <span className="flex justify-end">
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-medium tracking-wide ${
                      item.status === "playing"
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                        : item.status === "upcoming"
                          ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                          : "bg-slate-700/40 text-slate-200 border border-slate-500/60"
                    }`}
                  >
                    {item.status === "playing"
                      ? "Đang chơi"
                      : item.status === "upcoming"
                        ? "Sắp diễn ra"
                        : "Đã kết thúc"}
                  </span>
                </span>
                <span className="flex justify-end gap-1.5">
                  {item.status === "upcoming" && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/80 text-[11px] text-slate-200 hover:bg-slate-800"
                    >
                      Check-in
                    </Button>
                  )}
                  {item.status === "playing" && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-emerald-500/60 bg-emerald-500/10 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                    >
                      Kết thúc
                    </Button>
                  )}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-xs text-slate-500">
                Không có sân nào được đặt trong bộ lọc hiện tại.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookedCourtsPage;
