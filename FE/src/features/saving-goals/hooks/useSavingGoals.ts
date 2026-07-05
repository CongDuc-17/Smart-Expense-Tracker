// ============================================================
// useSavingGoals — TanStack Query Data Hook
// Phase 6 — Saving Goals Module
// ============================================================

import { useQueries } from "@tanstack/react-query";
import { savingGoalService } from "@/features/saving-goals/services/saving-goal.service";
import type { SavingGoalTabFilter, SavingGoal } from "@/features/saving-goals/types/saving-goal.types";

export const savingGoalKeys = {
  all: ["saving-goals"] as const,
  lists: () => [...savingGoalKeys.all, "list"] as const,
  list: (filter: string) => [...savingGoalKeys.lists(), filter] as const,
  detail: (id: string) => [...savingGoalKeys.all, "detail", id] as const,
} as const;

interface UseSavingGoalsOptions {
  activeTab: SavingGoalTabFilter;
  enabled?: boolean;
}

export function useSavingGoals({ activeTab, enabled = true }: UseSavingGoalsOptions) {
  // Map tab sang filter `isCompleted`
  // ALL -> gọi 2 endpoints: isCompleted=false, isCompleted=true
  // IN_PROGRESS -> isCompleted=false
  // COMPLETED -> isCompleted=true
  
  const filtersToFetch = activeTab === "ALL" 
    ? [{ isCompleted: false }, { isCompleted: true }] 
    : activeTab === "IN_PROGRESS" 
      ? [{ isCompleted: false }] 
      : [{ isCompleted: true }];

  const results = useQueries({
    queries: filtersToFetch.map((filter) => ({
      queryKey: savingGoalKeys.list(filter.isCompleted !== undefined ? String(filter.isCompleted) : "all"),
      queryFn: () => savingGoalService.getList(filter),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled,
      retry: (failureCount: number, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const error = results.find((r) => r.error)?.error;

  const savingGoals: SavingGoal[] = results
    .flatMap((r) => r.data?.data ?? [])
    // Sort logic (can be updated later if needed)
    .sort((a, b) => new Date(a.deadline || "").getTime() - new Date(b.deadline || "").getTime());

  return {
    savingGoals,
    isLoading,
    isError,
    error,
    refetch: () => results.forEach((r) => r.refetch()),
  };
}
