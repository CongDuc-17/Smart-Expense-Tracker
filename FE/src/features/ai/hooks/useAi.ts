import { useQuery, useMutation } from "@tanstack/react-query";
import { aiService } from "../services/ai.service";

export const useScanReceipt = () => {
  return useMutation({
    mutationFn: (file: File) => aiService.scanReceipt(file),
  });
};
export const usePreviewClassification = () => {
  return useMutation({
    mutationFn: (imageUrl: string) => aiService.previewClassification(imageUrl),
  });
};

export const useOcrResult = (ocrResultId?: string | null) => {
  return useQuery({
    queryKey: ["ocrResult", ocrResultId],
    queryFn: () => aiService.getOcrResult(ocrResultId!),
    enabled: !!ocrResultId,
    // Poll every 2 seconds if status is PENDING or PROCESSING
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "PENDING" || data.status === "PROCESSING")) {
        return 2000;
      }
      return false;
    },
  });
};

export const useImageAnalysis = (expenseId?: string | null) => {
  return useQuery({
    queryKey: ["imageAnalysis", expenseId],
    queryFn: () => aiService.getImageAnalysis(expenseId!),
    enabled: !!expenseId,
    retry: false,
  });
};

export const useAiInsights = (month: number, year: number) => {
  return useQuery({
    queryKey: ["aiInsights", month, year],
    queryFn: () => aiService.getInsights(month, year),
  });
};

export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      aiService.generateInsights(month, year),
  });
};
