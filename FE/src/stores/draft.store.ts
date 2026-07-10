import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DraftFeature = "transaction" | "category" | "budget" | "savingGoal";

export interface Draft<T = any> {
  draftId: string;
  feature: DraftFeature;
  formData: T;
  createdAt: number;
  updatedAt: number;
  isDirty: boolean;
}

interface DraftState {
  drafts: Partial<Record<DraftFeature, Draft>>;
}

interface DraftActions {
  saveDraft: <T>(feature: DraftFeature, formData: T, isDirty: boolean) => void;
  clearDraft: (feature: DraftFeature) => void;
  getDraft: <T>(feature: DraftFeature) => Draft<T> | undefined;
  hasDraft: (feature: DraftFeature) => boolean;
}

export const useDraftStore = create<DraftState & DraftActions>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (feature, formData, isDirty) => {
        if (!isDirty) {
          // If the form is not dirty (e.g. user manually cleared everything back to default),
          // we can clear the draft.
          get().clearDraft(feature);
          return;
        }
        set((state) => ({
          drafts: {
            ...state.drafts,
            [feature]: {
              draftId: state.drafts[feature]?.draftId || crypto.randomUUID(),
              feature,
              formData,
              createdAt: state.drafts[feature]?.createdAt || Date.now(),
              updatedAt: Date.now(),
              isDirty,
            },
          },
        }));
      },
      clearDraft: (feature) => {
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[feature];
          return { drafts: newDrafts };
        });
      },
      getDraft: (feature) => get().drafts[feature],
      hasDraft: (feature) => !!get().drafts[feature],
    }),
    {
      name: "smart-expense-drafts",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
