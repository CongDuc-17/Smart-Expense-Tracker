import { apiClient } from "@/lib/apiClient";

export type ExportFormat = "pdf" | "excel";

class ReportService {
  /**
   * Tải báo cáo tài chính về dưới dạng Blob
   */
  async exportReport(month: number, year: number, format: ExportFormat): Promise<Blob> {
    const res = await apiClient.get<Blob>("/reports/export", {
      params: { month, year, format },
      responseType: "blob", // Quan trọng để nhận binary data
    });
    return res; // apiClient.get đã unwrap res.data
  }
}

export const reportService = new ReportService();
