
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, TrendingUp, Users, Volleyball } from "lucide-react";

const DashboardPage = () => {
  // mock dữ liệu thống kê tạm thời – sau này thay bằng API
  const stats = [
    {
      label: "Lượt đặt hôm nay",
      value: 42,
      trend: "+18% so với hôm qua",
      icon: CalendarClock,
      accent: "from-emerald-400/20 via-emerald-500/10 to-emerald-400/0",
    },
    {
      label: "Sân đang hoạt động",
      value: 8,
      trend: "100% online",
      icon: Volleyball,
      accent: "from-amber-400/25 via-amber-500/10 to-amber-400/0",
    },
    {
      label: "Tỉ lệ lấp đầy",
      value: "76%",
      trend: "+9% tuần này",
      icon: TrendingUp,
      accent: "from-sky-400/25 via-sky-500/10 to-sky-400/0",
    },
    {
      label: "Khách thành viên",
      value: 128,
      trend: "+6 trong 24h",
      icon: Users,
      accent: "from-fuchsia-400/25 via-fuchsia-500/10 to-fuchsia-400/0",
    },
  ];

  const upcomingSlots = [
    {
      court: "Sân A1",
      time: "18:00 - 19:30",
      type: "Giờ vàng",
      status: "Đã đặt",
    },
    {
      court: "Sân B2",
      time: "19:30 - 21:00",
      type: "Thường",
      status: "Còn trống",
    },
    {
      court: "Sân C1",
      time: "21:00 - 22:30",
      type: "Giờ muộn",
      status: "Giữ chỗ",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">
            Tổng quan hoạt động sân
          </h1>
          <p className="text-xs text-slate-400">
            Theo dõi nhanh tình trạng sân, slot giờ cao điểm và khách đặt sân.
          </p>
        </div>
        <Button size="sm" className="hidden sm:inline-flex bg-amber-500 text-slate-950 hover:bg-amber-400">
          Xem lịch hôm nay
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="relative overflow-hidden border border-slate-800/80 bg-slate-950/60"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent}`}
              />
              <CardHeader className="relative flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                    {item.label}
                  </CardTitle>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-50">
                      {item.value}
                    </span>
                    <span className="text-[11px] text-emerald-300/90 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {item.trend}
                    </span>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/70 text-amber-200 border border-slate-700/80">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <CardTitle>Khung giờ cao điểm hôm nay</CardTitle>
              <CardDescription>
                Danh sách các slot buổi tối và trạng thái đặt sân.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800">
              Quản lý slot
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
              <span>Sân</span>
              <span>Khung giờ</span>
              <span>Loại slot</span>
              <span className="text-right">Trạng thái</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {upcomingSlots.map((slot) => (
                <div
                  key={slot.court + slot.time}
                  className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center gap-3 rounded-xl bg-slate-900/60 px-3 py-2.5 text-xs text-slate-200 border border-slate-800/70"
                >
                  <span className="font-medium">{slot.court}</span>
                  <span className="text-[11px] text-slate-300">{slot.time}</span>
                  <span className="inline-flex h-6 items-center justify-center rounded-full bg-slate-800/80 px-2 text-[10px] uppercase tracking-[0.14em] text-slate-200">
                    {slot.type}
                  </span>
                  <span className="flex justify-end">
                    <span
                      className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-medium tracking-wide ${
                        slot.status === "Còn trống"
                          ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                          : slot.status === "Đã đặt"
                            ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                            : "bg-sky-500/15 text-sky-200 border border-sky-400/40"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <CardTitle>Sân đang trống</CardTitle>
              <CardDescription>
                Top sân chưa có lịch trong khung giờ cao điểm.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10">
              Xem tất cả sân
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {[
              { name: "Sân B2", surface: "Indoors", slots: "2 khung giờ trống" },
              { name: "Sân C1", surface: "Outdoors", slots: "1 khung giờ trống" },
              { name: "Sân A3", surface: "Indoors", slots: "3 khung giờ trống" },
            ].map((court) => (
              <div
                key={court.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-200"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-50">{court.name}</p>
                  <p className="text-[11px] text-slate-400">{court.surface}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-emerald-300">
                    {court.slots}
                  </span>
                  <Button size="xs" variant="outline" className="border-slate-700 bg-slate-900/80 text-[11px] text-slate-200 hover:bg-slate-800">
                    Gán lịch nhanh
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
