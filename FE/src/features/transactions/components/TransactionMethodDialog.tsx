// ============================================================
// TransactionMethodDialog — Chọn phương thức tạo giao dịch
// ============================================================

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PenLine, Camera, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectManual: () => void;
  onSelectAiImage: () => void;
  onSelectOcr: () => void;
}

export function TransactionMethodDialog({
  open,
  onOpenChange,
  onSelectManual,
  onSelectAiImage,
  onSelectOcr,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="px-6 py-5 pb-3">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Thêm giao dịch
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bạn muốn tạo giao dịch bằng cách nào?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col p-3 space-y-1 bg-muted">
          <button
            onClick={() => {
              onSelectManual();
            }}
            className="flex items-start gap-4 p-4 text-left bg-card rounded-lg border border-border hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <PenLine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Nhập thủ công</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Tự điền thông tin giao dịch truyền thống.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAiImage();
            }}
            className="flex items-start gap-4 p-4 text-left bg-card rounded-lg border border-border hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-fuchsia-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">AI từ ảnh</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Chụp món ăn, đồ vật... AI sẽ tự động chọn danh mục phù hợp.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOcr();
            }}
            className="flex items-start gap-4 p-4 text-left bg-card rounded-lg border border-border hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Quét hóa đơn</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Trích xuất số tiền, ngày tháng, merchant từ hóa đơn.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
