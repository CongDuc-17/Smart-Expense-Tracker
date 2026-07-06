import { SparklesIcon, ArrowRightIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiProcessingStore } from "../stores/ai-processing.store";

export function AiResumeBanner() {
  const store = useAiProcessingStore();

  // Show banner if there's a draft session and drawer is closed
  const hasDraft = store.step !== "idle" && !store.isOpen;

  if (!hasDraft) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-lg border border-indigo-200 bg-indigo-500/10 text-indigo-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-md">
          <SparklesIcon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-indigo-900">Tiến trình AI đang tạm dừng</h4>
          <p className="text-xs text-indigo-700 mt-0.5">
            Bạn có một hóa đơn đang được xử lý hoặc chờ xác nhận.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => store.clearSession()}
          className="text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 h-8 px-2"
        >
          <XIcon className="w-4 h-4 mr-1" />
          Hủy
        </Button>
        <Button 
          size="sm" 
          onClick={() => store.openDrawer()}
          className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground shadow-sm h-8"
        >
          Tiếp tục
          <ArrowRightIcon className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
