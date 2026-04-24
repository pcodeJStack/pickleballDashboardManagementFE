// services/upload.service.ts

import { env } from "@/config/env";


export const uploadImageToCloudinary = async (file: File) => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Thiếu cấu hình Cloudinary");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File phải là ảnh");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ảnh tối đa 2MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Upload ảnh thất bại");
  }

  const data = await res.json();

  if (!data?.secure_url) {
    throw new Error("Không lấy được URL ảnh");
  }

  return data.secure_url as string;
};