import { apiClient } from "@/lib/apiClient";

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

class UploadService {
  /**
   * Upload an image to Cloudinary via Backend
   */
  async uploadImage(file: File, context: "expense" | "avatar" = "expense") {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<{ data: UploadResponse }>(
      "/upload/image",
      formData,
      { params: { context } }
    );
    return res.data;
  }
}

export const uploadService = new UploadService();
