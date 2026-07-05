// ============================================================
// SAVING GOAL TYPES
// Phase 6 — Saving Goals Module
// ============================================================

export interface SavingDeposit {
  id: string;
  amount: string;
  note: string | null;
  depositedAt: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: string;
  savedAmount: string;
  progressPercentage: number;
  remainingAmount: string;
  deadline: string | null;
  isCompleted: boolean;
  note: string | null;
  deposits?: SavingDeposit[];
  createdAt?: string;
}

export interface CreateSavingGoalPayload {
  title: string;
  targetAmount: number;
  deadline?: string | null;
  note?: string | null;
}

export interface UpdateSavingGoalPayload {
  title?: string;
  targetAmount?: number;
  deadline?: string | null;
  note?: string | null;
}

export interface DepositSavingGoalPayload {
  amount: number;
  note?: string | null;
}

export type SavingGoalTabFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

// Query Filters
export interface SavingGoalFilters {
  isCompleted?: boolean;
}

// UI State Store
export interface SavingGoalUIState {
  activeTab: SavingGoalTabFilter;

  isCreateSheetOpen: boolean;

  isEditSheetOpen: boolean;
  editingGoal: SavingGoal | null;

  isDepositSheetOpen: boolean;
  depositingGoal: SavingGoal | null;

  isDeleteDialogOpen: boolean;
  deletingGoal: SavingGoal | null;
}

export interface SavingGoalUIActions {
  setActiveTab: (tab: SavingGoalTabFilter) => void;

  openCreateSheet: () => void;
  closeCreateSheet: () => void;

  openEditSheet: (goal: SavingGoal) => void;
  closeEditSheet: () => void;

  openDepositSheet: (goal: SavingGoal) => void;
  closeDepositSheet: () => void;

  openDeleteDialog: (goal: SavingGoal) => void;
  closeDeleteDialog: () => void;
}
