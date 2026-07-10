// ============================================================
// SavingGoalsPage — Feature Page
// Phase 6 — Saving Goals Module
// Route: /savings
// ============================================================

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavingGoalList } from "@/features/saving-goals/components/SavingGoalList";
import { SavingGoalSkeleton } from "@/features/saving-goals/components/SavingGoalSkeleton";
import { SavingGoalEmptyState } from "@/features/saving-goals/components/SavingGoalEmptyState";
import { SavingGoalSummary } from "@/features/saving-goals/components/SavingGoalSummary";
import { SavingGoalSheet } from "@/features/saving-goals/components/SavingGoalSheet";
import { DepositSheet } from "@/features/saving-goals/components/DepositSheet";
import { DeleteSavingGoalDialog } from "@/features/saving-goals/components/DeleteSavingGoalDialog";

import { useSavingGoals } from "@/features/saving-goals/hooks/useSavingGoals";
import { useSavingGoalStore } from "@/features/saving-goals/stores/saving-goal.store";
import type { SavingGoal } from "@/features/saving-goals/types/saving-goal.types";
import { DraftBar } from "@/components/ui/draft/DraftBar";
import { DraftPromptDialog } from "@/components/ui/draft/DraftPromptDialog";
import { useDraftStore } from "@/stores/draft.store";

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-lg border border-border bg-muted text-sm text-foreground" role="alert">
      <span>Không thể tải mục tiêu tiết kiệm. Vui lòng thử lại.</span>
      <button onClick={onRetry} className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-foreground/80 transition-colors duration-150 ml-4">
        Thử lại
      </button>
    </div>
  );
}

export function SavingGoalsPage() {
  const {
    activeTab,
    openCreateSheet,
    openEditSheet,
    openDepositSheet,
    openDeleteDialog,
  } = useSavingGoalStore();

  const { savingGoals, isLoading, isError, refetch } = useSavingGoals({
    activeTab,
  });

  const { hasDraft, clearDraft } = useDraftStore();
  const [isDraftPromptOpen, setIsDraftPromptOpen] = useState(false);

  const isFiltered = activeTab !== "ALL";
  const isEmpty = !isLoading && savingGoals.length === 0;

  const handleEdit = (g: SavingGoal) => openEditSheet(g);
  const handleDeposit = (g: SavingGoal) => openDepositSheet(g);
  const handleDelete = (g: SavingGoal) => openDeleteDialog(g);

  const handleCreateClick = () => {
    if (hasDraft("savingGoal")) {
      setIsDraftPromptOpen(true);
    } else {
      openCreateSheet();
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Mục tiêu tiết kiệm
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-5">
              Đặt mục tiêu và theo dõi tiến độ tích lũy của bạn
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            size="sm"
            className="bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-colors duration-150 flex items-center gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" />
            Thêm mục tiêu
          </Button>
        </div>

        <DraftBar 
          feature="savingGoal" 
          title="Mục tiêu tiết kiệm" 
          onResume={() => openCreateSheet()} 
        />

        {/* Summary */}
        {!isLoading && !isError && <SavingGoalSummary goals={savingGoals} />}

        {/* Error */}
        {isError && <ErrorBanner onRetry={refetch} />}

        {/* Content */}
        {isLoading ? (
          <SavingGoalSkeleton count={3} />
        ) : isEmpty ? (
          <SavingGoalEmptyState
            variant={isFiltered ? "filtered" : "empty"}
            onCreateClick={!isFiltered ? handleCreateClick : undefined}
          />
        ) : (
          <SavingGoalList
            goals={savingGoals}
            onEdit={handleEdit}
            onDeposit={handleDeposit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Overlays */}
      <SavingGoalSheet />
      <DepositSheet />
      <DeleteSavingGoalDialog />
      <DraftPromptDialog
        isOpen={isDraftPromptOpen}
        onOpenChange={setIsDraftPromptOpen}
        title="mục tiêu tiết kiệm"
        onResume={() => {
          setIsDraftPromptOpen(false);
          openCreateSheet();
        }}
        onDiscard={() => {
          setIsDraftPromptOpen(false);
          clearDraft("savingGoal");
          openCreateSheet();
        }}
      />
    </div>
  );
}
