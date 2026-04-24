"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Loader2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetAllBranchesInfiniteQuery } from "@/app/hooks/branch_hooks/useGetAllBranchesInfiniteQuery";
import { useGetAllCourtsInfiniteQuery } from "@/app/hooks/court_hooks/useGetAllCourtsInfiniteQuery";
import { useCreateCourtPricingMutation } from "@/app/hooks/court_pricing_hooks/useCreateCourtPricingMutation";
import { useGetAllCourtPricingsQuery } from "@/app/hooks/court_pricing_hooks/useGetAllCourtPricingsQuery";
import { useGetAllTimeSlotsQuery } from "@/app/hooks/timeslot_hooks/useGetAllTimeSlotsQuery";
import { useCreateNewTimeSlotMutation } from "@/app/hooks/timeslot_hooks/useCreateNewTimeSlotMutation";
import { useGetAllZonesInfiniteQuery } from "@/app/hooks/zone_hooks/useGetAllZonesInfiniteQuery";
import type {
  CourtPricingItem,
  DayOfWeek,
} from "@/app/services/court-pricing.service";
import type { TimeSlot } from "@/app/services/timeslot.service";
import { formatDate } from "@/lib/utils";

type TimeSlotFormState = {
  startTime: string;
  endTime: string;
};

type CourtPricingFormState = {
  branchId: string;
  zoneId: string;
  courtId: string;
  dayOfWeek: DayOfWeek | "";
  price: string;
};

type CourtPricingFilterState = {
  branchId: string;
  zoneId: string;
  courtId: string;
  dayOfWeek: DayOfWeek | "";
  startTime: string;
  endTime: string;
};

const defaultForm: TimeSlotFormState = {
  startTime: "",
  endTime: "",
};

const defaultCourtPricingForm: CourtPricingFormState = {
  branchId: "",
  zoneId: "",
  courtId: "",
  dayOfWeek: "",
  price: "",
};

const defaultCourtPricingFilters: CourtPricingFilterState = {
  branchId: "",
  zoneId: "",
  courtId: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
};

const NONE_OPTION = "__NONE__";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

const DAY_OF_WEEK_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MONDAY", label: "Thứ 2" },
  { value: "TUESDAY", label: "Thứ 3" },
  { value: "WEDNESDAY", label: "Thứ 4" },
  { value: "THURSDAY", label: "Thứ 5" },
  { value: "FRIDAY", label: "Thứ 6" },
  { value: "SATURDAY", label: "Thứ 7" },
  { value: "SUNDAY", label: "Chủ nhật" },
];

