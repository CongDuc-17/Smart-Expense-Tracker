// ============================================================
// TransactionEmptyState + TransactionFilters
// Phase 3 — Expense & Income Module
// ============================================================

import { ReceiptText, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyVariant = "empty" | "filtered";

interface TransactionEmptyStateProps {
  variant: EmptyVariant;
  onCreateClick?: () => void;
}

export function TransactionEmptyState({
  variant,
  onCreateClick,
}: TransactionEmptyStateProps) {
  if (variant === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <SearchX className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          Không có giao dịch nào
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-5">
          Không tìm thấy giao dịch trong khoảng thời gian và bộ lọc đã chọn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <ReceiptText className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        Chưa có giao dịch nào
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-5 mb-5">
        Bắt đầu ghi lại thu chi hàng ngày của bạn.
      </p>
      {onCreateClick && (
        <Button
          onClick={onCreateClick}
          size="sm"
          className="
            bg-primary text-primary-foreground text-sm font-medium
            hover:bg-primary/90 transition-colors duration-200
          "
        >
          Thêm giao dịch đầu tiên
        </Button>
      )}
    </div>
  );
}
