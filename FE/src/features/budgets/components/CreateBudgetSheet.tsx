// ============================================================
// CREATE BUDGET SHEET
// Phase 5 — Budget Module
//
// Form tạo ngân sách mới (Slide từ bên phải).
// Chỉ hiển thị các danh mục thuộc loại EXPENSE.
// ============================================================

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/features/transactions/components/CategorySelect";
import { AmountDisplay } from "@/features/transactions/components/AmountDisplay";

import { useBudgetStore, selectBudgetFilters } from "@/features/budgets/stores/budget.store";
import { useShallow } from "zustand/react/shallow";
import { useCreateBudget } from "@/features/budgets/hooks/useCreateBudget";
import {
  createBudgetSchema,
  type CreateBudgetFormValues,
} from "@/features/budgets/schemas/budget.schema";
import { useDraftStore } from "@/stores/draft.store";

// ---------------------------------------------------------------
// Helper FieldRow
// ---------------------------------------------------------------
function FieldRow({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 leading-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------
export function CreateBudgetSheet() {
  const isCreateSheetOpen = useBudgetStore((s) => s.isCreateSheetOpen);
  const closeCreateSheet = useBudgetStore((s) => s.closeCreateSheet);
  const { month, year } = useBudgetStore(useShallow(selectBudgetFilters));

  const { mutate: createBudget, isPending } = useCreateBudget();
  const saveDraft = useDraftStore((s) => s.saveDraft);
  const clearDraft = useDraftStore((s) => s.clearDraft);

  const defaultFormValues = useMemo<CreateBudgetFormValues>(() => ({
    categoryId: "",
    limitAmount: 0,
    month,
    year,
  }), [month, year]);

  const {
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: defaultFormValues,
  });

  // Sync default values khi form mở (load draft hoặc reset)
  useEffect(() => {
    if (isCreateSheetOpen) {
      const draft = useDraftStore.getState().getDraft<CreateBudgetFormValues>("budget");
      if (draft) {
        reset(draft.formData);
      } else {
        reset(defaultFormValues);
      }
    }
  }, [isCreateSheetOpen, reset, defaultFormValues]);

  const watchedValues = watch();
  const watchedAmount = watchedValues.limitAmount;
  const watchedValuesString = JSON.stringify(watchedValues);
  const defaultValuesString = JSON.stringify(defaultFormValues);

  // Save draft on change
  useEffect(() => {
    if (!isCreateSheetOpen) return;
    const isDirty = watchedValuesString !== defaultValuesString;
    saveDraft("budget", JSON.parse(watchedValuesString), isDirty);
  }, [watchedValuesString, defaultValuesString, isCreateSheetOpen, saveDraft]);

  const onSubmit = (data: CreateBudgetFormValues) => {
    createBudget(data, {
      onSuccess: () => {
        clearDraft("budget");
        reset(defaultFormValues);
      }
    });
  };

  return (
    <Sheet
      open={isCreateSheetOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) closeCreateSheet();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-card border-l border-border flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground">
            Tạo ngân sách tháng {month}/{year}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
            {/* Category */}
            <FieldRow label="Danh mục" error={errors.categoryId?.message}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelect
                    type="EXPENSE" // Ngân sách chỉ áp dụng cho chi tiêu
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </FieldRow>

            {/* Limit Amount */}
            <FieldRow label="Hạn mức (VND)" htmlFor="limitAmount">
              <Controller
                control={control}
                name="limitAmount"
                render={({ field }) => (
                  <Input
                    id="limitAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    disabled={isPending}
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      field.onChange(isNaN(raw) ? 0 : raw);
                    }}
                    className="
                      h-9 text-sm bg-card border-border text-foreground
                      placeholder:text-muted-foreground
                      focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:border-ring
                      transition-all duration-150
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />
                )}
              />
              {errors.limitAmount?.message && (
                <p className="text-xs text-red-500 mt-1 leading-4" role="alert">
                  {errors.limitAmount.message}
                </p>
              )}
              {/* Preview */}
              {watchedAmount > 0 && (
                <AmountDisplay
                  amount={watchedAmount}
                  type="EXPENSE"
                  size="sm"
                  className="mt-1"
                />
              )}
            </FieldRow>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border flex flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={closeCreateSheet}
              className="flex-1 bg-muted text-foreground border border-border hover:bg-secondary text-sm font-medium transition-colors duration-150"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors duration-150 disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                "Lưu ngân sách"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
