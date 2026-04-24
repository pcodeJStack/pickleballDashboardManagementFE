"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock3,
  Eye,
  Filter,
  Loader2,
  MapPinned,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllZonesQuery } from "@/app/hooks/zone_hooks/useGetZonesQuery";
import { useCreateNewZoneMutation } from "@/app/hooks/zone_hooks/useCreateNewZoneMutation";
import { useUpdateZoneMutation } from "@/app/hooks/zone_hooks/useUpdateZoneMutation";
import { useDeleteZoneMutation } from "@/app/hooks/zone_hooks/useDeleteZoneMutation";
import { useGetAllBranchesInfiniteQuery } from "@/app/hooks/branch_hooks/useGetAllBranchesInfiniteQuery";
import type { Zone } from "@/app/services/zone.service";
import { formatDate } from "@/lib/utils";

type ZoneFilterState = {
  page: number;
  size: number;
  name: string;
  branchId: string;
};

type ZoneFormState = {
  name: string;
  branchId: string;
  description: string;
  maxCourts: string;
};

const defaultFilter: ZoneFilterState = {
  page: 0,
  size: 10,
  name: "",
  branchId: "",
};

const defaultForm: ZoneFormState = {
  name: "",
  branchId: "",
  description: "",
  maxCourts: "",
};

