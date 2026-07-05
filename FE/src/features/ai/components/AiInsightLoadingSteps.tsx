import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  "Đang đọc dữ liệu...",
  "Đang phân tích chi tiêu...",
  "Đang đánh giá ngân sách...",
  "Đang sinh lời khuyên..."
];

export function AiInsightLoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Giả lập tiến trình (Mỗi bước mất 1-2s)
    if (currentStep < STEPS.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500); // Mất khoảng 4.5s cho 3 bước
      return () => clearTimeout(timeout);
    }
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white min-h-[400px]">
      <div className="max-w-xs w-full space-y-6">
        <h3 className="text-lg font-semibold text-[#37352F] text-center mb-6">
          AI đang phân tích
        </h3>
        
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  isCompleted ? "text-emerald-600" : isActive ? "text-[#37352F] font-medium" : "text-[#9B9A97]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 opacity-50" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
