// BranchImagePreview.tsx
"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { normalizeImageUrl } from "./utils";

export const BranchImagePreview = ({
  imageUrl,
  branchName,
}: {
  imageUrl: string;
  branchName: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = normalizeImageUrl(imageUrl);
  const canPreview = Boolean(normalizedUrl) && !hasError;

  if (!canPreview) {
    return (
      <div className="inline-flex h-11 w-16 items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-900/70 text-[10px] text-slate-500">
        No image
      </div>
    );
  }

  return (
    <div className="group relative h-11 w-16 overflow-hidden rounded-md border border-slate-700 bg-slate-900">
      <img
        src={normalizedUrl ?? ""}
        alt={`Ảnh chi nhánh ${branchName || "chưa đặt tên"}`}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <a
        href={normalizedUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 hidden items-center justify-center bg-black/45 text-white group-hover:flex"
        aria-label="Mở ảnh gốc"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};