const NONE_OPTION = "__NONE__";
const ZonesManagement = () => {
  const [isFormBranchSelectOpen, setIsFormBranchSelectOpen] = useState(false);
  const [isFilterBranchSelectOpen, setIsFilterBranchSelectOpen] = useState(false);
  const [draftFilter, setDraftFilter] = useState<ZoneFilterState>(defaultFilter);
  const [appliedFilter, setAppliedFilter] = useState<ZoneFilterState>(defaultFilter);
  const {
    data: zonesData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllZonesQuery({
    page: appliedFilter.page,
    size: appliedFilter.size,
    name: appliedFilter.name,
    branchId: appliedFilter.branchId,
  });
  const {
    data: branchesData,
    isLoading: isLoadingBranches,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetAllBranchesInfiniteQuery({ size: 5 });
  const { mutateAsync: createZone, isPending: isCreatingZone } =
    useCreateNewZoneMutation();
  const { mutateAsync: updateZone, isPending: isUpdatingZone } =
    useUpdateZoneMutation();
  const { mutateAsync: deleteZone, isPending: isDeletingZone } =
    useDeleteZoneMutation();

  const [zones, setZones] = useState<Zone[]>([]);
  const [form, setForm] = useState<ZoneFormState>(defaultForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  useEffect(() => {
    if (zonesData?.items) setZones(zonesData.items);
  }, [zonesData]);

  const branchItems = useMemo(
    () => branchesData?.pages.flatMap((page) => page.items) ?? [],
    [branchesData],
  );

  useEffect(() => {
    const activeSelectors: string[] = [];
    if (isFormBranchSelectOpen) {
      activeSelectors.push(".zone-form-branch-select-content");
    }
    if (isFilterBranchSelectOpen) {
      activeSelectors.push(".zone-filter-branch-select-content");
    }

    if (activeSelectors.length === 0) return;

    const cleanups = activeSelectors
      .map((selector) => {
        const viewport = document.querySelector(
          `${selector} [data-radix-select-viewport]`,
        ) as HTMLElement | null;

        if (!viewport) return null;

        const maybeLoadMore = () => {
          if (!hasNextPage || isFetchingNextPage) return;

          const nearBottom =
            viewport.scrollTop + viewport.clientHeight >=
            viewport.scrollHeight - 16;

          if (nearBottom) {
            fetchNextPage();
          }
        };

        viewport.addEventListener("scroll", maybeLoadMore, {
          passive: true,
        });

        return () => {
          viewport.removeEventListener("scroll", maybeLoadMore);
        };
      })
      .filter((cleanup): cleanup is () => void => Boolean(cleanup));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [
    isFormBranchSelectOpen,
    isFilterBranchSelectOpen,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    branchItems.length,
  ]);

  const branchNameById = useMemo(
    () => new Map(branchItems.map((branch) => [branch.id, branch.name])),
    [branchItems],
  );

  const pagination = useMemo(
    () => ({
      page: zonesData?.page ?? appliedFilter.page,
      size: zonesData?.size ?? appliedFilter.size,
      totalPages: Math.max(1, zonesData?.totalPages ?? 1),
      totalElements: zonesData?.totalElements ?? zones.length,
    }),
    [zonesData, appliedFilter.page, appliedFilter.size, zones.length],
  );

  const isSubmitting = isCreatingZone || isUpdatingZone;
  const activeFilterCount = [appliedFilter.name, appliedFilter.branchId].filter(
    (value) => value.trim() !== "",
  ).length;

  const applyFilters = () => {
    setAppliedFilter((prev) => ({
      ...prev,
      page: 0,
      name: draftFilter.name,
      branchId: draftFilter.branchId,
    }));
  };

  const resetFilters = () => {
    setDraftFilter(defaultFilter);
    setAppliedFilter(defaultFilter);
  };

  const goToPreviousPage = () => {
    setAppliedFilter((prev) => ({
      ...prev,
      page: Math.max(0, prev.page - 1),
    }));
  };

  const goToNextPage = () => {
    setAppliedFilter((prev) => ({
      ...prev,
      page: Math.min(pagination.totalPages - 1, prev.page + 1),
    }));
  };

  const openCreateDialog = () => {
    setEditingZoneId(null);
    setFormErrors([]);
    setForm({
      ...defaultForm,
      branchId: draftFilter.branchId || appliedFilter.branchId,
    });
    setOpenFormDialog(true);
  };

  const openEditDialog = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setFormErrors([]);
    setForm({
      name: zone.name,
      branchId: zone.branchId ?? "",
      description: zone.description || "",
      maxCourts: String(zone.maxCourts ?? ""),
    });
    setOpenFormDialog(true);
  };

  const handleSaveZone = async () => {
    const name = (form.name ?? "").trim();
    const branchId = (form.branchId ?? "").trim();
    const description = (form.description ?? "").trim();
    const maxCourts = Number(String(form.maxCourts ?? ""));
    const isEditing = Boolean(editingZoneId);

    const errors: string[] = [];
    if (!name) errors.push("Tên khu là bắt buộc.");
    if (!description) errors.push("Mô tả khu là bắt buộc.");
    if (!isEditing && !branchId) errors.push("Chi nhánh là bắt buộc.");
    if (!Number.isInteger(maxCourts) || maxCourts <= 0) {
      errors.push("Số sân tối đa phải là số nguyên lớn hơn 0.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    const payload = {
      name,
      description: description || undefined,
      maxCourts,
    };

    try {
      if (editingZoneId) {
        await updateZone({ id: editingZoneId, ...payload });
      } else {
        await createZone({ ...payload, branchId });
      }

      setOpenFormDialog(false);
      setEditingZoneId(null);
      setForm(defaultForm);
    } catch {
      // toast is handled in mutation hooks
    }
  };

  const handleOpenDeleteDialog = (zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!zoneToDelete) return;

    try {
      await deleteZone(zoneToDelete.id);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    } catch {
      // toast is handled in mutation hooks
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý khu</h1>
          <p className="text-xs text-slate-400">
            Quản trị danh sách khu theo chi nhánh, số lượng sân tối đa và trạng thái sử dụng.
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
              Thêm khu
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>{editingZoneId ? "Cập nhật khu" : "Thêm khu mới"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Nhập thông tin khu để lưu vào hệ thống.
              </DialogDescription>
            </DialogHeader>

            {formErrors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              {editingZoneId ? (
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-[11px] text-slate-400">Chi nhánh</label>
                  <Input
                    value={branchNameById.get(form.branchId) || "Không được phép thay đổi khi cập nhật"}
                    disabled
                    className="h-9 border-slate-700  text-white-200 bg-slate-900/70"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-[11px] text-slate-400">Chi nhánh *</label>
                  <Select
                    onOpenChange={setIsFormBranchSelectOpen}
                    value={form.branchId || NONE_OPTION}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        branchId: value === NONE_OPTION ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent
                      className="zone-form-branch-select-content max-h-32 overflow-y-auto border-slate-300 bg-white text-slate-900"
                      position="popper"
                      side="bottom"
                      sideOffset={6}
                      avoidCollisions={false}
                    >
                      <SelectItem value={NONE_OPTION}>Chọn chi nhánh</SelectItem>
                      {branchItems.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-[11px] text-slate-400">Tên khu *</label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ví dụ: Khu A"
                  className="h-9 border-slate-700 bg-slate-900/70"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1 sm:max-w-45">
                <label className="text-[11px] text-slate-400">Số sân tối đa *</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxCourts}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, maxCourts: event.target.value }))
                  }
                  placeholder="Ví dụ: 12"
                  className="h-9 border-slate-700 bg-slate-900/70"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Mô tả</label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Mô tả ngắn"
                  className="h-9 border-slate-700 bg-slate-900/70"
                />
              </div>
            </div>

            <DialogFooter className="border-slate-800 bg-slate-900/50">
              <Button
                variant="outline"
                className="cursor-pointer border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
                onClick={() => setOpenFormDialog(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                className="cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleSaveZone}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {editingZoneId ? "Lưu thay đổi" : "Thêm mới"}
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
                Bộ lọc khu
              </CardTitle>
              <CardDescription>
                Lọc theo tên khu và chi nhánh để tìm nhanh hơn.
              </CardDescription>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
              Đang áp dụng: {activeFilterCount} bộ lọc
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Search className="h-3.5 w-3.5" />
                Tên khu
              </p>
              <Input
                value={draftFilter.name}
                onChange={(event) =>
                  setDraftFilter((prev) => ({ ...prev, name: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Ví dụ: Khu A"
                className="h-9 border-slate-700 bg-slate-900/80"
              />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <MapPinned className="h-3.5 w-3.5" />
                Chi nhánh
              </p>
              <Select
                onOpenChange={setIsFilterBranchSelectOpen}
                value={draftFilter.branchId || NONE_OPTION}
                onValueChange={(value) =>
                  setDraftFilter((prev) => ({
                    ...prev,
                    branchId: value === NONE_OPTION ? "" : value,
                  }))
                }
                disabled={isLoadingBranches}
              >
                <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/80 text-xs text-slate-200">
                  <SelectValue placeholder="Tất cả chi nhánh" />
                </SelectTrigger>
                <SelectContent
                  className="zone-filter-branch-select-content max-h-48 overflow-y-auto border-slate-300 bg-white text-slate-900"
                  position="popper"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions={false}
                >
                  <SelectItem value={NONE_OPTION}>Tất cả chi nhánh</SelectItem>
                  {branchItems.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Mẹo: Nhấn Enter trong ô tên khu để áp dụng nhanh bộ lọc.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="cursor-pointer border-slate-700"
                onClick={resetFilters}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Đặt lại
              </Button>
              <Button
                className="cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={applyFilters}
              >
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Áp dụng
              </Button>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle className="flex items-center gap-2">
            Danh sách khu
            {isFetching && (
              <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                Đang tải...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Trang {pagination.page + 1}/{pagination.totalPages} - Tổng: {pagination.totalElements}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Dialog
            open={Boolean(selectedZone)}
            onOpenChange={(isOpen) => {
              if (!isOpen) setSelectedZone(null);
            }}
          >
            <DialogContent className="max-h-[90vh] border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết khu</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Thông tin đầy đủ của khu.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[72vh] overflow-y-auto pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-slate-900/40 [&::-webkit-scrollbar]:w-2">
                {selectedZone && (
                  <div className="space-y-4 text-xs">
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                      <div className="relative px-4 py-4">
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-slate-900/30 to-transparent" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-sm font-semibold text-emerald-200">
                              {(selectedZone.name || "?").slice(0, 1).toUpperCase()}
                            </span>
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-[0.08em] text-emerald-200/90">
                                Thông tin khu
                              </p>
                              <p className="text-base font-semibold text-slate-100">
                                {selectedZone.name || "N/A"}
                              </p>
                            
                            </div>
                          </div>
                          <div className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
                            ID: {selectedZone.id || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/35">
                      <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                          Hồ sơ khu
                        </p>
                      </div>

                      <div className="px-4 py-1">
                        <div className="divide-y divide-slate-800/80">
                          <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-3 md:gap-4 ">
                           
                            <div className="space-y-1">
                              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                                <MapPinned className="h-3.5 w-3.5" />
                                Sân tối đa
                              </p>
                              <p className="text-sm font-medium text-slate-200">
                                {selectedZone.maxCourts}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                                <MapPinned className="h-3.5 w-3.5" />
                                Sân hiện tại
                              </p>
                              <p className="text-sm font-medium text-slate-200">
                                {selectedZone.currentCourts}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                              <Pencil className="h-3.5 w-3.5" />
                              Mô tả
                            </p>
                            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-100">
                              {selectedZone.description || "Chưa có mô tả"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/25">
                      <div className="grid grid-cols-1 divide-y divide-slate-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        <div className="px-4 py-3">
                          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                            <Clock3 className="h-3.5 w-3.5" />
                            Tạo lúc
                          </p>
                          <p className="text-sm text-slate-200">
                            {formatDate(selectedZone.createdAt)}
                          </p>
                        </div>
                        <div className="px-4 py-3">
                          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                            <Clock3 className="h-3.5 w-3.5" />
                            Cập nhật lần cuối
                          </p>
                          <p className="text-sm text-slate-200">
                            {formatDate(selectedZone.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(isOpen) => {
              setDeleteDialogOpen(isOpen);
              if (!isOpen && !isDeletingZone) setZoneToDelete(null);
            }}
          >
            <DialogContent className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Xác nhận xóa khu</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Bạn có chắc muốn xóa khu{" "}
                  <span className="font-medium text-slate-100">{zoneToDelete?.name || ""}</span>?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="border-slate-800 bg-slate-900/50">
                <Button
                  variant="outline"
                  className="cursor-pointer border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setZoneToDelete(null);
                  }}
                  disabled={isDeletingZone}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingZone}
                >
                  {isDeletingZone && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {isDeletingZone ? "Đang xóa..." : "Xóa khu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isLoading && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Đang tải dữ liệu khu...
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-xs text-destructive">
              Tải dữ liệu thất bại: {error instanceof Error ? error.message : "Lỗi không xác định"}
            </div>
          )}

          {!isError && !isLoading && zones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] text-slate-400">
                    <th className="px-2 py-2.5 font-medium">Tên khu</th>
                    <th className="px-2 py-2.5 font-medium">Lượng sân tối đa</th>
                    <th className="px-2 py-2.5 font-medium">Lượng sân hiện tại</th>
                    <th className="px-2 py-2.5 font-medium">Ngày tạo</th>
                    <th className="px-2 py-2.5 font-medium">Cập nhật</th>
                    <th className="px-2 py-2.5 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-b border-slate-900/90 align-top">
                      <td className="px-2 py-3 font-medium text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200">
                            {(zone.name || "?").slice(0, 1).toUpperCase()}
                          </span>
                          {zone.name}
                        </div>
                      </td>
                     
                      <td className="px-2 py-3 text-slate-300">{zone.maxCourts}</td>
                      <td className="px-2 py-3 text-slate-300">{zone.currentCourts}</td>
                      <td className="px-2 py-3 text-slate-400">{formatDate(zone.createdAt)}</td>
                      <td className="px-2 py-3 text-slate-400">{formatDate(zone.updatedAt)}</td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer border-slate-700 bg-slate-900/80 px-2 text-[11px] text-slate-200 hover:bg-slate-800"
                            onClick={() => setSelectedZone(zone)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Chi tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer border-emerald-500/60 bg-emerald-500/10 px-2 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
                            onClick={() => openEditDialog(zone)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 cursor-pointer px-2 text-[11px]"
                            onClick={() => handleOpenDeleteDialog(zone)}
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

          {!isError && !isLoading && zones.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Không có dữ liệu khu phù hợp bộ lọc hiện tại.
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
                  className="border-slate-700"
                  onClick={goToPreviousPage}
                  disabled={pagination.page <= 0 || isFetching}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  onClick={goToNextPage}
                  disabled={pagination.page >= pagination.totalPages - 1 || isFetching}
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

export default ZonesManagement;
