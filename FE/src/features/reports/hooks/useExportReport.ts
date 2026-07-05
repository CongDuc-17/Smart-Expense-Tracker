import { useMutation } from "@tanstack/react-query";
import { reportService, type ExportFormat } from "../services/report.service";
import { toast } from "sonner";

interface ExportReportVariables {
  month: number;
  year: number;
  format: ExportFormat;
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ month, year, format }: ExportReportVariables) => {
      return reportService.exportReport(month, year, format);
    },
    onSuccess: (blob, variables) => {
      // 1. Tạo object URL từ Blob
      const url = window.URL.createObjectURL(blob);
      
      // 2. Tạo thẻ <a> ẩn để trigger download
      const link = document.createElement("a");
      link.href = url;
      
      // 3. Tên file theo định dạng bao-cao-YYYY-MM.ext
      const ext = variables.format === "pdf" ? "pdf" : "xlsx";
      const monthStr = variables.month.toString().padStart(2, "0");
      link.setAttribute("download", `bao-cao-${variables.year}-${monthStr}.${ext}`);
      
      // 4. Bấm ảo và dọn dẹp
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Xuất báo cáo ${variables.format.toUpperCase()} thành công`);
    },
    onError: (error: any) => {
      // Vì responseType='blob', error.response.data cũng có thể là blob.
      // Dùng FileReader để parse lỗi từ server nếu cần, nhưng tạm thời fallback:
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Bạn đã xuất báo cáo quá nhiều lần. Vui lòng thử lại sau 1 phút.");
      } else {
        toast.error("Lỗi khi xuất báo cáo. Vui lòng thử lại sau.");
      }
    },
  });
}
