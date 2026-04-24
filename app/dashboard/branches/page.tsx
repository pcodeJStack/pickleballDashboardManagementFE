"use client";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Clock3,
  Eye,
  FileText,
  Filter,
  ImagePlus,
  Loader2,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  SquarePen,
  Trash,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllBranchesQuery } from "@/app/hooks/branch_hooks/useGetAllBranchesQuery";
import type { Branch } from "@/app/services/branch.service";
import { formatDate } from "@/lib/utils";
import { BranchImagePreview } from "@/components/branch/BranchImagePreview";
import { useCreateNewBranchMutation } from "@/app/hooks/branch_hooks/useCreateNewBranchMutation";
import { toast } from "react-toastify";
import { useUploadImage } from "@/app/hooks/upload_hooks/useUploadImage";
import { useDeleteBranchMutation } from "@/app/hooks/branch_hooks/useDeleteBranchMutation";
import { useUpdateBranchMutation } from "@/app/hooks/branch_hooks/useUpdateBranchMutation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BranchFormState = {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  description: string;
  openTime: string;
  closeTime: string;
};

const defaultBranchForm: BranchFormState = {
  name: "",
  address: "",
  phone: "",
  imageUrl: "",
  description: "",
  openTime: "",
  closeTime: "",
};

const NONE_OPTION = "__NONE__";
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  const hhmm = `${hour}:${minute}`;
  return { value: `${hhmm}:00`, label: hhmm };
});

type BranchFilterState = {
  page: number;
  size: number;
  name: string;
  address: string;
  phone: string;
};

const defaultBranchFilter: BranchFilterState = {
  page: 0,
  size: 10,
  name: "",
  address: "",
  phone: "",
};

