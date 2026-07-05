import { Download, FileText, Sheet as SheetIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalyticsStore } from "@/features/analytics/stores/analytics.store";
import { useExportReport } from "../hooks/useExportReport";
import type { ExportFormat } from "../services/report.service";

export function ExportReportButton() {
  const { selectedMonth, selectedYear } = useAnalyticsStore();
  const { mutate: exportReport, isPending } = useExportReport();

  const handleExport = (format: ExportFormat) => {
    exportReport({ month: selectedMonth, year: selectedYear, format });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="
            h-8 px-3 gap-2 bg-white text-[#37352F] border-[#E8E7E5] 
            hover:bg-[#F7F6F3] shadow-sm font-medium text-xs
          "
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {isPending ? "Đang xuất..." : "Xuất báo cáo"}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40 bg-white border-[#E8E7E5] shadow-md rounded-md p-1">
        <DropdownMenuItem 
          onClick={() => handleExport("pdf")}
          className="gap-2 text-sm text-[#37352F] cursor-pointer hover:bg-[#F7F6F3] focus:bg-[#F7F6F3] rounded-[4px] px-2 py-1.5"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>Định dạng PDF</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport("excel")}
          className="gap-2 text-sm text-[#37352F] cursor-pointer hover:bg-[#F7F6F3] focus:bg-[#F7F6F3] rounded-[4px] px-2 py-1.5"
        >
          <SheetIcon className="w-4 h-4 text-green-600" />
          <span>Định dạng Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
