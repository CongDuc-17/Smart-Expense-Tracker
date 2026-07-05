// ============================================================
// SAVING GOAL STORE (ZUSTAND)
// Phase 6 — Saving Goals Module
// ============================================================

import { create } from "zustand";
import type { SavingGoalUIState, SavingGoalUIActions, SavingGoalTabFilter, SavingGoal } from "@/features/saving-goals/types/saving-goal.types";

const initialState: SavingGoalUIState = {
  activeTab: "ALL",
  
  isCreateSheetOpen: false,
  
  isEditSheetOpen: false,
  editingGoal: null,

  isDepositSheetOpen: false,
  depositingGoal: null,

  isDeleteDialogOpen: false,
  deletingGoal: null,
};

export const useSavingGoalStore = create<SavingGoalUIState & SavingGoalUIActions>()((set) => ({
  ...initialState,

  setActiveTab: (tab: SavingGoalTabFilter) => set({ activeTab: tab }),

  openCreateSheet: () => set({ isCreateSheetOpen: true }),
  closeCreateSheet: () => set({ isCreateSheetOpen: false }),

  openEditSheet: (goal: SavingGoal) => set({ isEditSheetOpen: true, editingGoal: goal }),
  closeEditSheet: () => set({ isEditSheetOpen: false, editingGoal: null }),

  openDepositSheet: (goal: SavingGoal) => set({ isDepositSheetOpen: true, depositingGoal: goal }),
  closeDepositSheet: () => set({ isDepositSheetOpen: false, depositingGoal: null }),

  openDeleteDialog: (goal: SavingGoal) => set({ isDeleteDialogOpen: true, deletingGoal: goal }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, deletingGoal: null }),
}));
