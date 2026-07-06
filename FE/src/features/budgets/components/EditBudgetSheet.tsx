// ============================================================
// EDIT BUDGET SHEET
// Phase 5 — Budget Module
//
// Form sửa ngân sách. Category bị disabled (không cho phép đổi).
// Chỉ cho phép thay đổi limitAmount.
// ============================================================

import { useEffect } from "react";
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
import { AmountDisplay } from "@/features/transactions/components/AmountDisplay";

import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import { useUpdateBudget } from "@/features/budgets/hooks/useUpdateBudget";
import {
  editBudgetSchema,
  type EditBudgetFormValues,
} from "@/features/budgets/schemas/budget.schema";
import { getIconComponent } from "@/features/categories/constants/category-icons";

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
export function EditBudgetSheet() {
  const editingBudget = useBudgetStore((s) => s.editingBudget);
  const closeEditSheet = useBudgetStore((s) => s.closeEditSheet);
  const isOpen = !!editingBudget;

  const { mutate: updateBudget, isPending } = useUpdateBudget();

  const {
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<EditBudgetFormValues>({
    resolver: zodResolver(editBudgetSchema),
    defaultValues: {
      limitAmount: 0,
    },
  });

  // Sync data khi mở form
  useEffect(() => {
    if (editingBudget) {
      reset({
        limitAmount: editingBudget.limitAmount,
      });
    }
  }, [editingBudget, reset]);

  // Đóng form reset form tránh dính data cũ
  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const watchedAmount = watch("limitAmount");

  if (!editingBudget) return null;

  const CategoryIcon = getIconComponent(editingBudget.category.icon);

  const onSubmit = (data: EditBudgetFormValues) => {
    updateBudget({
      id: editingBudget.id,
      dto: {
        limitAmount: data.limitAmount,
      },
    });
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) closeEditSheet();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-card border-l border-border flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground">
            Chỉnh sửa ngân sách
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
            {/* Category (Disabled) */}
            <FieldRow label="Danh mục">
              <div className="flex items-center gap-3 p-2 bg-muted border border-border rounded-md cursor-not-allowed opacity-80">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: `${editingBudget.category.color}20` }}
                >
                  <CategoryIcon className="w-4 h-4" style={{ color: editingBudget.category.color }} />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {editingBudget.category.name}
                </span>
                <span className="ml-auto text-xs text-muted-foreground mr-1">
                  Không thể thay đổi
                </span>
              </div>
            </FieldRow>

            {/* Limit Amount */}
            <FieldRow label="Hạn mức mới (VND)" htmlFor="limitAmount">
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
              onClick={closeEditSheet}
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
                "Lưu thay đổi"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
