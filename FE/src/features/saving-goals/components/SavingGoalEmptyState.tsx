import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavingGoalEmptyStateProps {
  variant?: "empty" | "filtered";
  onCreateClick?: () => void;
}

export function SavingGoalEmptyState({ variant = "empty", onCreateClick }: SavingGoalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-xl border border-border shadow-sm">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {variant === "empty" ? (
          <span className="text-3xl">🎯</span>
        ) : (
          <Target className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {variant === "empty" ? "Bạn chưa tạo mục tiêu nào" : "Không tìm thấy mục tiêu nào"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm leading-relaxed">
        {variant === "empty"
          ? "Thiết lập mục tiêu tiết kiệm sẽ tạo động lực và giúp bạn nhanh chóng đạt được những dự định tài chính của mình."
          : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
      </p>
      {onCreateClick && variant === "empty" && (
        <Button
          onClick={onCreateClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Tạo mục tiêu đầu tiên
        </Button>
      )}
    </div>
  );
}