const truncateText = (value: string, maxLength: number) => {
  const text = value.trim();
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const BranchesManagement = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draftFilter, setDraftFilter] =
    useState<BranchFilterState>(defaultBranchFilter);
  const [appliedFilter, setAppliedFilter] =
    useState<BranchFilterState>(defaultBranchFilter);
  const {
    data: branchesData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllBranchesQuery(appliedFilter);

  const [branches, setBranches] = useState<Branch[]>([]);
  const { mutateAsync: createBranch, isPending: isCreatingBranch } =
    useCreateNewBranchMutation();
  const { mutateAsync: deleteBranch, isPending: isDeletingBranch } =
    useDeleteBranchMutation();
  const { mutateAsync: updateBranch, isPending: isUpdatingBranch } =
    useUpdateBranchMutation();
  const { upload, isUploading } = useUploadImage();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [baseImageUrl, setBaseImageUrl] = useState("");
  const [isSavingBranch, setIsSavingBranch] = useState(false);

  const [form, setForm] = useState<BranchFormState>(defaultBranchForm);
  const [formErrorMessages, setFormErrorMessages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [selectedBranchDetail, setSelectedBranchDetail] =
    useState<Branch | null>(null);

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
    appliedFilter.name,
    appliedFilter.address,
    appliedFilter.phone,
  ].filter((value) => value.trim() !== "").length;
  useEffect(() => {
    if (branchesData?.items) {
      setBranches(branchesData.items);
    }
  }, [branchesData]);

  const pagination = useMemo(
    () => ({
      page: branchesData?.page ?? appliedFilter.page,
      size: branchesData?.size ?? appliedFilter.size,
      totalPages: Math.max(1, branchesData?.totalPages ?? 1),
      totalElements: branchesData?.totalElements ?? branches.length,
    }),
    [branchesData, branches.length, appliedFilter.page, appliedFilter.size],
  );

  const canGoPrevious = pagination.page > 0;
  const canGoNext = pagination.page < pagination.totalPages - 1;
  const isSubmitting = isSavingBranch || isCreatingBranch || isUpdatingBranch;
  const displayImageSrc = selectedImagePreview || form.imageUrl.trim();

  const applyFilters = () => {
    setAppliedFilter((prev) => ({
      ...prev,
      page: 0,
      name: draftFilter.name,
      address: draftFilter.address,
      phone: draftFilter.phone,
    }));
  };

  const resetFilters = () => {
    setDraftFilter(defaultBranchFilter);
    setAppliedFilter(defaultBranchFilter);
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
    setEditingId(null);
    setForm(defaultBranchForm);
    setFormErrorMessages([]);
    setSelectedImageFile(null);
    setBaseImageUrl("");
    setOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setEditingId(branch.id);
    setFormErrorMessages([]);
    setSelectedImageFile(null);
    setBaseImageUrl(branch.imageUrl);
    setForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      imageUrl: branch.imageUrl,
      description: branch.description,
      openTime: branch.openTime,
      closeTime: branch.closeTime,
    });
    setOpen(true);
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

  const handleOpenDeleteDialog = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;
    try {
      await deleteBranch(branchToDelete.id);
      setBranches((prev) =>
        prev.filter((item) => item.id !== branchToDelete.id),
      );
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    } catch {
      console.error("Delete branch failed:", error);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();
    const description = form.description.trim();
    const openTime = form.openTime.trim();
    const closeTime = form.closeTime.trim();
    if (
      !name ||
      !address ||
      !phone ||
      !description ||
      !openTime ||
      !closeTime
    ) {
      setFormErrorMessages([
        "Vui lòng nhập đầy đủ các trường bắt buộc: Tên chi nhánh, Địa chỉ, Điện thoại, Mô tả, Giờ mở cửa, Giờ đóng cửa.",
      ]);
      return;
    }

    if (
      !/^\d{2}:\d{2}:\d{2}$/.test(openTime) ||
      !/^\d{2}:\d{2}:\d{2}$/.test(closeTime)
    ) {
      setFormErrorMessages(["Giờ mở/đóng cửa phải đúng định dạng HH:mm:ss."]);
      return;
    }

    if (openTime >= closeTime) {
      setFormErrorMessages(["Giờ mở cửa phải nhỏ hơn giờ đóng cửa."]);
      return;
    }

    setFormErrorMessages([]);

    try {
      setIsSavingBranch(true);
      const imageUrl = form.imageUrl.trim();
      const payload = {
        name,
        address,
        phone,
        imageUrl,
        description,
        openTime,
        closeTime,
      };
      if (editingId) {
        await updateBranch({
          id: editingId,
          ...payload,
        });
      } else {
        await createBranch(payload);
      }
      setForm(defaultBranchForm);
      setFormErrorMessages([]);
      setSelectedImageFile(null);
      setOpen(false);
    } catch (error) {
      const maybeError = error as {
        response?: {
          data?: {
            message?:
              | string
              | { data?: Partial<Record<keyof BranchFormState, string>> };
            data?: Partial<Record<keyof BranchFormState, string>>;
          };
        };
      };

      const serverFieldErrors =
        maybeError?.response?.data?.data ??
        (typeof maybeError?.response?.data?.message === "object"
          ? maybeError?.response?.data?.message?.data
          : undefined) ??
        {};

      const detailedMessages = Object.values(serverFieldErrors).filter(
        (value): value is string =>
          typeof value === "string" && value.trim() !== "",
      );
      const rawMessage = maybeError?.response?.data?.message;
      const fallbackMessage =
        typeof rawMessage === "string" ? rawMessage : "Có lỗi xảy ra";
      setFormErrorMessages(
        detailedMessages.length > 0 ? detailedMessages : [fallbackMessage],
      );
    } finally {
      setIsSavingBranch(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">
            Quản lý chi nhánh
          </h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400"
              onClick={openCreateDialog}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent
            className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Điền thông tin cần thiết để tạo chi nhánh mới.
              </DialogDescription>
            </DialogHeader>

            {formErrorMessages.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <p className="font-medium">{formErrorMessages[0]}</p>
                <ul className="mt-1 list-disc pl-4">
                  {formErrorMessages.slice(1).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Tên chi nhánh *
                </label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="VD: Quận 7"
                  className="h-8 mt-1 border-slate-700  bg-slate-900/70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Điện thoại *
                </label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="VD: 0909123456"
                  className="h-8 mt-1 border-slate-700 bg-slate-900/70"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Địa chỉ *</label>
                <Input
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1"
                  className="h-8 mt-1 border-slate-700 bg-slate-900/70"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Mô tả *</label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="VD: Hiện đại, có chỗ để xe, gần trung tâm thương mại..."
                  className="h-8 mt-1 border-slate-700 bg-slate-900/70"
                />
              </div>
              <div className="space-y-1.5 ">
                <label className="text-[11px] text-slate-400">
                  Giờ mở cửa *
                </label>
                <Select
                  value={form.openTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      openTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 mt-1 w-full border-slate-700 bg-slate-900/70 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn giờ mở cửa" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-48 overflow-y-auto border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>Chọn giờ mở cửa</SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem className="flex justify-center" key={`open-${time.value}`} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Giờ đóng cửa *
                </label>
                <Select
                  value={form.closeTime || NONE_OPTION}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      closeTime: value === NONE_OPTION ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 mt-1 w-full border-slate-700 bg-slate-900/70 text-xs text-slate-200">
                    <SelectValue placeholder="Chọn giờ đóng cửa" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-48 overflow-y-auto border-slate-300 bg-white text-slate-900"
                    position="popper"
                    side="bottom"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value={NONE_OPTION}>
                      Chọn giờ đóng cửa
                    </SelectItem>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem
                        key={`close-${time.value}`}
                        value={time.value}
                        className="flex justify-center"
                      >
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] text-slate-400">
                  Ảnh chi nhánh
                </label>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                />

                <div className="flex mt-1.5 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative h-28 w-28 overflow-hidden rounded-xl border border-dashed border-slate-600 bg-slate-900/70 transition-colors hover:border-emerald-400/70 hover:bg-slate-900"
                  >
                    {displayImageSrc ? (
                      <img
                        src={displayImageSrc}
                        alt="Preview ảnh chi nhánh"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex cursor-pointer h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800/80">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                        <span className="text-[10px]">Thêm ảnh</span>
                      </div>
                    )}

                    <span className="absolute bottom-1 cursor-pointer right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow">
                      <Plus className="h-3 w-3" />
                    </span>
                  </button>

                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400">
                      Nhấn vào khung vuông để chọn ảnh từ máy.
                    </p>
                    {selectedImageFile ? (
                      <div className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
                        <span className="max-w-44 truncate">
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
                          className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <X className="h-3 w-3 cursor-pointer" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Chưa chọn ảnh
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-slate-800 text-black cursor-pointer bg-slate-900/50">
              <Button
                className="cursor-pointer bg-white/80"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Huỷ bỏ
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting || isUploading}
                className="bg-emerald-500 cursor-pointer text-slate-950 hover:bg-emerald-400 flex items-center gap-2"
              >
                {(isSubmitting || isUploading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isSubmitting
                  ? editingId
                    ? "Đang cập nhật chi nhánh..."
                    : "Đang tạo chi nhánh..."
                  : isUploading
                    ? "Vui lòng chờ upload ảnh..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="pb-2">
            <CardDescription>Tổng chi nhánh</CardDescription>
            <CardTitle className="text-2xl text-emerald-200">
              {pagination.totalElements}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="pb-2">
            <CardDescription>Tổng số sân</CardDescription>
            <CardTitle className="text-2xl text-sky-200">0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="pb-2">
            <CardDescription>Chi nhánh doanh thu cao nhất</CardDescription>
            <CardTitle className="text-lg text-emerald-300">0</CardTitle>
            <span className="text-xs text-slate-400">0 đ</span>
          </CardHeader>
        </Card>
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="pb-2">
            <CardDescription>Chi nhánh doanh thu thấp nhất</CardDescription>
            <CardTitle className="text-lg text-red-300">0</CardTitle>
            <span className="text-xs text-slate-400">0 đ</span>
          </CardHeader>
        </Card>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Filter className="h-4 w-4 text-emerald-300" />
                Bộ lọc
              </CardTitle>
              <CardDescription>
                Lọc theo tên, địa chỉ hoặc số điện thoại để tìm chi nhánh nhanh
                hơn.
              </CardDescription>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
              Đang áp dụng: {activeFilterCount} bộ lọc
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                Tên chi nhánh
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
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Ví dụ: Quận 1"
                className="border-slate-700 bg-slate-900/70"
              />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <MapPinned className="h-3.5 w-3.5" />
                Địa chỉ
              </p>
              <Input
                value={draftFilter.address}
                onChange={(event) =>
                  setDraftFilter((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Ví dụ: Phường 6"
                className="border-slate-700 bg-slate-900/70"
              />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Số điện thoại
              </p>
              <Input
                value={draftFilter.phone}
                onChange={(event) =>
                  setDraftFilter((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder="Ví dụ: 0335..."
                className="border-slate-700 bg-slate-900/70"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Mẹo: nhấn Enter trong ô bất kỳ để áp dụng nhanh bộ lọc.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="border-slate-700 cursor-pointer"
                onClick={resetFilters}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Đặt lại bộ lọc
              </Button>
              <Button
                className="bg-emerald-500 text-slate-950 cursor-pointer hover:bg-emerald-400"
                onClick={applyFilters}
              >
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle className="flex items-center gap-2">
            Danh sách chi nhánh
            {isFetching && (
              <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                Đang lọc...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Trang {pagination.page + 1}/{pagination.totalPages} - Kích thước
            trang: {pagination.size} - Tổng: {pagination.totalElements}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading && branches.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Đang tải dữ liệu chi nhánh...
            </div>
          )}

          <Dialog
            open={Boolean(selectedBranchDetail)}
            onOpenChange={(isOpen) => {
              if (!isOpen) setSelectedBranchDetail(null);
            }}
          >
            <DialogContent
              className="max-h-[90vh] border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-2xl"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Chi tiết chi nhánh</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Xem đầy đủ thông tin để tránh mất nội dung do bảng giới hạn ký
                  tự.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[72vh] overflow-y-auto pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-slate-900/40 [&::-webkit-scrollbar]:w-2">
                {selectedBranchDetail && (
                <div className="space-y-4 text-xs">
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                    {selectedBranchDetail.imageUrl?.trim() ? (
                      <div className="relative">
                        <img
                          src={selectedBranchDetail.imageUrl}
                          alt={`Ảnh chi nhánh ${selectedBranchDetail.name || ""}`}
                          className="h-52 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/35 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-200">
                            <Building2 className="h-3.5 w-3.5" />
                            {selectedBranchDetail.name || "N/A"}
                          </div>
                          <p className="mt-2 text-[11px] text-slate-300">
                            {selectedBranchDetail.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-52 flex-col items-center justify-center gap-2 bg-slate-900/40 text-slate-500">
                        <ImagePlus className="h-5 w-5" />
                        Chưa có ảnh chi nhánh
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/35">
                    <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                        Hồ sơ chi nhánh
                      </p>
                    </div>

                    <div className="px-4 py-1">
                      <div className="divide-y divide-slate-800/80">
                        <div className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                            <Building2 className="h-3.5 w-3.5" />
                            Tên chi nhánh
                          </p>
                          <p className="text-sm font-semibold text-slate-100">
                            {selectedBranchDetail.name || "N/A"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-3 md:gap-4">
                          <div className="space-y-1">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                              <Building2 className="h-3.5 w-3.5" />
                              Mã chi nhánh
                            </p>
                            <p className="text-sm font-medium text-slate-200">
                              {selectedBranchDetail.id || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                              <Phone className="h-3.5 w-3.5" />
                              Số điện thoại
                            </p>
                            <p className="text-sm font-medium text-slate-200">
                              {selectedBranchDetail.phone || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                              <Clock3 className="h-3.5 w-3.5" />
                              Giờ hoạt động
                            </p>
                            <p className="text-sm font-medium text-slate-200">
                              {selectedBranchDetail.openTime || "N/A"} - {selectedBranchDetail.closeTime || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                            <MapPinned className="h-3.5 w-3.5" />
                            Địa chỉ
                          </p>
                          <p className="text-sm leading-relaxed text-slate-100">
                            {selectedBranchDetail.address || "N/A"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-slate-400 sm:text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            Mô tả
                          </p>
                          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-100">
                            {selectedBranchDetail.description || "Chưa có mô tả"}
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
                          {formatDate(selectedBranchDetail.createdAt)}
                        </p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                          <Clock3 className="h-3.5 w-3.5" />
                          Cập nhật lần cuối
                        </p>
                        <p className="text-sm text-slate-200">
                          {formatDate(selectedBranchDetail.updatedAt)}
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
              if (!isOpen && !isDeletingBranch) {
                setBranchToDelete(null);
              }
            }}
          >
            <DialogContent
              className="border border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Xác nhận xóa chi nhánh</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Bạn có chắc muốn xóa chi nhánh{" "}
                  <span className="font-medium text-slate-100">
                    {branchToDelete?.name?.trim() || "(chưa đặt tên)"}
                  </span>
                  ? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="border-slate-800 text-black cursor-pointer bg-slate-900/50">
                <Button
                  variant="outline"
                  className="cursor-pointer border-slate-700 bg-transparent text-slate-200 hover:bg-slate-300"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setBranchToDelete(null);
                  }}
                  disabled={isDeletingBranch}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingBranch}
                >
                  {isDeletingBranch && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  {isDeletingBranch ? "Đang xóa..." : "Xóa chi nhánh"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-8 text-center text-xs text-destructive">
              Tải dữ liệu thất bại:{" "}
              {error instanceof Error ? error.message : "Lỗi không xác định"}
            </div>
          )}

          {!isError && branches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[11px] text-slate-400">
                    <th className="px-2 py-2.5 font-medium">Tên</th>
                    <th className="px-2 py-2.5 font-medium">Địa chỉ</th>
                    <th className="px-2 py-2.5 font-medium">Điện thoại</th>
                    <th className="px-2 py-2.5 font-medium">Mô tả</th>
                    <th className="px-2 py-2.5 font-medium">Tạo lúc</th>
                    <th className="px-2 py-2.5 font-medium">Cập nhật</th>
                    <th className="px-2 py-2.5 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="border-b border-slate-900/90 align-top"
                    >
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200">
                            {(branch.name.trim() || "?")
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          <div className="space-y-0.5">
                            <p className="font-medium text-slate-100">
                              {truncateText(branch.name || "Chưa đặt tên", 18)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-slate-300">
                        {truncateText(branch.address || "", 28)}
                      </td>
                      <td className="px-2 py-3 text-slate-300">
                        {branch.phone || "N/A"}
                      </td>

                      <td className="px-2 py-3 text-slate-300">
                        {truncateText(branch.description || "", 32)}
                      </td>
                      <td className="px-2 py-3 text-slate-400">
                        {formatDate(branch.createdAt)}
                      </td>
                      <td className="px-2 py-3 text-slate-400">
                        {formatDate(branch.updatedAt)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                className="h-8 w-8 rounded-md border cursor-pointer border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-44 border-slate-800 bg-slate-950 text-slate-200"
                            >
                              <DropdownMenuItem
                                onClick={() => setSelectedBranchDetail(branch)}
                                className="cursor-pointer gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openEditDialog(branch)}
                                className="cursor-pointer gap-2"
                              >
                                <SquarePen className="h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-slate-800" />

                              <DropdownMenuItem
                                onClick={() => handleOpenDeleteDialog(branch)}
                                className="cursor-pointer gap-2"
                              >
                                <Trash className="h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isError && !isLoading && branches.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-center text-xs text-slate-500">
              Không có dữ liệu phù hợp bộ lọc hiện tại.
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
                  disabled={!canGoPrevious || isFetching}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  onClick={goToNextPage}
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

export default BranchesManagement;
