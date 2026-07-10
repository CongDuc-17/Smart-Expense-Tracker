import { useDraftStore, type DraftFeature } from "@/stores/draft.store";
import { SquarePen } from "lucide-react";

interface DraftBarProps {
  feature: DraftFeature;
  title: string;
  onResume: () => void;
}

export function DraftBar({ feature, title, onResume }: DraftBarProps) {
  const hasDraft = useDraftStore((state) => state.hasDraft(feature));
  const clearDraft = useDraftStore((state) => state.clearDraft);

  if (!hasDraft) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2.5 px-4 mb-4 text-sm bg-muted/30 border border-border rounded-lg text-muted-foreground transition-all duration-200 gap-2 sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none"><SquarePen /></span>
        <span>Bạn có một bản nháp <strong>{title}</strong> chưa hoàn thành.</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResume}
          className="font-medium text-foreground hover:underline transition-colors"
        >
          Tiếp tục chỉnh sửa
        </button>
        <span className="text-border text-xs">|</span>
        <button
          onClick={() => clearDraft(feature)}
          className="hover:text-destructive transition-colors"
        >
          Hủy bản nháp
        </button>
      </div>
    </div>
  );
}
