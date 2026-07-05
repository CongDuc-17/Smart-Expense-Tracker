import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onGenerate: () => void;
  isGenerating: boolean;
}

export function AiInsightEmptyState({ onGenerate, isGenerating }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-[#E8E7E5] rounded-xl bg-[#F7F6F3] bg-opacity-50 min-h-[400px]">
      <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-violet-600" />
      </div>
      <h3 className="text-lg font-semibold text-[#37352F] mb-2">
        AI chưa phân tích tháng này
      </h3>
      <p className="text-sm text-[#9B9A97] max-w-md mx-auto mb-6">
        Nhấn "Phân tích AI" để trợ lý AI tổng hợp dữ liệu, đánh giá tình hình tài chính 
        và đưa ra lời khuyên thiết thực dựa trên số liệu thực tế.
      </p>
      <Button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="bg-[#37352F] text-white hover:bg-[#2f2d28] transition-all shadow-sm"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Phân tích AI
      </Button>
    </div>
  );
}
