import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Sparkles, RotateCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAiInsights, useGenerateInsights } from "@/features/ai/hooks/useAi";
import { Button } from "@/components/ui/button";

import { AiInsightEmptyState } from "@/features/ai/components/AiInsightEmptyState";
import { AiInsightLoadingSteps } from "@/features/ai/components/AiInsightLoadingSteps";
import { AiInsightBlocks } from "@/features/ai/components/AiInsightBlocks";
import { ConfirmationDialog } from "@/features/ai/components/ConfirmationDialog";
import type { ParsedAiInsightContent } from "@/features/ai/types/ai.types";

export function AiInsightsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showConfirm, setShowConfirm] = useState(false);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: insights, isLoading: isFetching, isError, refetch } = useAiInsights(month, year);
  const { mutate: generate, isPending: isGenerating } = useGenerateInsights();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleGenerate = () => {
    setShowConfirm(false);
    generate(
      { month, year },
      {
        onSuccess: () => {
          refetch(); // Tải lại sau khi sinh xong
        },
      }
    );
  };

  let parsedContent: ParsedAiInsightContent | null = null;
  if (insights?.content) {
    try {
      parsedContent = JSON.parse(insights.content);
    } catch (e) {
      // Fallback nếu AI trả về markdown thay vì JSON
      parsedContent = {
        overview: insights.content,
        risks: [],
        recommendations: [],
        actions: []
      };
    }
  }

  const isWorking = isFetching || isGenerating;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#37352F] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600" />
            AI Insights
          </h1>
          <p className="text-sm text-[#9B9A97] mt-1">
            Phân tích chuyên sâu về tình hình tài chính của bạn bởi AI.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-[#F7F6F3] border border-[#E8E7E5] rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              disabled={isWorking}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-medium text-[#37352F] min-w-[110px] text-center select-none">
              Tháng {month}, {year}
            </span>

            <button
              onClick={nextMonth}
              disabled={isWorking || (month === new Date().getMonth() + 1 && year === new Date().getFullYear())}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#9B9A97] hover:text-[#37352F] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352F] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Generate Button (nếu đã có insight) */}
          {insights && !isWorking && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="h-10 bg-white border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3]"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Phân tích lại
            </Button>
          )}

          {isWorking && (
            <Button disabled variant="outline" size="sm" className="h-10 bg-[#F7F6F3] text-[#9B9A97] border-[#E8E7E5]">
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[#E8E7E5] shadow-sm flex flex-col relative overflow-hidden min-h-[500px]">
        {/* Magic gradient border top */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400" />

        <div className="p-6 md:p-8 flex-1">
          {isGenerating ? (
            <AiInsightLoadingSteps />
          ) : isFetching ? (
            <div className="h-full flex flex-col items-center justify-center text-[#9B9A97] gap-3 pt-20 min-h-[400px]">
              <RotateCw className="w-8 h-8 animate-spin text-violet-500" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : isError ? (
            <div className="h-full flex flex-col items-center justify-center text-[#9B9A97] gap-3 pt-20 min-h-[400px]">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p>Không thể tải phân tích AI. Vui lòng thử lại sau.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử lại
              </Button>
            </div>
          ) : !insights || !parsedContent ? (
            <AiInsightEmptyState
              isGenerating={false}
              onGenerate={() => setShowConfirm(true)}
            />
          ) : (
            <div>
              {/* Cache Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Đã phân tích
                </span>
                <span className="text-xs text-[#9B9A97]">
                  {format(new Date(insights.generatedAt), "HH:mm, dd/MM/yyyy", { locale: vi })}
                </span>
                {insights.isCached && (
                  <span className="text-xs text-[#9B9A97] px-2 border-l border-[#E8E7E5]">
                    (Dữ liệu cache 24h)
                  </span>
                )}
              </div>

              {/* Blocks */}
              <AiInsightBlocks content={parsedContent} />
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleGenerate}
      />
    </div>
  );
}
