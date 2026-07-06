
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({ open, onOpenChange, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border shadow-lg rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            Tạo AI Insight?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            AI sẽ phân tích toàn bộ dữ liệu tài chính của tháng này.
            Nếu dữ liệu vừa được cập nhật, việc phân tích lại sẽ tạo ra kết quả mới.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-transparent border-t-0 p-0 sm:justify-end gap-2 p-4">
          <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Bắt đầu phân tích
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