const TimeSlotsManagementPage = () => { 
  const [page, setPage] = useState(0);
  const size = 5;

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [form, setForm] = useState<TimeSlotFormState>(defaultForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [openPricingDialog, setOpenPricingDialog] = useState(false);
  const [pricingForm, setPricingForm] = useState<CourtPricingFormState>(
    defaultCourtPricingForm,
  );
  const [pricingFiltersDraft, setPricingFiltersDraft] =
    useState<CourtPricingFilterState>(defaultCourtPricingFilters);
  const [pricingFiltersApplied, setPricingFiltersApplied] =
    useState<CourtPricingFilterState>(defaultCourtPricingFilters);
  const [pricingErrors, setPricingErrors] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [pricingPage, setPricingPage] = useState(0);
  const pricingSize = 10;
  const [isPricingBranchSelectOpen, setIsPricingBranchSelectOpen] =
    useState(false);
  const [isPricingZoneSelectOpen, setIsPricingZoneSelectOpen] = useState(false);
  const [isPricingCourtSelectOpen, setIsPricingCourtSelectOpen] = useState(false);
  const [isTableBranchSelectOpen, setIsTableBranchSelectOpen] = useState(false);
  const [isTableZoneSelectOpen, setIsTableZoneSelectOpen] = useState(false);
  const [isTableCourtSelectOpen, setIsTableCourtSelectOpen] = useState(false);
  const [hasRequestedPricingBranches, setHasRequestedPricingBranches] =
    useState(false);
  const [hasRequestedPricingZones, setHasRequestedPricingZones] =
    useState(false);
  const [hasRequestedPricingCourts, setHasRequestedPricingCourts] =
    useState(false);
  const [hasRequestedTableBranches, setHasRequestedTableBranches] =
    useState(false);
  const [hasRequestedTableZones, setHasRequestedTableZones] = useState(false);
  const [hasRequestedTableCourts, setHasRequestedTableCourts] =
    useState(false);

  const handlePricingBranchDropdownOpenChange = (isOpen: boolean) => {
    setIsPricingBranchSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedPricingBranches(true);
    }
  };

  const handlePricingZoneDropdownOpenChange = (isOpen: boolean) => {
    setIsPricingZoneSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedPricingZones(true);
    }
  };

  const handlePricingCourtDropdownOpenChange = (isOpen: boolean) => {
    setIsPricingCourtSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedPricingCourts(true);
    }
  };

  const handleTableBranchDropdownOpenChange = (isOpen: boolean) => {
    setIsTableBranchSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedTableBranches(true);
    }
  };

  const handleTableZoneDropdownOpenChange = (isOpen: boolean) => {
    setIsTableZoneSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedTableZones(true);
    }
  };

  const handleTableCourtDropdownOpenChange = (isOpen: boolean) => {
    setIsTableCourtSelectOpen(isOpen);
    if (isOpen) {
      setHasRequestedTableCourts(true);
    }
  };

  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    hasNextPage: hasNextBranchPage,
    isFetchingNextPage: isFetchingNextBranchPage,
    fetchNextPage: fetchNextBranchPage,
  } =
    useGetAllBranchesInfiniteQuery({
      size: 3,
      name: "",
      address: "",
      phone: "",
      enabled: hasRequestedPricingBranches,
    });
  const branchItems = useMemo(
    () => branchesData?.pages.flatMap((branchPage) => branchPage.items) ?? [],
    [branchesData],
  );
  const branchNameById = useMemo(
    () => new Map(branchItems.map((branch) => [branch.id, branch.name])),
    [branchItems],
  );

  const {
    data: pricingZonesData,
    isLoading: isLoadingZones,
    hasNextPage: hasNextPricingZonePage,
    isFetchingNextPage: isFetchingNextPricingZonePage,
    fetchNextPage: fetchNextPricingZonePage,
  } = useGetAllZonesInfiniteQuery({
    size: 3,
    name: "",
    branchId: pricingForm.branchId || undefined,
    enabled: hasRequestedPricingZones && Boolean(pricingForm.branchId),
  });
  const zoneItems = useMemo(
    () => pricingZonesData?.pages.flatMap((zonePage) => zonePage.items) ?? [],
    [pricingZonesData],
  );

  const {
    data: pricingCourtsData,
    isLoading: isLoadingCourts,
    hasNextPage: hasNextPricingCourtPage,
    isFetchingNextPage: isFetchingNextPricingCourtPage,
    fetchNextPage: fetchNextPricingCourtPage,
  } = useGetAllCourtsInfiniteQuery({
    size: 3,
    branchId: pricingForm.branchId,
    zoneId: pricingForm.zoneId || undefined,
    enabled: hasRequestedPricingCourts && Boolean(pricingForm.branchId),
  });
  const courtItems = useMemo(
    () => pricingCourtsData?.pages.flatMap((courtPage) => courtPage.items) ?? [],
    [pricingCourtsData],
  );

  const {
    data: tableBranchesData,
    isLoading: isLoadingTableBranches,
    hasNextPage: hasNextTableBranchPage,
    isFetchingNextPage: isFetchingNextTableBranchPage,
    fetchNextPage: fetchNextTableBranchPage,
  } = useGetAllBranchesInfiniteQuery({
    size: 3,
    name: "",
    address: "",
    phone: "",
    enabled: hasRequestedTableBranches,
  });
  const tableBranchItems = useMemo(
    () => tableBranchesData?.pages.flatMap((branchPage) => branchPage.items) ?? [],
    [tableBranchesData],
  );

  const {
    data: tableZonesData,
    isLoading: isLoadingTableZones,
    hasNextPage: hasNextTableZonePage,
    isFetchingNextPage: isFetchingNextTableZonePage,
    fetchNextPage: fetchNextTableZonePage,
  } = useGetAllZonesInfiniteQuery({
    size: 3,
    name: "",
    branchId: pricingFiltersDraft.branchId || undefined,
    enabled: hasRequestedTableZones && Boolean(pricingFiltersDraft.branchId),
  });
  const tableZoneItems = useMemo(
    () => tableZonesData?.pages.flatMap((zonePage) => zonePage.items) ?? [],
    [tableZonesData],
  );

  const {
    data: tableCourtsData,
    isLoading: isLoadingTableCourts,
    hasNextPage: hasNextTableCourtPage,
    isFetchingNextPage: isFetchingNextTableCourtPage,
    fetchNextPage: fetchNextTableCourtPage,
  } = useGetAllCourtsInfiniteQuery({
    size: 3,
    branchId: pricingFiltersDraft.branchId,
    zoneId: pricingFiltersDraft.zoneId || undefined,
    enabled: hasRequestedTableCourts && Boolean(pricingFiltersDraft.branchId),
  });
  const tableCourtItems = useMemo(
    () => tableCourtsData?.pages.flatMap((courtPage) => courtPage.items) ?? [],
    [tableCourtsData],
  );

  useSelectInfiniteScroll(
    isPricingBranchSelectOpen,
    "pricing-branch-select-content",
    hasNextBranchPage,
    isFetchingNextBranchPage,
    fetchNextBranchPage,
    branchItems.length,
  );
  useSelectInfiniteScroll(
    isPricingZoneSelectOpen,
    "pricing-zone-select-content",
    hasNextPricingZonePage,
    isFetchingNextPricingZonePage,
    fetchNextPricingZonePage,
    zoneItems.length,
  );
  useSelectInfiniteScroll(
    isPricingCourtSelectOpen,
    "pricing-court-select-content",
    hasNextPricingCourtPage,
    isFetchingNextPricingCourtPage,
    fetchNextPricingCourtPage,
    courtItems.length,
  );
  useSelectInfiniteScroll(
    isTableBranchSelectOpen,
    "table-branch-select-content",
    hasNextTableBranchPage,
    isFetchingNextTableBranchPage,
    fetchNextTableBranchPage,
    tableBranchItems.length,
  );
  useSelectInfiniteScroll(
    isTableZoneSelectOpen,
    "table-zone-select-content",
    hasNextTableZonePage,
    isFetchingNextTableZonePage,
    fetchNextTableZonePage,
    tableZoneItems.length,
  );
  useSelectInfiniteScroll(
    isTableCourtSelectOpen,
    "table-court-select-content",
    hasNextTableCourtPage,
    isFetchingNextTableCourtPage,
    fetchNextTableCourtPage,
    tableCourtItems.length,
  );

  const {
    data: courtPricingsData,
    isLoading: isLoadingCourtPricings,
    isFetching: isFetchingCourtPricings,
    isError: isCourtPricingError,
    error: courtPricingError,
  } = useGetAllCourtPricingsQuery(
    {
      page: pricingPage,
      size: pricingSize,
      branchId: pricingFiltersApplied.branchId || undefined,
      zoneId: pricingFiltersApplied.zoneId || undefined,
      courtId: pricingFiltersApplied.courtId || undefined,
      dayOfWeek: (pricingFiltersApplied.dayOfWeek as DayOfWeek) || undefined,
      startTime: normalizeTimeForApi(pricingFiltersApplied.startTime),
      endTime: normalizeTimeForApi(pricingFiltersApplied.endTime),
    },
    true,
  );
  const courtPricings: CourtPricingItem[] = courtPricingsData?.items ?? [];
  const pricingPagination = useMemo(
    () => ({
      page: courtPricingsData?.page ?? pricingPage,
      totalPages: Math.max(1, courtPricingsData?.totalPages ?? 1),
      totalElements: courtPricingsData?.totalElements ?? courtPricings.length,
    }),
    [courtPricingsData, pricingPage, courtPricings.length],
  );

  const {
    data: timeSlotsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllTimeSlotsQuery({ page, size });
  const { mutateAsync: createTimeSlot, isPending: isCreatingTimeSlot } =
    useCreateNewTimeSlotMutation();
  const { mutateAsync: createCourtPricing, isPending: isCreatingCourtPricing } =
    useCreateCourtPricingMutation();

  const timeSlots: TimeSlot[] = timeSlotsData?.items ?? [];
  const pagination = useMemo(
    () => ({
      page: timeSlotsData?.page ?? page,
      totalPages: Math.max(1, timeSlotsData?.totalPages ?? 1),
      totalElements: timeSlotsData?.totalElements ?? timeSlots.length,
    }),
    [timeSlotsData, page, timeSlots.length],
  );

  const canGoPrevious = pagination.page > 0;
  const canGoNext = pagination.page < pagination.totalPages - 1;

  const openCreateDialog = () => {
    setForm(defaultForm);
    setFormErrors([]);
    setOpenFormDialog(true);
  };

  const openCreatePricingDialog = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setPricingPage(0);
    setPricingForm(defaultCourtPricingForm);
    setPricingErrors([]);
    setOpenPricingDialog(true);
  };

  const handleCreateTimeSlot = async () => {
    const startTime = form.startTime.trim();
    const endTime = form.endTime.trim();

    const errors: string[] = [];
    if (!startTime) errors.push("Giờ bắt đầu là bắt buộc.");
    if (!endTime) errors.push("Giờ kết thúc là bắt buộc.");
    if (startTime && endTime && startTime >= endTime) {
      errors.push("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    try {
      await createTimeSlot({ startTime, endTime });
      setOpenFormDialog(false);
      setForm(defaultForm);
      setPage(0);
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleCreateCourtPricing = async () => {
    const branchId = pricingForm.branchId.trim();
    const courtId = pricingForm.courtId.trim();
    const dayOfWeek = pricingForm.dayOfWeek;
    const price = Number(pricingForm.price);

    const errors: string[] = [];
    if (!selectedTimeSlot) errors.push("Khung giờ không hợp lệ.");
    if (!branchId) errors.push("Chi nhánh là bắt buộc.");
    if (!courtId) errors.push("Sân là bắt buộc.");
    if (!dayOfWeek) errors.push("Ngày trong tuần là bắt buộc.");
    if (!Number.isFinite(price) || price < 0) {
      errors.push("Giá phải là số lớn hơn hoặc bằng 0.");
    }

    if (errors.length > 0) {
      setPricingErrors(errors);
      return;
    }

    setPricingErrors([]);

    try {
      await createCourtPricing({
        courtId,
        timeSlotId: selectedTimeSlot!.id,
        dayOfWeek: dayOfWeek as DayOfWeek,
        price,
      });
      setOpenPricingDialog(false);
      setPricingForm(defaultCourtPricingForm);
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleApplyPricingFilters = () => {
    setPricingPage(0);
    setPricingFiltersApplied(pricingFiltersDraft);
  };

  const handleResetPricingFilters = () => {
    setPricingPage(0);
    setPricingFiltersDraft(defaultCourtPricingFilters);
    setPricingFiltersApplied(defaultCourtPricingFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý khung giờ</h1>
          <p className="text-xs text-slate-400">
            Quản trị danh sách thời gian hoạt động để tạo lịch đặt sân.
          </p>
        </div>

        <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={openCreateDialog}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm khung giờ
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Thêm khung giờ mới</DialogTitle>
              <DialogDescription className="text-slate-400">
                Nhập giờ bắt đầu và kết thúc theo định dạng 24h.
              </DialogDescription>
            </DialogHeader>

            {formErrors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Giờ bắt đầu *</label>
                <Select
                  value={form.startTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn giờ bắt đầu" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn giờ bắt đầu</SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Giờ kết thúc *</label>
                <Select
                  value={form.endTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      endTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn giờ kết thúc" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn giờ kết thúc</SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="border-slate-800 bg-slate-950">
              <Button
                className="cursor-pointer border-slate-700 hover:bg-slate-900"
                onClick={() => setOpenFormDialog(false)}
                disabled={isCreatingTimeSlot}
              >
                Hủy bỏ
              </Button>
              <Button
                className="cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleCreateTimeSlot}
                disabled={isCreatingTimeSlot}
              >
                {isCreatingTimeSlot && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Tạo khung giờ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openPricingDialog} onOpenChange={setOpenPricingDialog}>
          <DialogContent
            className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Thiết lập giá theo khung giờ</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedTimeSlot
                  ? `Khung giờ: ${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`
                  : "Chọn thông tin để tạo giá sân theo khung giờ."}
              </DialogDescription>
            </DialogHeader>

            {pricingErrors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {pricingErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Chi nhánh *</label>
                <Select
                  value={pricingForm.branchId || NONE_OPTION}
                  onOpenChange={handlePricingBranchDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingForm(() => ({
                      ...defaultCourtPricingForm,
                      branchId: value === NONE_OPTION ? "" : value,
                    }))
                  }
                  disabled={isLoadingBranches}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent
                    className="pricing-branch-select-content max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn chi nhánh</SelectItem>
                    {pricingForm.branchId &&
                      !branchItems.some(
                        (branch) => branch.id === pricingForm.branchId,
                      ) && (
                        <SelectItem value={pricingForm.branchId}>
                          {branchNameById.get(pricingForm.branchId) ||
                            "Chi nhánh đã chọn"}
                        </SelectItem>
                      )}
                    {branchItems.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextBranchPage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm chi nhánh...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Khu vực</label>
                <Select
                  value={pricingForm.zoneId || NONE_OPTION}
                  onOpenChange={handlePricingZoneDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingForm((prev) => ({
                      ...prev,
                      zoneId: value === NONE_OPTION ? "" : value,
                      courtId: "",
                    }))
                  }
                  disabled={!pricingForm.branchId || isLoadingZones}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue
                      placeholder={
                        pricingForm.branchId
                          ? "Chọn khu vực (tuỳ chọn)"
                          : "Chọn chi nhánh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="pricing-zone-select-content max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả khu vực</SelectItem>
                    {zoneItems.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextPricingZonePage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm khu vực...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Sân *</label>
                <Select
                  value={pricingForm.courtId || NONE_OPTION}
                  onOpenChange={handlePricingCourtDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingForm((prev) => ({
                      ...prev,
                      courtId: value === NONE_OPTION ? "" : value,
                    }))
                  }
                  disabled={!pricingForm.branchId || isLoadingCourts}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue
                      placeholder={
                        pricingForm.branchId
                          ? pricingForm.zoneId
                            ? "Chọn sân theo khu vực"
                            : "Chọn sân"
                          : "Chọn chi nhánh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="pricing-court-select-content max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn sân</SelectItem>
                    {courtItems.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextPricingCourtPage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm sân...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Ngày áp dụng *</label>
                <Select
                  value={pricingForm.dayOfWeek || NONE_OPTION}
                  onValueChange={(value) =>
                    setPricingForm((prev) => ({
                      ...prev,
                      dayOfWeek: value === NONE_OPTION ? "" : (value as DayOfWeek),
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn ngày" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn ngày</SelectItem>
                    {DAY_OF_WEEK_OPTIONS.map((dayOption) => (
                      <SelectItem className="flex justify-center" key={dayOption.value} value={dayOption.value}>
                        {dayOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Giá (VND) *</label>
                <Input
                  type="number"
                  min={0}
                  value={pricingForm.price}
                  onChange={(event) =>
                    setPricingForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 120000"
                  className="h-9 border-slate-700 bg-slate-900/70"
                />
              </div>
            </div>

            <DialogFooter className="border-slate-800 bg-slate-950">
              <Button
                className="cursor-pointer border-slate-700 hover:bg-slate-900"
                onClick={() => setOpenPricingDialog(false)}
                disabled={isCreatingCourtPricing}
              >
                Hủy bỏ
              </Button>
              <Button
                className="cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleCreateCourtPricing}
                disabled={isCreatingCourtPricing}
              >
                {isCreatingCourtPricing && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Lưu giá
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Clock3 className="h-4 w-4 text-emerald-300" />
            Danh sách khung giờ
            {isFetching && (
              <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                Đang tải...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Trang {pagination.page + 1}/{pagination.totalPages} - Tổng: {" "}
            {pagination.totalElements}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Đang tải dữ liệu khung giờ...
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-xs text-destructive">
              Tải dữ liệu thất bại: {" "}
              {error instanceof Error ? error.message : "Lỗi không xác định"}
            </div>
          )}

          {!isLoading && !isError && timeSlots.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] text-slate-400">
                    <th className="px-2 py-2.5 font-medium">ID</th>
                    <th className="px-2 py-2.5 font-medium">Giờ bắt đầu</th>
                    <th className="px-2 py-2.5 font-medium">Giờ kết thúc</th>
                    <th className="px-2 py-2.5 font-medium">Ngày tạo</th>
                    <th className="px-2 py-2.5 font-medium">Ngày cập nhật</th>
                    <th className="px-2 py-2.5 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr
                      key={timeSlot.id}
                      className="border-b border-slate-900/90 align-top"
                    >
                      <td className="px-2 py-3 font-medium text-slate-100">
                        {timeSlot.id}
                      </td>
                      <td className="px-2 py-3 text-slate-300">{timeSlot.startTime}</td>
                      <td className="px-2 py-3 text-slate-300">{timeSlot.endTime}</td>
                      <td className="px-2 py-3 text-slate-300">
                        {formatDate(timeSlot.createdAt)}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {formatDate(timeSlot.updatedAt)}
                      </td>
                      <td className="px-2 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 cursor-pointer border-emerald-500/60 bg-emerald-500/10 px-2 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                          onClick={() => openCreatePricingDialog(timeSlot)}
                        >
                          Thiết lập giá
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && timeSlots.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Chưa có khung giờ nào trong hệ thống.
            </div>
          )}

          {!isError && pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-3">
              <p className="text-[11px] text-slate-400">
                Trang hiện tại: {pagination.page + 1} / {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 cursor-pointer"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={!canGoPrevious || isFetching}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400"
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages - 1, prev + 1))
                  }
                  disabled={!canGoNext || isFetching}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="cursor-pointer border-slate-700"
              onClick={() => setPage(0)}
              disabled={isFetching || pagination.page === 0}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Về trang đầu
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            Danh sách giá theo khung giờ
            {isFetchingCourtPricings && (
              <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                Đang tải...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Dùng bộ lọc để tìm mức giá theo chi nhánh, khu vực, sân, ngày và khoảng giờ.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="mb-4 rounded-xl border border-slate-800/70 bg-slate-900/30 p-3">
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Chi nhánh</label>
                <Select
                  value={pricingFiltersDraft.branchId || NONE_OPTION}
                  onOpenChange={handleTableBranchDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      branchId: value === NONE_OPTION ? "" : value,
                      zoneId: "",
                      courtId: "",
                    }))
                  }
                  disabled={isLoadingTableBranches}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Tất cả chi nhánh" />
                  </SelectTrigger>
                  <SelectContent
                    className="table-branch-select-content max-h-24 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả chi nhánh</SelectItem>
                    {tableBranchItems.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextTableBranchPage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm chi nhánh...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Khu vực</label>
                <Select
                  value={pricingFiltersDraft.zoneId || NONE_OPTION}
                  onOpenChange={handleTableZoneDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      zoneId: value === NONE_OPTION ? "" : value,
                      courtId: "",
                    }))
                  }
                  disabled={!pricingFiltersDraft.branchId || isLoadingTableZones}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue
                      placeholder={
                        pricingFiltersDraft.branchId
                          ? "Tất cả khu vực"
                          : "Chọn chi nhánh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="table-zone-select-content max-h-24 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả khu vực</SelectItem>
                    {tableZoneItems.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextTableZonePage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm khu vực...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Sân</label>
                <Select
                  value={pricingFiltersDraft.courtId || NONE_OPTION}
                  onOpenChange={handleTableCourtDropdownOpenChange}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      courtId: value === NONE_OPTION ? "" : value,
                    }))
                  }
                  disabled={!pricingFiltersDraft.branchId || isLoadingTableCourts}
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue
                      placeholder={
                        pricingFiltersDraft.branchId
                          ? "Tất cả sân"
                          : "Chọn chi nhánh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="table-court-select-content max-h-24 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả sân</SelectItem>
                    {tableCourtItems.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextTableCourtPage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm sân...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Ngày trong tuần</label>
                <Select
                  value={pricingFiltersDraft.dayOfWeek || NONE_OPTION}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      dayOfWeek: value === NONE_OPTION ? "" : (value as DayOfWeek),
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Tất cả ngày" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả ngày</SelectItem>
                    {DAY_OF_WEEK_OPTIONS.map((dayOption) => (
                      <SelectItem key={dayOption.value} value={dayOption.value}>
                        {dayOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Giờ bắt đầu</label>
                <Select
                  value={pricingFiltersDraft.startTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      startTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Tất cả giờ bắt đầu" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả giờ bắt đầu</SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Giờ kết thúc</label>
                <Select
                  value={pricingFiltersDraft.endTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setPricingFiltersDraft((prev) => ({
                      ...prev,
                      endTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                    <SelectValue placeholder="Tất cả giờ kết thúc" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-40 border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Tất cả giờ kết thúc</SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-8 cursor-pointer border-slate-700 px-3 text-[11px]"
                onClick={handleResetPricingFilters}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Đặt lại
              </Button>
              <Button
                className="h-8 cursor-pointer bg-emerald-500 px-3 text-[11px] text-slate-950 hover:bg-emerald-400"
                onClick={handleApplyPricingFilters}
              >
                Áp dụng
              </Button>
            </div>
          </div>

          {isLoadingCourtPricings && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Đang tải dữ liệu giá...
            </div>
          )}

          {isCourtPricingError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-xs text-destructive">
              Tải dữ liệu giá thất bại: {" "}
              {courtPricingError instanceof Error
                ? courtPricingError.message
                : "Lỗi không xác định"}
            </div>
          )}

          {!isLoadingCourtPricings && !isCourtPricingError && courtPricings.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Chưa có dữ liệu giá cho bộ lọc hiện tại.
            </div>
          )}

          {!isLoadingCourtPricings && !isCourtPricingError && courtPricings.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] text-slate-400">
                      <th className="px-2 py-2.5 font-medium">Sân</th>
                      <th className="px-2 py-2.5 font-medium">Khu vực</th>
                      <th className="px-2 py-2.5 font-medium">Chi nhánh</th>
                      <th className="px-2 py-2.5 font-medium">Ngày</th>
                      <th className="px-2 py-2.5 font-medium">Khung giờ</th>
                      <th className="px-2 py-2.5 font-medium">Giá (VND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courtPricings.map((pricing) => (
                      <tr key={pricing.id} className="border-b border-slate-900/90">
                        <td className="px-2 py-3">{pricing.courtName}</td>
                        <td className="px-2 py-3">{pricing.zoneName}</td>
                        <td className="px-2 py-3">{pricing.branchName}</td>
                        <td className="px-2 py-3">
                          {DAY_OF_WEEK_OPTIONS.find(
                            (day) => day.value === pricing.dayOfWeek,
                          )?.label || pricing.dayOfWeek}
                        </td>
                        <td className="px-2 py-3">
                          {pricing.startTime} - {pricing.endTime}
                        </td>
                        <td className="px-2 py-3">
                          {pricing.price.toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pricingPagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-800/70 pt-3 text-[11px] text-slate-400">
                  <span>
                    Trang {pricingPagination.page + 1}/{pricingPagination.totalPages} - Tổng {" "}
                    {pricingPagination.totalElements}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-slate-700"
                      onClick={() => setPricingPage((prev) => Math.max(0, prev - 1))}
                      disabled={pricingPagination.page === 0 || isFetchingCourtPricings}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      onClick={() =>
                        setPricingPage((prev) =>
                          Math.min(pricingPagination.totalPages - 1, prev + 1),
                        )
                      }
                      disabled={
                        pricingPagination.page >= pricingPagination.totalPages - 1 ||
                        isFetchingCourtPricings
                      }
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const normalizeTimeForApi = (value?: string) => {
  if (!value) return undefined;
  return value.length === 5 ? `${value}:00` : value;
};

const useSelectInfiniteScroll = (
  isOpen: boolean,
  contentClassName: string,
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  fetchNextPage: () => Promise<unknown>,
  dependencySize = 0,
) => {
  useEffect(() => {
    if (!isOpen) return;

    const viewport = document.querySelector(
      `.${contentClassName} [data-radix-select-viewport]`,
    ) as HTMLElement | null;

    if (!viewport) return;

    const loadMoreIfNeededByScroll = () => {
      const nearBottom =
        viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 16;

      if (nearBottom && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    };

    viewport.addEventListener("scroll", loadMoreIfNeededByScroll, {
      passive: true,
    });

    return () => {
      viewport.removeEventListener("scroll", loadMoreIfNeededByScroll);
    };
  }, [
    isOpen,
    contentClassName,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    dependencySize,
  ]);
};

export default TimeSlotsManagementPage;
