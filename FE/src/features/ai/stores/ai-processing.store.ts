import { create } from "zustand";


export type AiProcessingStep =
  | "idle"
  | "uploading"
  | "processing_ocr"
  | "processing_classification"
  | "review"
  | "error";

interface AiProcessingState {
  // Config
  isOpen: boolean;
  mode: "ocr" | "classification";
  step: AiProcessingStep;
  statusBadge: "Draft" | "Processing" | "Ready";

  // Data
  imageFile: File | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  // OCR Data
  ocrResultId: string | null;
  ocrData: any | null;

  // Classification Data
  classificationResult: any | null; // { categoryId, categoryName, title, tags, confidence }
  
  // OCR Form State (Chỉ dùng cho OCR)
  editableForm: {
    merchantName: string;
    totalAmount: number;
    transactionDate: string;
    category: string;
  };

  // Actions
  openDrawer: (mode?: "ocr" | "classification") => void;
  closeDrawer: () => void;
  setStep: (step: AiProcessingStep) => void;
  setImage: (file: File | null, url: string | null, publicId: string | null) => void;
  setOcrResultId: (id: string) => void;
  setOcrData: (data: any, ocrResultId: string) => void;
  setClassificationData: (data: any) => void;
  updateEditableForm: (data: Partial<AiProcessingState["editableForm"]>) => void;
  clearSession: () => void;
}

const initialState = {
  isOpen: false,
  mode: "ocr" as const,
  step: "idle" as AiProcessingStep,
  statusBadge: "Draft" as const,
  imageFile: null,
  imageUrl: null,
  imagePublicId: null,
  ocrData: null,
  ocrResultId: null,
  classificationResult: null,
  editableForm: {
    merchantName: "",
    totalAmount: 0,
    transactionDate: new Date().toISOString().split("T")[0],
    category: "",
  },
};

export const useAiProcessingStore = create<AiProcessingState>((set) => ({
  ...initialState,

  openDrawer: (mode = "ocr") => set({ isOpen: true, mode }),

  closeDrawer: () => set({ isOpen: false }),

  setStep: (step) => set({
    step,
    statusBadge: step === "review" ? "Ready" : (step === "idle" || step === "error" ? "Draft" : "Processing")
  }),

  setImage: (file, url, publicId) => set({
    imageFile: file,
    imageUrl: url,
    imagePublicId: publicId
  }),

  setOcrResultId: (id) => set({ ocrResultId: id }),

  setOcrData: (data, ocrResultId) => set((state) => ({
    ocrData: data,
    ocrResultId,
    // Auto-fill editable form with OCR data
    editableForm: {
      ...state.editableForm,
      merchantName: data.merchantName || "",
      category: data.categoryId || "",
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : 0,
      transactionDate: data.transactionDate
        ? new Date(data.transactionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
    step: "review",
    statusBadge: "Ready"
  })),

  setClassificationData: (data) => set((state) => ({
    classificationResult: data,
    editableForm: {
      ...state.editableForm,
      merchantName: data.suggestedTitle || "",
      category: data.suggestedCategoryId || "",
      totalAmount: 0,
      transactionDate: new Date().toISOString().split("T")[0],
    },
    step: "review",
    statusBadge: "Ready"
  })),

  updateEditableForm: (data) => set((state) => ({
    editableForm: { ...state.editableForm, ...data }
  })),

  clearSession: () => set(initialState),
}));
