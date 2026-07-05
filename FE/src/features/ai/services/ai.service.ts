import { apiClient } from "@/lib/apiClient";
import type { OcrResult, ImageAnalysis, AiInsight } from "../types/ai.types";

class AiService {
  /** Gửi ảnh hóa đơn để quét OCR (không cần expenseId) */
  async scanReceipt(file: File): Promise<{ ocrResultId: string; status: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{ data: { ocrResultId: string; status: string } }>(
      "/ai/scan-receipt",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  /** Lấy kết quả OCR theo ID */
  async previewClassification(imageUrl: string): Promise<{
    suggestedTitle?: string;
    suggestedCategoryId: string | null;
    suggestedCategoryName: string;
    tags: string[];
    confidence: number;
    rawResponse: any;
  }> {
    const response = await apiClient.post(`/ai/preview-classification`, { imageUrl });
    return response.data;
  }

  /** Lấy kết quả OCR theo ID */
  async getOcrResult(ocrResultId: string): Promise<OcrResult> {
    const response = await apiClient.get<{ data: OcrResult }>(`/ai/ocr-result/${ocrResultId}`);
    return response.data;
  }

  /** Lấy kết quả phân loại ảnh theo expenseId */
  async getImageAnalysis(expenseId: string): Promise<ImageAnalysis> {
    const response = await apiClient.get<{ data: ImageAnalysis }>(`/ai/image-analysis/${expenseId}`);
    return response.data;
  }

  /** Lấy AI Insights theo tháng năm */
  async getInsights(month: number, year: number): Promise<AiInsight | null> {
    try {
      const response = await apiClient.get<{ data: AiInsight | null }>(`/ai/insights`, {
        params: { month, year },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /** Yêu cầu sinh AI Insights mới theo tháng năm */
  async generateInsights(month: number, year: number): Promise<AiInsight> {
    const response = await apiClient.post<{ data: AiInsight }>(`/ai/insights/generate`, {}, {
      params: { month, year },
    });
    return response.data;
  }
}

export const aiService = new AiService();
