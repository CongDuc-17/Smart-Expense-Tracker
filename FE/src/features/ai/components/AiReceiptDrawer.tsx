import React, { useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, AlertCircle, ScanLine, SparklesIcon, CheckCircle2, HelpCircle } from "lucide-react";
import { useAiProcessingStore } from "../stores/ai-processing.store";
import { useScanReceipt, useOcrResult, usePreviewClassification } from "../hooks/useAi";
import { uploadService } from "@/features/upload/services/upload.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// import { useQueryClient } from "@tanstack/react-query";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import { CategorySelect } from "@/features/transactions/components/CategorySelect";

export function AiReceiptDrawer() {
  const store = useAiProcessingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanMutation = useScanReceipt();
  const { mutateAsync: analyzeImage } = usePreviewClassification();
  const { data: ocrData } = useOcrResult(store.ocrResultId);
  // const queryClient = useQueryClient();

  // Watch OCR polling
  useEffect(() => {
    if (ocrData?.status === "COMPLETED" && store.step === "processing_ocr") {
      store.setOcrData(ocrData, store.ocrResultId!);
    } else if (ocrData?.status === "FAILED" && store.step === "processing_ocr") {
      store.setStep("error");
    }
  }, [ocrData, store.step]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      // Create Object URL for instant preview
      const previewUrl = URL.createObjectURL(file);
      store.setImage(file, previewUrl, null);
      store.setStep("uploading");

      // Upload to Cloudinary
      const uploadResult = await uploadService.uploadImage(file, "expense");
      store.setImage(file, uploadResult.url, uploadResult.publicId);

      if (store.mode === "ocr") {
        store.setStep("processing_ocr");
        const scanResult = await scanMutation.mutateAsync(file);
        store.setOcrResultId(scanResult.ocrResultId);
      } else {
        store.setStep("processing_classification");
        const result = await analyzeImage(uploadResult.url);
        if (result.suggestedCategoryId) {
          store.setClassificationData(result);
        } else {
          store.setStep("error");
        }
      }

    } catch (error) {
      console.error("Lỗi AI Assistant:", error);
      store.setStep("error");
      toast.error("Xảy ra lỗi trong quá trình phân tích hóa đơn.");
    } finally {
      e.target.value = "";
    }
  };

  const handleCancel = () => {
    if (store.step === "review") {
      // Suggest Draft
      if (window.confirm("Bạn muốn lưu kết quả dưới dạng bản nháp và tiếp tục sau?")) {
        store.closeDrawer();
      } else {
        store.clearSession();
      }
    } else {
      store.closeDrawer();
    }
  };

  const handleSubmit = () => {
    if (store.step !== "review") return;
    const { openCreateSheetWithPrefill } = useTransactionStore.getState();

    openCreateSheetWithPrefill({
      amount: store.editableForm.totalAmount,
      title: store.editableForm.merchantName || "Chi tiêu từ hóa đơn",
      date: store.editableForm.transactionDate,
      categoryId: store.editableForm.category || undefined,
      note: store.mode === "classification" && store.classificationResult?.tags?.length
        ? store.classificationResult.tags.map((t: string) => `#${t}`).join(" ")
        : undefined,
      imageUrl: store.imageUrl || undefined,
      imagePublicId: store.imagePublicId || undefined
    }, "EXPENSE");

    store.clearSession();
  };

  const renderConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI rất tự tin
        </div>
      );
    }
    if (confidence >= 0.7) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 text-amber-700 rounded-md text-xs font-medium border border-amber-100">
          <AlertCircle className="w-3.5 h-3.5" />
          AI gợi ý - Bạn có thể đổi lại
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-destructive/10 text-destructive text-red-700 rounded-md text-xs font-medium border border-red-100">
        <HelpCircle className="w-3.5 h-3.5" />
        AI chưa chắc chắn, vui lòng kiểm tra
      </div>
    );
  };

  return (
    <Sheet open={store.isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent className="sm:max-w-[560px] w-full p-0 flex flex-col bg-background border-l-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
          <SheetTitle className="flex items-center gap-2 text-lg text-foreground">
            <SparklesIcon className={cn("w-5 h-5", store.mode === "classification" ? "text-fuchsia-500" : "text-indigo-500")} />
            {store.mode === "classification" ? "AI Phân tích Hình ảnh" : "AI Receipt Assistant"}
          </SheetTitle>
          <div className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            store.statusBadge === "Draft" ? "bg-muted text-muted-foreground border-border" :
              store.statusBadge === "Processing" ? "bg-amber-500/10 text-amber-500 text-amber-600 border-amber-200" :
                "bg-emerald-500/10 text-emerald-500 text-emerald-600 border-emerald-200"
          )}>
            {store.statusBadge}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. Progress Steps */}
          {store.step !== "idle" && store.step !== "error" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span className={cn(store.step === "uploading" ? (store.mode === "classification" ? "text-fuchsia-600" : "text-indigo-600") : "text-foreground")}>① Upload</span>
              <span className="text-muted-foreground">-</span>
              <span className={cn((store.step === "processing_ocr" || store.step === "processing_classification") ? (store.mode === "classification" ? "text-fuchsia-600 animate-pulse" : "text-indigo-600 animate-pulse") : store.step === "review" ? "text-foreground" : "")}>② {store.mode === "classification" ? "Phân tích Ảnh" : "Trích xuất OCR"}</span>
              <span className="text-muted-foreground">-</span>
              <span className={cn(store.step === "review" ? (store.mode === "classification" ? "text-fuchsia-600" : "text-indigo-600") : "")}>③ Review</span>
            </div>
          )}

          {/* 2. Upload Prompt (Idle state) */}
          {store.step === "idle" && (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-xl bg-muted hover:bg-muted transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Click để tải ảnh hóa đơn</p>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">Hỗ trợ JPG, PNG. Khuyên dùng ảnh rõ nét.</p>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            </div>
          )}

          {/* 3. Image Preview (Sticky-like at top if reviewing) */}
          {store.imageUrl && (
            <div className="w-full rounded-xl overflow-hidden border border-border bg-muted relative flex-shrink-0" style={{ maxHeight: store.step === "review" ? "200px" : "auto" }}>
              <img src={store.imageUrl} alt="Receipt Preview" className="w-full h-full object-contain" />
              {(store.step === "uploading" || store.step === "processing_ocr" || store.step === "processing_classification") && (
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-border rounded-full"></div>
                    <div className={cn("absolute inset-0 border-4 rounded-full border-t-transparent animate-spin", store.mode === "classification" ? "border-fuchsia-500" : "border-indigo-500")}></div>
                    <ScanLine className={cn("absolute inset-0 m-auto w-6 h-6 animate-pulse", store.mode === "classification" ? "text-fuchsia-500" : "text-indigo-500")} />
                  </div>
                  <p className="text-sm font-medium text-foreground">AI đang phân tích hóa đơn...</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Error State */}
          {store.step === "error" && (
            <div className="flex flex-col items-center justify-center p-6 bg-destructive/10 text-destructive border border-red-100 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-sm font-medium text-red-800 mb-1">{store.mode === "classification" ? "Không thể phân tích ảnh" : "Không thể đọc hóa đơn"}</p>
              <p className="text-xs text-red-600 text-center mb-4">{store.mode === "classification" ? "AI không nhận diện được danh mục từ ảnh này." : "AI không nhận diện được dữ liệu từ ảnh này."}</p>
              <Button onClick={() => store.clearSession()} variant="outline" size="sm" className="bg-card">
                Thử ảnh khác
              </Button>
            </div>
          )}

          {/* 5. Review Editable Form (Unified for both modes) */}
          {store.step === "review" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Message */}
              <div className={cn("p-3 border rounded-lg flex items-start gap-3", store.mode === "classification" ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-100" : "bg-indigo-500/10 text-indigo-500 border-indigo-100")}>
                <SparklesIcon className={cn("w-5 h-5 mt-0.5 shrink-0", store.mode === "classification" ? "text-fuchsia-500" : "text-indigo-500")} />
                <div>
                  <p className={cn("text-sm font-medium", store.mode === "classification" ? "text-fuchsia-900" : "text-indigo-900")}>
                    {store.mode === "classification" ? "AI đã phân tích hình ảnh" : "AI đã trích xuất dữ liệu"}
                  </p>
                  <p className={cn("text-xs mt-0.5", store.mode === "classification" ? "text-fuchsia-700" : "text-indigo-700")}>
                    Vui lòng kiểm tra lại độ chính xác trước khi xác nhận.
                  </p>
                </div>
              </div>

              {/* Classification Info: Badge & Tags */}
              {store.mode === "classification" && store.classificationResult && (
                <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Danh mục gợi ý:</span>
                    <span className="text-sm font-semibold text-fuchsia-600">{store.classificationResult.suggestedCategoryName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {renderConfidenceBadge(store.classificationResult.confidence)}
                  </div>
                  {store.classificationResult.tags && store.classificationResult.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border mt-1">
                      {store.classificationResult.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 bg-card border border-border rounded-full text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Editable Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="merchantName" className="text-foreground">{store.mode === "classification" ? "Tiêu đề (Tên giao dịch)" : "Tên cửa hàng"}</Label>
                  <Input
                    id="merchantName"
                    value={store.editableForm.merchantName}
                    onChange={(e) => store.updateEditableForm({ merchantName: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-foreground">Số tiền (đ)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={store.editableForm.totalAmount || ""}
                    onChange={(e) => store.updateEditableForm({ totalAmount: Number(e.target.value) })}
                    className="bg-card border-border font-semibold text-emerald-600"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">Danh mục</Label>
                  <CategorySelect
                    type="EXPENSE"
                    value={store.editableForm.category}
                    onChange={(val) => store.updateEditableForm({ category: val })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionDate" className="text-foreground">Ngày giao dịch</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={store.editableForm.transactionDate}
                    onChange={(e) => store.updateEditableForm({ transactionDate: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/50 flex items-center justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={handleCancel} className="text-muted-foreground hover:bg-muted/80">
            {store.step === "review" ? "Lưu Nháp" : "Đóng"}
          </Button>

          {store.step === "review" && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Xác nhận & Điền form
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
