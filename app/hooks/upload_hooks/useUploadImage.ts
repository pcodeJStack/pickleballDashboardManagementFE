// hooks/useUploadImage.ts
import { uploadImageToCloudinary } from "@/app/services/upload.service";
import { useState } from "react";


export const useUploadImage = () => {
  const [isUploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadImageToCloudinary(file);
      return url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, isUploading };
};