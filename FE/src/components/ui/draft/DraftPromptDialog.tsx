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

interface DraftPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onResume: () => void;
  onDiscard: () => void;
}

export function DraftPromptDialog({
  isOpen,
  onOpenChange,
  title,
  onResume,
  onDiscard,
}: DraftPromptDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Bản nháp chưa hoàn thành</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đang có một <strong>{title}</strong> đang tạo dở. Bạn muốn tiếp tục chỉnh sửa bản nháp này hay xóa bản nháp và tạo một cái hoàn toàn mới?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <AlertDialogCancel onClick={onDiscard} className="mt-0 sm:mt-0">
            Bỏ nháp & Tạo mới
          </AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>
            Tiếp tục bản nháp
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
