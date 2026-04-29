"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  MapPin,
  TentTree,
  Volleyball,
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

import { useGetAllBranchesQuery } from "@/app/hooks/branch_hooks/useGetAllBranchesQuery";
import { useGetAllZonesQuery } from "@/app/hooks/zone_hooks/useGetZonesQuery";
import { useGetAllCourtsQuery } from "@/app/hooks/court_hooks/useGetAllCourtsQuery";
import { useCreateBookingMutation } from "@/app/hooks/booking_hooks/useCreateBookingMutation";
import { useGetAvailableSlotsQuery } from "@/app/hooks/booking_hooks/useGetAvailableSlotsQuery";
import { usePollingPaymentStatus } from "@/app/hooks/payment_hooks/pollingPaymentStatus";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE_OPTION = "__NONE__";
const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

type CalendarCell =
  | {
      key: string;
      empty: true;
    }
  | {
      key: string;
      empty: false;
      dayNumber: number;
      dateKey: string;
      isToday: boolean;
      isSelected: boolean;
      isPast: boolean;
    };

const getLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

type BookingPaymentResult = {
  bookingId: string;
  paymentUrl: string;
  qrCode: string;
  orderCode: number;
};

const BookingPage = () => {
  const [branchId, setBranchId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [courtId, setCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [activeStep, setActiveStep] = useState(1);
  const [bookingPayment, setBookingPayment] =
    useState<BookingPaymentResult | null>(null);

  const { mutateAsync: createBooking, isPending: isCreatingBooking } =
    useCreateBookingMutation();

  const orderCode = bookingPayment?.orderCode ?? null;
  const {
    data: paymentStatusData,
    isFetching: isPollingPaymentStatus,
  } = usePollingPaymentStatus(orderCode, Boolean(bookingPayment));

  useEffect(() => {
    const status = paymentStatusData?.status;
    if (status !== "SUCCESS" && status !== "PAID") return;
    setBookingPayment(null);
  }, [paymentStatusData?.status]);

  const { data: branchData, isLoading: isLoadingBranches } =
    useGetAllBranchesQuery({
      page: 0,
      size: 100,
      name: "",
      address: "",
      phone: "",
    });

  const branches = branchData?.items ?? [];

  const { data: zoneData, isLoading: isLoadingZones } = useGetAllZonesQuery(
    {
      page: 0,
      size: 100,
      branchId,
      name: "",
    },
    Boolean(branchId),
  );

  const zones = zoneData?.items ?? [];

  const { data: courtData, isLoading: isLoadingCourts } = useGetAllCourtsQuery({
    page: 0,
    size: 100,
    branchId,
    zoneId,
    name: "",
    courtStatus: "ACTIVE",
  });

  const courts = useMemo(() => {
    const courtItems = courtData?.items ?? [];
    if (!zoneId) return courtItems;
    return courtItems.filter((court) => court.zoneId === zoneId);
  }, [courtData?.items, zoneId]);

  const {
    data: availableSlotData,
    isLoading: isLoadingAvailableSlots,
    isError: isAvailableSlotsError,
    error: availableSlotsError,
    refetch: refetchAvailableSlots,
  } = useGetAvailableSlotsQuery(
    {
      courtId,
      date: bookingDate,
      page: 0,
      size: 50,
    },
    Boolean(courtId && bookingDate),
  );

  const availableSlots = availableSlotData?.content ?? [];

  const getSlotId = (slot: Record<string, unknown>) => {
    const id = slot.timeSlotId ?? slot.slotId ?? slot.id;
    return typeof id === "string" ? id : "";
  };

  const getSlotTimeText = (slot: Record<string, unknown>) => {
    const startTime =
      typeof slot.startTime === "string"
        ? slot.startTime
        : typeof slot.start === "string"
          ? slot.start
          : "--:--";
    const endTime =
      typeof slot.endTime === "string"
        ? slot.endTime
        : typeof slot.end === "string"
          ? slot.end
          : "--:--";

    return `${startTime} - ${endTime}`;
  };

  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const selectedZone = zones.find((zone) => zone.id === zoneId);
  const selectedCourt = courts.find((court) => court.id === courtId);
  const todayKey = getLocalDateKey(new Date());
  const selectedDate = bookingDate ? parseDateKey(bookingDate) : null;
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(selectedDate)
    : "Chưa chọn ngày";

  const calendarStart = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const leadingEmptyCells = calendarStart.getDay();
  
  const calendarCells: CalendarCell[] = [
    ...Array.from({ length: leadingEmptyCells }, (_, index) => ({
      key: `empty-${index}`,
      empty: true as const,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const date = new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        dayNumber,
        12,
      );
      return {
        key: getLocalDateKey(date),
        empty: false,
        dayNumber,
        dateKey: getLocalDateKey(date),
        isToday: getLocalDateKey(date) === todayKey,
        isSelected: getLocalDateKey(date) === bookingDate,
        isPast: getLocalDateKey(date) < todayKey,
      };
    }),
  ];

  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  const maxAccessibleStep = !branchId
    ? 1
    : !zoneId
      ? 2
      : !courtId
        ? 3
        : !bookingDate
          ? 4
          : 5;

  const currentStep = activeStep;

  const progressPercent = Math.round(((currentStep - 1) / 4) * 100);

  const steps = [
    {
      id: 1,
      label: "Chi nhánh",
      icon: MapPin,
      value: selectedBranch?.name || "Chưa chọn chi nhánh",
    },
    {
      id: 2,
      label: "Khu",
      icon: LayoutGrid,
      value: selectedZone?.name || "Chưa chọn khu",
    },
    {
      id: 3,
      label: "Sân",
      icon: Volleyball,
      value: selectedCourt?.name || "Chưa chọn sân",
    },
    {
      id: 4,
      label: "Ngày",
      icon: CalendarDays,
      value: bookingDate || "Chưa chọn ngày",
    },
    {
      id: 5,
      label: "Khung giờ",
      icon: Clock3,
      value: selectedSlotId ? "Đã chọn khung giờ" : "Chưa chọn khung giờ",
    },
  ];

  const getStepAccent = (stepId: number) => {
    if (stepId <= 2) return "amber";
    return "emerald";
  };

  const goToStep = (stepId: number) => {
    if (stepId > maxAccessibleStep) return;
    setActiveStep(stepId);
  };

  const handleBookNow = async () => {
    if (!courtId || !selectedSlotId || !bookingDate) {
      toast.error("Vui lòng chọn đầy đủ sân, ngày và khung giờ.");
      return;
    }

    try {
      const response = await createBooking({
        courtId,
        timeSlotId: selectedSlotId,
        bookingDate,
      });

      setBookingPayment(response);
      setSelectedSlotId("");
      setActiveStep(5);
      void refetchAvailableSlots();
      toast.success("Đặt sân thành công. Vui lòng thanh toán để giữ chỗ.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đặt sân thất bại.";
      toast.error(typeof message === "string" ? message : "Đặt sân thất bại.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 md:px-6 lg:px-8">
      <header className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              Đặt sân theo các bước
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              Chỉ hiển thị nội dung của bước hiện tại để thao tác nhanh, rõ ràng
              và hạn chế nhầm lẫn.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
            <p className="font-medium text-slate-200">Tiến độ</p>
            <p className="mt-1 text-slate-400">
              Bước {currentStep}/5 • {progressPercent}%
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-6 backdrop-blur md:px-6">
        <div className="relative hidden md:block">
          <div className="absolute left-0 top-4 h-0.5 w-full bg-slate-800" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-emerald-300/70"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="relative z-10 flex items-center justify-between">
            {steps.map((step) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const Icon = step.icon;
              const accent = getStepAccent(step.id);

              const tileTone = isCompleted
                ? "border-emerald-300/60 bg-emerald-500/10"
                : isActive
                  ? accent === "amber"
                    ? "border-amber-300/60 bg-amber-500/10"
                    : "border-emerald-300/60 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-950/30";

              const iconTone = isCompleted
                ? "text-emerald-100"
                : isActive
                  ? accent === "amber"
                    ? "text-amber-100"
                    : "text-emerald-100"
                  : "text-slate-400";

              const badgeTone = isCompleted
                ? "border-emerald-300/70 bg-emerald-500/15 text-emerald-100"
                : isActive
                  ? "border-slate-600 bg-slate-950 text-slate-200"
                  : "border-slate-700 bg-slate-950 text-slate-300";

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > maxAccessibleStep}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl p-2 transition",
                    step.id <= maxAccessibleStep
                      ? "cursor-pointer hover:bg-white/5"
                      : "cursor-not-allowed opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-2xl border",
                      tileTone,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", iconTone)} />
                    <div
                      className={cn(
                        "absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                        badgeTone,
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        step.id
                      )}
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      isActive ? "text-slate-50" : "text-slate-200",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="max-w-40 truncate text-center text-[11px] text-slate-400">
                    {step.value}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto md:hidden">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const Icon = step.icon;
            const accent = getStepAccent(step.id);

            const pillTone = isCompleted
              ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-100"
              : isActive
                ? accent === "amber"
                  ? "border-amber-300/60 bg-amber-500/10 text-amber-100"
                  : "border-emerald-300/60 bg-emerald-500/10 text-emerald-100"
                : "border-slate-800/80 bg-slate-950/30 text-slate-200";

            const iconTone = isCompleted
              ? "text-emerald-100"
              : isActive
                ? accent === "amber"
                  ? "text-amber-100"
                  : "text-emerald-100"
                : "text-slate-400";

            const iconTileTone = isCompleted
              ? "border-emerald-300/60 bg-emerald-500/10"
              : isActive
                ? accent === "amber"
                  ? "border-amber-300/60 bg-amber-500/10"
                  : "border-emerald-300/60 bg-emerald-500/10"
                : "border-slate-700 bg-slate-950/20";

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={step.id > maxAccessibleStep}
                className={cn(
                  "flex min-w-48 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                  pillTone,
                  step.id <= maxAccessibleStep
                    ? "cursor-pointer hover:bg-white/5"
                    : "cursor-not-allowed opacity-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border",
                    iconTileTone,
                  )}
                >
                  <Icon className={cn("h-5 w-5", iconTone)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{step.label}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px]",
                        isCompleted
                          ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-100"
                          : isActive
                            ? "border-slate-600 bg-slate-950 text-slate-200"
                            : "border-slate-700 bg-slate-950 text-slate-300",
                      )}
                    >
                      {isCompleted ? "✓" : step.id}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[11px]",
                      isActive || isCompleted
                        ? "text-current/80"
                        : "text-slate-400",
                    )}
                  >
                    {step.value}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[11px]",
                      isCompleted
                        ? "text-emerald-200/80"
                        : isActive
                          ? "text-slate-200/80"
                          : "text-slate-500",
                    )}
                  >
                    {isCompleted
                      ? "Hoàn tất"
                      : isActive
                        ? "Đang chọn"
                        : "Sắp tới"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base md:text-lg">
              Thiết lập bước {currentStep}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Chỉ hiển thị form của bước hiện tại để tập trung thao tác.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {currentStep === 1 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 md:p-6">
                <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  Bước 1: Chọn chi nhánh
                </p>
                <Select
                  value={branchId || NONE_OPTION}
                  onValueChange={(value) => {
                    const nextBranchId = value === NONE_OPTION ? "" : value;
                    setBranchId(nextBranchId);
                    setZoneId("");
                    setCourtId("");
                    setBookingDate("");
                    setSelectedSlotId("");
                    setActiveStep(2);
                  }}
                  disabled={isLoadingBranches}
                >
                  <SelectTrigger className="h-11 w-full max-w-md rounded-xl border-slate-700 bg-slate-950/60 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-400/25">
                    {" "}
                    <SelectValue
                      placeholder={
                        isLoadingBranches
                          ? "Đang tải chi nhánh..."
                          : "Chọn chi nhánh"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 border-slate-700 bg-slate-950 text-slate-100">
                    <SelectItem value={NONE_OPTION}>Chưa chọn</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-3 text-xs text-slate-400">
                  {branchId
                    ? "Bạn có thể tiếp tục chọn khu ở bước tiếp theo."
                    : "Chọn một chi nhánh để tiếp tục."}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 md:p-6">
                <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  Bước 2: Chọn khu
                </p>
                <Select
                  value={zoneId || NONE_OPTION}
                  onValueChange={(value) => {
                    const nextZoneId = value === NONE_OPTION ? "" : value;
                    setZoneId(nextZoneId);
                    setCourtId("");
                    setBookingDate("");
                    setSelectedSlotId("");
                    setActiveStep(3);
                  }}
                  disabled={isLoadingZones}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-950/60 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-400/25">
                    <SelectValue
                      placeholder={
                        isLoadingZones ? "Đang tải khu..." : "Chọn khu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 border-slate-700 bg-slate-950 text-slate-100">
                    <SelectItem value={NONE_OPTION}>Chưa chọn</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-3 text-xs text-slate-400">
                  {zoneId
                    ? "Tiếp theo: chọn sân trong khu đã chọn."
                    : "Chọn một khu để tiếp tục."}
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 md:p-6">
                <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  Bước 3: Chọn sân trong khu
                </p>
                <Select
                  value={courtId || NONE_OPTION}
                  onValueChange={(value) => {
                    const nextCourtId = value === NONE_OPTION ? "" : value;
                    setCourtId(nextCourtId);
                    setBookingDate("");
                    setSelectedSlotId("");
                    setActiveStep(4);
                  }}
                  disabled={isLoadingCourts}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-950/60 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-400/25">
                    <SelectValue
                      placeholder={
                        isLoadingCourts ? "Đang tải sân..." : "Chọn sân"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 border-slate-700 bg-slate-950 text-slate-100">
                    <SelectItem value={NONE_OPTION}>Chưa chọn</SelectItem>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-3 text-xs text-slate-400">
                  {courtId
                    ? "Tiếp theo: chọn ngày bạn muốn đặt sân."
                    : "Chọn một sân để tiếp tục."}
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 md:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Bước 4: Chọn ngày
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {selectedDateLabel}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 cursor-pointer rounded-xl border-slate-700 bg-slate-950/60 px-3 text-slate-100 hover:bg-slate-900/60"
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl cursor-pointer border-slate-700 bg-slate-950/60 px-3 text-slate-100 hover:bg-slate-900/60"
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-50">
                        {monthLabel}
                      </p>
                      <p className="text-xs text-slate-400">
                        Chọn một ngày trống trong lịch.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl cursor-pointer border-slate-700 bg-slate-950/60 px-3 text-slate-100 hover:bg-slate-900/60"
                      onClick={() => {
                        setCalendarMonth(new Date());
                        setBookingDate("");
                        setSelectedSlotId("");
                        setActiveStep(4);
                      }}
                    >
                      Hôm nay
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="py-1">
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {calendarCells.map((cell) => {
                      if (cell.empty) {
                        return (
                          <div key={cell.key} className="h-11 rounded-xl" />
                        );
                      }

                      const isDisabled = cell.isPast;

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setBookingDate(cell.dateKey);
                            setSelectedSlotId("");
                            setActiveStep(5);
                          }}
                          className={cn(
                            "flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition",
                            cell.isSelected
                              ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                              : cell.isToday
                                ? "border-amber-300/40 bg-amber-500/10 text-amber-100"
                                : "border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-600 hover:bg-slate-900/70",
                            isDisabled &&
                              "cursor-not-allowed border-slate-900 bg-slate-950/20 text-slate-600 hover:border-slate-900 hover:bg-slate-950/20",
                          )}
                        >
                          {cell.dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {bookingDate
                    ? "Tiếp theo: chọn khung giờ khả dụng cho ngày này."
                    : "Chọn ngày để hệ thống tải danh sách khung giờ trống."}
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-100">
                    Bước 5: Chọn khung giờ khả dụng
                  </h3>
                  {isLoadingAvailableSlots && (
                    <span className="inline-flex  items-center gap-1 text-xs text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang tải slot...
                    </span>
                  )}
                </div>

                {isAvailableSlotsError && (
                  <p className="text-xs text-red-400">
                    Tải slot thất bại:{" "}
                    {availableSlotsError instanceof Error
                      ? availableSlotsError.message
                      : "Lỗi không xác định"}
                  </p>
                )}

                {!isLoadingAvailableSlots &&
                  !isAvailableSlotsError &&
                  availableSlots.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Không có slot trống cho ngày đã chọn.
                    </p>
                  )}

                {!isLoadingAvailableSlots &&
                  !isAvailableSlotsError &&
                  availableSlots.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableSlots.map((slot) => {
                        const slotRecord = slot as Record<string, unknown>;
                        const slotId = getSlotId(slotRecord);
                        const selected = selectedSlotId === slotId;
                        return (
                          <button
                            key={slotId || JSON.stringify(slotRecord)}
                            type="button"
                            onClick={() => setSelectedSlotId(slotId)}
                            className={cn(
                              "group rounded-xl cursor-pointer border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/25",
                              selected
                                ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                                : "border-slate-700 bg-slate-950/50 text-slate-200 hover:border-slate-500",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>{getSlotTimeText(slotRecord)}</span>
                              {selected && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                              )}
                            </div>
                            {!selected && (
                              <p className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-400">
                                Nhấn để chọn khung giờ
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base md:text-lg">
              Tóm tắt booking
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Kiểm tra nhanh trước khi xác nhận.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 text-sm text-slate-200">
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-500/10">
                    <MapPin className="h-4 w-4 text-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Chi nhánh
                    </p>
                    <p className="truncate text-sm text-slate-100">
                      {selectedBranch?.name || "--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-amber-300/40 bg-amber-500/10">
                    <TentTree className="h-4 w-4 text-amber-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Khu
                    </p>
                    <p className="truncate text-sm text-slate-100">
                      {selectedZone?.name || "--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/10">
                    <Volleyball className="h-4 w-4 text-emerald-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Sân
                    </p>
                    <p className="truncate text-sm text-slate-100">
                      {selectedCourt?.name || "--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/10">
                    <CalendarDays className="h-4 w-4 text-emerald-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Ngày
                    </p>
                    <p className="truncate text-sm text-slate-100">
                      {bookingDate || "--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-500/10">
                    <Clock3 className="h-4 w-4 text-emerald-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Khung giờ
                    </p>
                    <p className="truncate text-sm text-slate-100">
                      {selectedSlotId ? "Đã chọn" : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {currentStep === 5 && (
              <Button
                type="button"
                disabled={!selectedSlotId || isCreatingBooking}
                onClick={handleBookNow}
                className="h-11 w-full cursor-pointer rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingBooking && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                {isCreatingBooking ? "Đang tạo booking..." : "Xác nhận đặt sân"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(bookingPayment)} onOpenChange={(open) => !open && setBookingPayment(null)}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-950 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-xl">Thanh toán booking</DialogTitle>
            <DialogDescription className="text-slate-400">
              Quét mã QR bên dưới hoặc mở liên kết thanh toán để hoàn tất đơn đặt sân.
            </DialogDescription>
          </DialogHeader>

          {bookingPayment && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-center rounded-3xl border border-slate-800 bg-white p-4">
                <QRCodeSVG value={bookingPayment.qrCode} size={240} level="M" includeMargin />
              </div>

              {/* <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                {isPollingPaymentStatus ? "Đang kiểm tra thanh toán..." : "Đang chờ thanh toán..."}
              </div> */}

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Mã booking</span>
                  <span className="font-medium text-slate-50">{bookingPayment.bookingId}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Mã đơn</span>
                  <span className="font-medium text-slate-50">{bookingPayment.orderCode}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 cursor-pointer flex-1 rounded-xl bg-emerald-600 hover:!bg-emerald-500 text-white"
                >
                  <a href={bookingPayment.paymentUrl} target="_blank" rel="noreferrer">
                    Thanh toán ngay
                  </a>
                </Button>
                <Button
                  type="button"
                  className="h-11 cursor-pointer rounded-xl border-slate-700 bg-slate-950/60 text-slate-100 hover:bg-slate-800/60"
                  onClick={() => setBookingPayment(null)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default BookingPage;
