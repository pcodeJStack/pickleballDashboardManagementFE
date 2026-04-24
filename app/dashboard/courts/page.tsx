"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Eye,
  FileText,
  Filter,
  ImagePlus,
  Loader2,
  MapPinned,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useGetAllBranchesInfiniteQuery } from "@/app/hooks/branch_hooks/useGetAllBranchesInfiniteQuery";
import { useCreateNewCourtMutation } from "@/app/hooks/court_hooks/useCreateNewCourtMutation";
import { useDeleteCourtMutation } from "@/app/hooks/court_hooks/useDeleteCourtMutation";
import { useGetAllCourtsQuery } from "@/app/hooks/court_hooks/useGetAllCourtsQuery";
import { useGetAllZonesQuery } from "@/app/hooks/zone_hooks/useGetZonesQuery";
import { useGetZoneByIdQuery } from "@/app/hooks/zone_hooks/useGetZoneByIdQuery";
import { useUpdateCourtMutation } from "@/app/hooks/court_hooks/useUpdateCourtMutation";
import { useUploadImage } from "@/app/hooks/upload_hooks/useUploadImage";
import type { Court } from "@/app/services/court.service";
import type { Zone } from "@/app/services/zone.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { formatDate } from "@/lib/utils";

type CourtFilterDraft = {
  branchId: string;
  zoneId: string;
  name: string;
  courtType: string;
  surfaceType: string;
  courtStatus: string;
  minPrice: string;
  maxPrice: string;
};

const defaultDraftFilter: CourtFilterDraft = {
  branchId: "",
  zoneId: "",
  name: "",
  courtType: "",
  surfaceType: "",
  courtStatus: "",
  minPrice: "",
  maxPrice: "",
};

const NONE_OPTION = "__NONE__";
const ALL_OPTION = "__ALL__";

type CourtFormState = {
  branchId: string;
  zoneId: string;
  name: string;
  description: string;
  courtNumber: string;
  courtType: string;
  surfaceType: string;
  courtStatus: string;
  imageUrl: string;
  location: string;
  maxPlayers: string;
};

const defaultCourtForm: CourtFormState = {
  branchId: "",
  zoneId: "",
  name: "",
  description: "",
  courtNumber: "",
  courtType: "",
  surfaceType: "",
  courtStatus: "ACTIVE",
  imageUrl: "",
  location: "",
  maxPlayers: "4",
};

const MAX_PLAYERS_OPTIONS = Array.from({ length: 20 }, (_, index) =>
  String(index + 1),
);

const CourtsManagementPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draftFilter, setDraftFilter] =
    useState<CourtFilterDraft>(defaultDraftFilter);
  const [appliedFilter, setAppliedFilter] =
    useState<CourtFilterDraft>(defaultDraftFilter);
  const [isBranchSelectOpen, setIsBranchSelectOpen] = useState(false);
  const [isFilterZoneSelectOpen, setIsFilterZoneSelectOpen] = useState(false);
  const [isFormZoneSelectOpen, setIsFormZoneSelectOpen] = useState(false);
  const [filterZonePage, setFilterZonePage] = useState(0);
  const [formZonePage, setFormZonePage] = useState(0);
  const [filterZoneItems, setFilterZoneItems] = useState<Zone[]>([]);
  const [formZoneItems, setFormZoneItems] = useState<Zone[]>([]);
  const [page, setPage] = useState(0);
  const size = 10;

  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    isError: isBranchesError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetAllBranchesInfiniteQuery({
    size: 5,
    name: "",
    address: "",
    phone: "",
  });

  const branchItems = useMemo(
    () => branchesData?.pages.flatMap((page) => page.items) ?? [],
    [branchesData],
  );
  const branchNameById = useMemo(
    () => new Map(branchItems.map((branch) => [branch.id, branch.name])),
    [branchItems],
  );

  useEffect(() => {
    if (!isBranchSelectOpen) return;

    const viewport = document.querySelector(
      ".branch-select-content [data-radix-select-viewport]",
    ) as HTMLElement | null;

    if (!viewport) return;

    const loadMoreIfNeededByWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;

      const projectedBottom =
        viewport.scrollTop + viewport.clientHeight + Math.abs(event.deltaY);
      const nearBottom = projectedBottom >= viewport.scrollHeight - 16;

      if (nearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    viewport.addEventListener("wheel", loadMoreIfNeededByWheel, {
      passive: true,
    });
    return () => {
      viewport.removeEventListener("wheel", loadMoreIfNeededByWheel);
    };
  }, [
    isBranchSelectOpen,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    branchItems.length,
  ]);

  const normalizedFilter = useMemo(() => {
    const parsePrice = (value: string) => {
      if (value.trim() === "") return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
    };

    return {
      page,
      size,
      branchId: appliedFilter.branchId,
      zoneId: appliedFilter.zoneId || undefined,
      name: appliedFilter.name.trim() || undefined,
      courtType: appliedFilter.courtType || undefined,
      surfaceType: appliedFilter.surfaceType || undefined,
      courtStatus: appliedFilter.courtStatus || undefined,
      minPrice: parsePrice(appliedFilter.minPrice),
      maxPrice: parsePrice(appliedFilter.maxPrice),
    };
  }, [appliedFilter, page]);

  const {
    data: courtsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllCourtsQuery(normalizedFilter);
  const { mutateAsync: createCourt, isPending: isCreatingCourt } =
    useCreateNewCourtMutation();
  const { mutateAsync: updateCourt, isPending: isUpdatingCourt } =
    useUpdateCourtMutation();
  const { mutateAsync: deleteCourt, isPending: isDeletingCourt } =
    useDeleteCourtMutation();
  const { upload, isUploading } = useUploadImage();

  const courts: Court[] = courtsData?.items ?? [];
  const pagination = {
    page: courtsData?.page ?? page,
    totalPages: Math.max(1, courtsData?.totalPages ?? 1),
    totalElements: courtsData?.totalElements ?? courts.length,
  };

  const canGoPrevious = pagination.page > 0;
  const canGoNext = pagination.page < pagination.totalPages - 1;
  const selectTriggerClassName =
    "h-10 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200 focus-visible:border-emerald-400/60 focus-visible:ring-emerald-500/20";
  const selectContentClassName =
    "border-slate-300 bg-white text-slate-900 [&_[data-slot=select-item][data-highlighted]]:bg-slate-100 [&_[data-slot=select-item][data-highlighted]]:text-slate-900 [&_[data-slot=select-item][data-state=checked]]:bg-slate-100 [&_[data-slot=select-item][data-state=checked]]:text-slate-900 [&_[data-slot=select-scroll-up-button]]:bg-white [&_[data-slot=select-scroll-down-button]]:bg-white";
  const selectItemClassName =
    "cursor-pointer text-slate-900 hover:bg-slate-100 hover:text-slate-900 hover:[&_*]:text-slate-900 focus:bg-slate-100 focus:text-slate-900 focus:[&_*]:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 data-[highlighted]:[&_*]:text-slate-900 data-[state=checked]:bg-slate-100 data-[state=checked]:text-slate-900 data-[state=checked]:[&_*]:text-slate-900";
  const [form, setForm] = useState<CourtFormState>(defaultCourtForm);
  const [formErrorMessages, setFormErrorMessages] = useState<string[]>([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [selectedCourtDetail, setSelectedCourtDetail] = useState<Court | null>(
    null,
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [baseImageUrl, setBaseImageUrl] = useState("");
  const isSubmitting = isCreatingCourt || isUpdatingCourt || isUploading;
  const {
    data: zonesData,
    isLoading: isLoadingFilterZones,
    isFetching: isFetchingFilterZones,
  } = useGetAllZonesQuery({
    page: filterZonePage,
    size: 5,
    branchId: draftFilter.branchId.trim() || undefined,
  });
  const {
    data: formZonesData,
    isLoading: isLoadingFormZones,
    isFetching: isFetchingFormZones,
  } =
    useGetAllZonesQuery({
      page: formZonePage,
      size: 5,
      branchId: form.branchId.trim() || undefined,
    });
  const { data: selectedFormZone } = useGetZoneByIdQuery(
    editingCourtId ? form.zoneId : undefined,
  );
  const hasNextFilterZonePage =
    (zonesData?.page ?? 0) < (zonesData?.totalPages ?? 1) - 1;
  const hasNextFormZonePage =
    (formZonesData?.page ?? 0) < (formZonesData?.totalPages ?? 1) - 1;

  useEffect(() => {
    setFilterZonePage(0);
    setFilterZoneItems([]);
  }, [draftFilter.branchId]);

  useEffect(() => {
    setFormZonePage(0);
    setFormZoneItems([]);
  }, [form.branchId]);

  useEffect(() => {
    if (!zonesData?.items?.length) return;

    setFilterZoneItems((prev) => {
      const deduplicated = new Map(prev.map((zone) => [zone.id, zone]));
      zonesData.items.forEach((zone) => deduplicated.set(zone.id, zone));
      return Array.from(deduplicated.values());
    });
  }, [zonesData]);

  useEffect(() => {
    if (!formZonesData?.items?.length) return;

    setFormZoneItems((prev) => {
      const deduplicated = new Map(prev.map((zone) => [zone.id, zone]));
      formZonesData.items.forEach((zone) => deduplicated.set(zone.id, zone));
      return Array.from(deduplicated.values());
    });
  }, [formZonesData]);

  useEffect(() => {
    if (!selectedFormZone) return;

    setFormZoneItems((prev) => {
      const deduplicated = new Map(prev.map((zone) => [zone.id, zone]));
      deduplicated.set(selectedFormZone.id, selectedFormZone);
      return Array.from(deduplicated.values());
    });
  }, [selectedFormZone]);

  useEffect(() => {
    if (!isFilterZoneSelectOpen || !draftFilter.branchId) return;

    const viewport = document.querySelector(
      ".filter-zone-select-content [data-radix-select-viewport]",
    ) as HTMLElement | null;

    if (!viewport) return;

    const loadMoreIfNeededByWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;

      const projectedBottom =
        viewport.scrollTop + viewport.clientHeight + Math.abs(event.deltaY);
      const nearBottom = projectedBottom >= viewport.scrollHeight - 16;

      if (nearBottom && hasNextFilterZonePage && !isFetchingFilterZones) {
        setFilterZonePage((prev) => prev + 1);
      }
    };

    viewport.addEventListener("wheel", loadMoreIfNeededByWheel, {
      passive: true,
    });
    return () => {
      viewport.removeEventListener("wheel", loadMoreIfNeededByWheel);
    };
  }, [
    isFilterZoneSelectOpen,
    draftFilter.branchId,
    hasNextFilterZonePage,
    isFetchingFilterZones,
    filterZoneItems.length,
  ]);

  useEffect(() => {
    if (!isFormZoneSelectOpen || !form.branchId) return;

    const viewport = document.querySelector(
      ".form-zone-select-content [data-radix-select-viewport]",
    ) as HTMLElement | null;

    if (!viewport) return;

    const loadMoreIfNeededByWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;

      const projectedBottom =
        viewport.scrollTop + viewport.clientHeight + Math.abs(event.deltaY);
      const nearBottom = projectedBottom >= viewport.scrollHeight - 16;

      if (nearBottom && hasNextFormZonePage && !isFetchingFormZones) {
        setFormZonePage((prev) => prev + 1);
      }
    };

    viewport.addEventListener("wheel", loadMoreIfNeededByWheel, {
      passive: true,
    });
    return () => {
      viewport.removeEventListener("wheel", loadMoreIfNeededByWheel);
    };
  }, [
    isFormZoneSelectOpen,
    form.branchId,
    hasNextFormZonePage,
    isFetchingFormZones,
    formZoneItems.length,
  ]);

  const zoneNameById = useMemo(
    () =>
      new Map(
        [...filterZoneItems, ...formZoneItems].map((zone) => [zone.id, zone.name]),
      ),
    [filterZoneItems, formZoneItems],
  );

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setSelectedImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  const activeFilterCount = [
    appliedFilter.zoneId,
    appliedFilter.name,
    appliedFilter.courtType,
    appliedFilter.surfaceType,
    appliedFilter.courtStatus,
    appliedFilter.minPrice,
    appliedFilter.maxPrice,
  ].filter((value) => value.trim() !== "").length;

  const handleApplyFilters = () => {
    if (!draftFilter.branchId) return;
    setPage(0);
    setAppliedFilter(draftFilter);
  };

  const handleResetFilters = () => {
    const resetValue = { ...defaultDraftFilter };
    setPage(0);
    setDraftFilter(resetValue);
    setAppliedFilter(resetValue);
  };

  const renderCourtStatus = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "ACTIVE") {
      return (
        <span className="inline-flex h-6 items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 text-[10px] font-medium tracking-wide text-emerald-200">
          Hoạt động
        </span>
      );
    }
    if (normalized === "MAINTENANCE") {
      return (
        <span className="inline-flex h-6 items-center rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 text-[10px] font-medium tracking-wide text-amber-200">
          Bảo trì
        </span>
      );
    }
    if (normalized === "INACTIVE") {
      return (
        <span className="inline-flex h-6 items-center rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 text-[10px] font-medium tracking-wide text-rose-200">
          Tạm ngưng
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 items-center rounded-full border border-slate-600 bg-slate-700/30 px-2.5 text-[10px] font-medium tracking-wide text-slate-300">
        {status}
      </span>
    );
  };

  const openCreateDialog = () => {
    setEditingCourtId(null);
    setSelectedImageFile(null);
    setBaseImageUrl("");
    setForm({
      ...defaultCourtForm,
      zoneId: "",
    });
    setFormErrorMessages([]);
    setOpenFormDialog(true);
  };

  const openEditDialog = (court: Court) => {
    setEditingCourtId(court.id);
    setSelectedImageFile(null);
    setBaseImageUrl(court.imageUrl || "");
    setFormErrorMessages([]);
    if (court.zoneId) {
      setFormZoneItems((prev) => {
        const deduplicated = new Map(prev.map((zone) => [zone.id, zone]));
        deduplicated.set(court.zoneId, {
          id: court.zoneId,
          name:
            court.zoneName ||
            zoneNameById.get(court.zoneId) ||
            "Khu hiện tại",
          branchId:
            court.branchId || draftFilter.branchId || appliedFilter.branchId,
          description: "",
          maxCourts: 0,
          currentCourts: 0,
          createdAt: "",
          updatedAt: "",
        });
        return Array.from(deduplicated.values());
      });
    }
    setForm({
      branchId:
        court.branchId || draftFilter.branchId || appliedFilter.branchId,
      zoneId: court.zoneId || "",
      name: court.name,
      description: court.description || "",
      courtNumber: String(court.courtNumber ?? ""),
      courtType: court.courtType,
      surfaceType: court.surfaceType,
      courtStatus: court.courtStatus,
      imageUrl: court.imageUrl || "",
      location: court.location || "",
      maxPlayers: String(court.maxPlayers || 0),
    });
    setOpenFormDialog(true);
  };

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImageFile(file);

    if (!file) {
      setForm((prev) => ({ ...prev, imageUrl: baseImageUrl }));
      return;
    }

    try {
      const uploadedImageUrl = await upload(file);
      setForm((prev) => ({ ...prev, imageUrl: uploadedImageUrl }));
    } catch {
      setSelectedImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setForm((prev) => ({ ...prev, imageUrl: baseImageUrl }));
      toast.error("Tải ảnh thất bại, vui lòng thử lại.");
    }
  };

  const handleOpenDeleteDialog = (court: Court) => {
    setCourtToDelete(court);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!courtToDelete) return;

    try {
      await deleteCourt(courtToDelete.id);
      setOpenDeleteDialog(false);
      setCourtToDelete(null);
    } catch {
      // toast is already handled in mutation onError
    }
  };

  const handleSaveCourt = async () => {
    const branchId = form.branchId.trim();
    const zoneId = form.zoneId.trim();
    const name = form.name.trim();
    const description = form.description.trim();
    const location = form.location.trim();
    const imageUrl = form.imageUrl.trim();
    const courtNumber = Number(form.courtNumber);
    const maxPlayers = Number(form.maxPlayers);

    const errors: string[] = [];
    if (!name) errors.push("Tên sân là bắt buộc.");
    if (!branchId) errors.push("Chi nhánh là bắt buộc.");
    if (!zoneId) errors.push("Khu là bắt buộc.");
    if (!location) errors.push("Vị trí sân là bắt buộc.");
    if (!description) errors.push("Mô tả sân là bắt buộc.");
    if (!imageUrl) errors.push("Ảnh sân là bắt buộc.");
    if (!Number.isInteger(courtNumber) || courtNumber <= 0) {
      errors.push("Số sân phải là số nguyên lớn hơn 0.");
    }
    if (!form.courtType.trim()) errors.push("Loại sân là bắt buộc.");
    if (!form.surfaceType.trim()) errors.push("Mặt sân là bắt buộc.");
    if (!form.courtStatus.trim()) errors.push("Trạng thái là bắt buộc.");
    if (!Number.isInteger(maxPlayers) || maxPlayers <= 0) {
      errors.push("Số người tối đa phải là số nguyên lớn hơn 0.");
    }

    if (errors.length > 0) {
      setFormErrorMessages(errors);
      return;
    }

    setFormErrorMessages([]);

    const payload = {
      name,
      description,
      courtNumber,
      courtType: form.courtType,
      surfaceType: form.surfaceType,
      courtStatus: form.courtStatus,
      imageUrl,
      location,
      maxPlayers,
      zoneId,
    };
    try {
      if (editingCourtId) {
        await updateCourt({ id: editingCourtId, ...payload });
      } else {
        await createCourt(payload);
      }

      setForm(defaultCourtForm);
      setEditingCourtId(null);
      setOpenFormDialog(false);
    } catch {
      // toast is already handled in mutation onError
    }
  };

  const displayImageSrc = selectedImagePreview || form.imageUrl.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý sân</h1>
        </div>
        <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400"
              onClick={openCreateDialog}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm sân
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[88vh] overflow-y-auto border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-5xl"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingCourtId ? "Cập nhật sân" : "Thêm sân mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Nhập thông tin sân mới của bạn.
              </DialogDescription>
            </DialogHeader>

            {formErrorMessages.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formErrorMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    Thông tin chính
                  </p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs text-slate-400">Tên sân *</p>
                      <Input
                        value={form.name}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Ví dụ: Sân A1"
                        className="h-9 border-slate-700 bg-slate-900/80"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs text-slate-400">Mô tả</p>
                      <Input
                        value={form.description}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Mô tả ngắn về sân"
                        className="h-9 border-slate-700 bg-slate-900/80"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Chi nhánh *</p>
                      <Select
                        value={form.branchId || NONE_OPTION}
                        onValueChange={(value) => {
                          const nextBranchId =
                            value === NONE_OPTION ? "" : value;
                          setForm((prev) => ({
                            ...prev,
                            branchId: nextBranchId,
                            zoneId:
                              nextBranchId !== prev.branchId ? "" : prev.zoneId,
                          }));
                        }}
                        disabled={isLoadingBranches || Boolean(editingCourtId)}
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                        <SelectContent
                          className={selectContentClassName}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value={NONE_OPTION}
                            className={selectItemClassName}
                          >
                            Chọn chi nhánh
                          </SelectItem>
                          {branchItems.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id}
                              className={selectItemClassName}
                            >
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editingCourtId && (
                        <p className="text-[11px] text-slate-500">
                          Không thể đổi chi nhánh khi đang cập nhật sân.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Khu *</p>
                      <Select
                        value={form.zoneId || NONE_OPTION}
                        onOpenChange={setIsFormZoneSelectOpen}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            zoneId: value === NONE_OPTION ? "" : value,
                          }))
                        }
                        disabled={!form.branchId || isLoadingFormZones}
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue
                            placeholder={
                              form.branchId
                                ? "Chọn khu"
                                : "Chọn chi nhánh trước"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent
                          className={`${selectContentClassName} form-zone-select-content max-h-40`}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value={NONE_OPTION}
                            className={selectItemClassName}
                          >
                            Chọn khu
                          </SelectItem>
                          {form.zoneId &&
                            !formZoneItems.some((zone) => zone.id === form.zoneId) && (
                              <SelectItem
                                value={form.zoneId}
                                className={selectItemClassName}
                              >
                                {selectedFormZone?.name ||
                                  zoneNameById.get(form.zoneId) ||
                                  "Khu hiện tại"}
                              </SelectItem>
                            )}
                          {formZoneItems.map((zone) => (
                            <SelectItem
                              key={zone.id}
                              value={zone.id}
                              className={selectItemClassName}
                            >
                              {zone.name}
                            </SelectItem>
                          ))}
                          {isFetchingFormZones && (
                            <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Đang tải thêm khu...
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {!form.branchId && (
                        <p className="text-[11px] text-slate-500">
                          Vui lòng chọn chi nhánh để tải danh sách khu.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs text-slate-400">Vị trí</p>
                      <Input
                        value={form.location}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            location: event.target.value,
                          }))
                        }
                        placeholder="Khu vực trong chi nhánh"
                        className="h-9 border-slate-700 bg-slate-900/80"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    Thuộc tính sân
                  </p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Thứ tự sân *</p>
                      <Input
                        type="number"
                        min={1}
                        value={form.courtNumber}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            courtNumber: event.target.value,
                          }))
                        }
                        placeholder="Ví dụ: 1"
                        className="h-9 border-slate-700 bg-slate-900/80"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Loại sân *</p>
                      <Select
                        value={form.courtType || NONE_OPTION}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            courtType: value === NONE_OPTION ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue placeholder="Chọn loại sân" />
                        </SelectTrigger>
                        <SelectContent
                          className={selectContentClassName}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value={NONE_OPTION}
                            className={selectItemClassName}
                          >
                            Chọn loại sân
                          </SelectItem>
                          <SelectItem
                            value="INDOOR"
                            className={selectItemClassName}
                          >
                            INDOOR
                          </SelectItem>
                          <SelectItem
                            value="OUTDOOR"
                            className={selectItemClassName}
                          >
                            OUTDOOR
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Mặt sân *</p>
                      <Select
                        value={form.surfaceType || NONE_OPTION}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            surfaceType: value === NONE_OPTION ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue placeholder="Chọn mặt sân" />
                        </SelectTrigger>
                        <SelectContent
                          className={selectContentClassName}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value={NONE_OPTION}
                            className={selectItemClassName}
                          >
                            Chọn mặt sân
                          </SelectItem>

                          <SelectItem
                            value="ACRYLIC"
                            className={selectItemClassName}
                          >
                            Acrylic
                          </SelectItem>

                          <SelectItem
                            value="POLYURETHANE"
                            className={selectItemClassName}
                          >
                            Polyurethane
                          </SelectItem>

                          <SelectItem
                            value="CONCRETE"
                            className={selectItemClassName}
                          >
                            Concrete
                          </SelectItem>

                          <SelectItem
                            value="MODULAR_TILES"
                            className={selectItemClassName}
                          >
                            Modular Tiles
                          </SelectItem>

                          <SelectItem
                            value="ARTIFICIAL_GRASS"
                            className={selectItemClassName}
                          >
                            Artificial Grass
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                    Vận hành
                  </p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Trạng thái *</p>
                      <Select
                        value={form.courtStatus || "ACTIVE"}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            courtStatus: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent
                          className={selectContentClassName}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value="ACTIVE"
                            className={selectItemClassName}
                          >
                            ACTIVE
                          </SelectItem>
                          <SelectItem
                            value="MAINTENANCE"
                            className={selectItemClassName}
                          >
                            MAINTENANCE
                          </SelectItem>
                          <SelectItem
                            value="INACTIVE"
                            className={selectItemClassName}
                          >
                            INACTIVE
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Số người tối đa *</p>
                      <Select
                        value={form.maxPlayers || NONE_OPTION}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            maxPlayers: value === NONE_OPTION ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                          <SelectValue placeholder="Chọn số người" />
                        </SelectTrigger>
                        <SelectContent
                          className={selectContentClassName}
                          position="popper"
                          side="bottom"
                          sideOffset={6}
                          avoidCollisions={false}
                        >
                          <SelectItem
                            value={NONE_OPTION}
                            className={selectItemClassName}
                          >
                            Chọn số người
                          </SelectItem>
                          {MAX_PLAYERS_OPTIONS.map((value) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className={selectItemClassName}
                            >
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-3">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                  Ảnh sân
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                />

                <div className="mt-2 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative h-36 w-full max-w-72 overflow-hidden rounded-xl border border-dashed border-slate-600 bg-slate-900/70 transition-colors hover:border-emerald-400/70 hover:bg-slate-900"
                  >
                    {displayImageSrc ? (
                      <img
                        src={displayImageSrc}
                        alt="Preview ảnh sân"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-slate-400">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800/80">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                        <span className="text-[11px]">Nhấn để thêm ảnh</span>
                      </div>
                    )}

                    <span className="absolute bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow">
                      <Plus className="h-3 w-3" />
                    </span>
                  </button>

                  <div className="w-full space-y-1 text-center">
                    <p className="text-[11px] text-slate-400">
                      Dung lượng ảnh nên dưới 5MB để tải nhanh hơn.
                    </p>
                    {selectedImageFile ? (
                      <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
                        <span className="max-w-40 truncate">
                          {selectedImageFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile(null);
                            setForm((prev) => ({
                              ...prev,
                              imageUrl: baseImageUrl,
                            }));
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">Chưa chọn ảnh</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3 border-slate-800 bg-slate-950">
              <Button
                className="border-slate-700 cursor-pointer hover:bg-slate-900"
                onClick={() => setOpenFormDialog(false)}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400"
                onClick={handleSaveCourt}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {editingCourtId ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Filter className="h-4 w-4 text-emerald-300" />
                Bộ lọc sân
              </CardTitle>
              <CardDescription>
                Danh sách sân theo chi nhánh đã chọn. Sử dụng bộ lọc để tìm
                nhanh hơn.
              </CardDescription>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
              Đang áp dụng: {activeFilterCount} bộ lọc
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border  border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                  Chi nhánh *
                </p>
                <Select
                  value={draftFilter.branchId || NONE_OPTION}
                  onOpenChange={setIsBranchSelectOpen}
                  onValueChange={(value) => {
                    setDraftFilter((prev) => ({
                      ...prev,
                      branchId: value === NONE_OPTION ? "" : value,
                      zoneId: "",
                    }));
                  }}
                  disabled={isLoadingBranches}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent
                    className={`${selectContentClassName} branch-select-content max-h-40`}
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem
                      value={NONE_OPTION}
                      className={selectItemClassName}
                    >
                      Chọn chi nhánh
                    </SelectItem>
                    {branchItems.map((branch) => (
                      <SelectItem
                        key={branch.id}
                        value={branch.id}
                        className={selectItemClassName}
                      >
                        {branch.name}
                      </SelectItem>
                    ))}
                    {isFetchingNextPage && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm chi nhánh...
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {isBranchesError && (
                  <p className="mt-1 text-[11px] text-red-300">
                    Không tải được danh sách chi nhánh.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Search className="h-3.5 w-3.5" />
                  Tên sân
                </p>
                <Input
                  value={draftFilter.name}
                  onChange={(event) =>
                    setDraftFilter((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleApplyFilters();
                  }}
                  placeholder="Ví dụ: Sân A1"
                  className="h-10 border-slate-700 bg-slate-900/80"
                />
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 text-[11px] font-medium text-slate-400">
                  Loại sân
                </p>
                <Select
                  value={draftFilter.courtType || ALL_OPTION}
                  onValueChange={(value) =>
                    setDraftFilter((prev) => ({
                      ...prev,
                      courtType: value === ALL_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem
                      value={ALL_OPTION}
                      className={selectItemClassName}
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem value="INDOOR" className={selectItemClassName}>
                      Indoor
                    </SelectItem>
                    <SelectItem value="OUTDOOR" className={selectItemClassName}>
                      Outdoor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 text-[11px] font-medium text-slate-400">
                  Mặt sân
                </p>
                <Select
                  value={draftFilter.surfaceType || ALL_OPTION}
                  onValueChange={(value) =>
                    setDraftFilter((prev) => ({
                      ...prev,
                      surfaceType: value === ALL_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem
                      value={ALL_OPTION}
                      className={selectItemClassName}
                    >
                      Tất cả
                    </SelectItem>

                    <SelectItem value="ACRYLIC" className={selectItemClassName}>
                      Acrylic
                    </SelectItem>

                    <SelectItem
                      value="POLYURETHANE"
                      className={selectItemClassName}
                    >
                      Polyurethane
                    </SelectItem>

                    <SelectItem
                      value="CONCRETE"
                      className={selectItemClassName}
                    >
                      Concrete
                    </SelectItem>

                    <SelectItem
                      value="MODULAR_TILES"
                      className={selectItemClassName}
                    >
                      Modular Tiles
                    </SelectItem>

                    <SelectItem
                      value="ARTIFICIAL_GRASS"
                      className={selectItemClassName}
                    >
                      Artificial Grass
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 text-[11px] font-medium text-slate-400">
                  Trạng thái
                </p>
                <Select
                  value={draftFilter.courtStatus || ALL_OPTION}
                  onValueChange={(value) =>
                    setDraftFilter((prev) => ({
                      ...prev,
                      courtStatus: value === ALL_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentClassName}
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem
                      value={ALL_OPTION}
                      className={selectItemClassName}
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem value="ACTIVE" className={selectItemClassName}>
                      ACTIVE
                    </SelectItem>
                    <SelectItem
                      value="MAINTENANCE"
                      className={selectItemClassName}
                    >
                      MAINTENANCE
                    </SelectItem>
                    <SelectItem
                      value="INACTIVE"
                      className={selectItemClassName}
                    >
                      INACTIVE
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="mb-1.5 text-[11px] font-medium text-slate-400">
                  Khu
                </p>
                <Select
                  value={draftFilter.zoneId || ALL_OPTION}
                  onOpenChange={setIsFilterZoneSelectOpen}
                  onValueChange={(value) =>
                    setDraftFilter((prev) => ({
                      ...prev,
                      zoneId: value === ALL_OPTION ? "" : value,
                    }))
                  }
                  disabled={!draftFilter.branchId || isLoadingFilterZones}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue
                      placeholder={
                        draftFilter.branchId
                          ? "Tất cả"
                          : "Chọn chi nhánh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className={`${selectContentClassName} filter-zone-select-content max-h-40`}
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem
                      value={ALL_OPTION}
                      className={selectItemClassName}
                    >
                      Tất cả
                    </SelectItem>
                    {filterZoneItems.map((zone) => (
                      <SelectItem
                        key={zone.id}
                        value={zone.id}
                        className={selectItemClassName}
                      >
                        {zone.name}
                      </SelectItem>
                    ))}
                    {isFetchingFilterZones && (
                      <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải thêm khu...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

             
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-700 cursor-pointer"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Đặt lại bộ lọc
                </Button>
                <Button
                  className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400"
                  onClick={handleApplyFilters}
                  disabled={!draftFilter.branchId}
                >
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2"></div>
        </CardContent>
      </Card>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle className="flex items-center gap-2">
            Danh sách sân
            {isFetching && (
              <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                Đang tải...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Trang {pagination.page + 1}/{pagination.totalPages} - Tổng:{" "}
            {pagination.totalElements}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Dialog
            open={Boolean(selectedCourtDetail)}
            onOpenChange={(isOpen) => {
              if (!isOpen) setSelectedCourtDetail(null);
            }}
          >
            <DialogContent
              className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-7xl"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Chi tiết sân</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Xem đầy đủ thông tin sân để tránh mất nội dung do bảng giới
                  hạn ký tự.
                </DialogDescription>
              </DialogHeader>
              {selectedCourtDetail && (
                <div className="grid grid-cols-1 gap-4 text-xs lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                    {selectedCourtDetail.imageUrl?.trim() ? (
                      <div className="relative h-full min-h-80">
                        <img
                          src={selectedCourtDetail.imageUrl}
                          alt={`Ảnh sân ${selectedCourtDetail.name || ""}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/35 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-200">
                            <Building2 className="h-3.5 w-3.5" />
                            {selectedCourtDetail.name || "N/A"}
                          </div>
                          <p className="mt-2 text-[11px] text-slate-300">
                            {selectedCourtDetail.location || "N/A"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 bg-slate-900/40 text-slate-500">
                        <ImagePlus className="h-5 w-5" />
                        Chưa có ảnh sân
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/35">
                    <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                        Hồ sơ sân
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:gap-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Mã sân
                        </p>
                        <p className="text-sm font-semibold text-slate-100">
                          {selectedCourtDetail.id || "N/A"}
                        </p>
                      </div>
                    

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Tên sân
                        </p>
                        <p className="text-sm font-semibold text-slate-100">
                          {selectedCourtDetail.name || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Khu
                        </p>
                        <p className="text-sm text-slate-100">
                          {selectedCourtDetail.zoneName ||
                            zoneNameById.get(selectedCourtDetail.zoneId) ||
                            selectedCourtDetail.zoneId ||
                            "N/A"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MapPinned className="h-3.5 w-3.5" />
                          Vị trí
                        </p>
                        <p className="text-sm text-slate-100">
                          {selectedCourtDetail.location || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Loại sân / Mặt sân
                        </p>
                        <p className="text-sm text-slate-100">
                          {selectedCourtDetail.courtType} /{" "}
                          {selectedCourtDetail.surfaceType}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Trạng thái / Số người
                        </p>
                        <p className="text-sm text-slate-100">
                          {selectedCourtDetail.courtStatus} /{" "}
                          {selectedCourtDetail.maxPlayers}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Building2 className="h-3.5 w-3.5" />
                          Số sân
                        </p>
                        <p className="text-sm text-slate-100">
                          {selectedCourtDetail.courtNumber ?? "N/A"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5 sm:col-span-2">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <FileText className="h-3.5 w-3.5" />
                          Mô tả
                        </p>
                        <p className="whitespace-pre-wrap wrap-break-word text-sm text-slate-100">
                          {selectedCourtDetail.description || "Chưa có mô tả"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={openDeleteDialog}
            onOpenChange={(isOpen) => {
              setOpenDeleteDialog(isOpen);
              if (!isOpen && !isDeletingCourt) {
                setCourtToDelete(null);
              }
            }}
          >
            <DialogContent className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Xác nhận xóa sân</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Bạn có chắc muốn xóa sân{" "}
                  <span className="font-medium text-slate-100">
                    {courtToDelete?.name?.trim() || "(chưa đặt tên)"}
                  </span>
                  ? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="border-slate-800 text-black cursor-pointer bg-slate-900/50">
                <Button
                  variant="outline"
                  className="cursor-pointer border-slate-700 bg-transparent text-slate-200 hover:bg-slate-300"
                  onClick={() => {
                    setOpenDeleteDialog(false);
                    setCourtToDelete(null);
                  }}
                  disabled={isDeletingCourt}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingCourt}
                >
                  {isDeletingCourt && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  {isDeletingCourt ? "Đang xóa..." : "Xóa sân"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {(!appliedFilter.branchId || isLoadingBranches) && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Vui lòng chọn chi nhánh để tải danh sách sân.
            </div>
          )}

          {appliedFilter.branchId && isLoading && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Đang tải dữ liệu sân...
            </div>
          )}

          {appliedFilter.branchId && isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-xs text-destructive">
              Tải dữ liệu thất bại:{" "}
              {error instanceof Error ? error.message : "Lỗi không xác định"}
            </div>
          )}

          {appliedFilter.branchId && !isError && courts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] text-slate-400">
                    <th className="px-2 py-2.5 font-medium">Tên sân</th>
                    <th className="px-2 py-2.5 font-medium">Loại sân</th>
                    <th className="px-2 py-2.5 font-medium">Bề mặt sân</th>
                    <th className="px-2 py-2.5 font-medium">Vị trí</th>
                    <th className="px-2 py-2.5 font-medium">Trạng thái</th>
                    <th className="px-2 py-2.5 font-medium">Ngày tạo</th>
                    <th className="px-2 py-2.5 font-medium">Ngày cập nhật</th>
                    <th className="px-2 py-2.5 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court) => (
                    <tr
                      key={court.id}
                      className="border-b border-slate-900/90 align-top"
                    >
                      <td className="px-2 py-3 font-medium text-slate-100">
                        {court.name}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {court.courtType}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {court.surfaceType || "N/A"}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPinned className="h-3.5 w-3.5 text-slate-500" />
                          <span>{court.location || "N/A"}</span>
                        </div>
                      </td>
                    
                      <td className="px-2 py-3">
                        {renderCourtStatus(court.courtStatus)}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {formatDate(court.createdAt)}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {formatDate(court.updatedAt)}
                      </td>

                      <td className="px-2 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer border-slate-700 bg-slate-900/80 px-2 text-[11px] text-slate-200 hover:bg-slate-800"
                            onClick={() => setSelectedCourtDetail(court)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Chi tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer border-emerald-500/60 bg-emerald-500/10 px-2 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                            onClick={() => openEditDialog(court)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 cursor-pointer px-2 text-[11px]"
                            onClick={() => handleOpenDeleteDialog(court)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {appliedFilter.branchId &&
            !isError &&
            !isLoading &&
            courts.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
                Không có dữ liệu phù hợp bộ lọc hiện tại.
              </div>
            )}

          {appliedFilter.branchId && !isError && pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-3">
              <p className="text-[11px] text-slate-400">
                Trang hiện tại: {pagination.page + 1} / {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={!canGoPrevious || isFetching}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.totalPages - 1, prev + 1),
                    )
                  }
                  disabled={!canGoNext || isFetching}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtsManagementPage;
