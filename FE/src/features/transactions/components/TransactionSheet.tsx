// ============================================================
// TransactionSheet — Create & Edit Sheet
// Phase 3 — Expense & Income Module
//
// Create mode: type selector → filter categories → submit
// Edit mode:   type disabled, các field còn lại editable
// ============================================================

import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/features/transactions/components/CategorySelect";
import { AmountDisplay } from "@/features/transactions/components/AmountDisplay";
import { ImageUpload } from "@/components/ui/image-upload";
import { TransactionMethodDialog } from "@/features/transactions/components/TransactionMethodDialog";
import { useTransactionStore } from "@/features/transactions/stores/transaction.store";
import { useCreateTransaction } from "@/features/transactions/hooks/useCreateTransaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/useUpdateTransaction";
import { useImageAnalysis } from "@/features/ai/hooks/useAi";
import {
  createTransactionSchema,
  editTransactionSchema,
  type CreateTransactionFormValues,
  type EditTransactionFormValues,
} from "@/features/transactions/schemas/transaction.schema";
import type { TransactionType } from "@/features/transactions/types/transaction.types";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Format Date → "YYYY-MM-DD" cho HTML input[type=date] */
function toDateInputValue(isoString: string): string {
  return new Date(isoString).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" → ISO string */
function toISOString(dateInput: string): string {
  return new Date(dateInput).toISOString();
}

/** Date hiện tại dạng "YYYY-MM-DD" */
function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------
// Shared field row
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
      <Label htmlFor={htmlFor} className="text-sm font-medium text-[#37352F]">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 leading-4" role="alert">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Amount Input (controlled, stores as number)
// ---------------------------------------------------------------

function AmountInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: number | undefined;
  onChange: (val: number) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Input
        id="amount"
        type="number"
        inputMode="numeric"
        placeholder="0"
        disabled={disabled}
        value={value === undefined || value === 0 ? "" : value}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          onChange(isNaN(raw) ? 0 : raw);
        }}
        className="
          h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F]
          placeholder:text-[#9B9A97]
          focus-visible:ring-2 focus-visible:ring-[#37352F]
          focus-visible:border-[#37352F]
          transition-all duration-150
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        "
      />
      {error && (
        <p className="text-xs text-red-500 leading-4" role="alert">{error}</p>
      )}
    </div>
  );
}

// ================================================================
// CREATE SHEET
// ================================================================

function CreateTransactionSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { creatingType, createPrefillData } = useTransactionStore();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      categoryId: "",
      amount: 0,
      title: "",
      date: todayInputValue(),
      note: "",
      imageUrl: "",
      imagePublicId: "",
    },
  });

  // Sync type khi creatingType thay đổi
  useEffect(() => {
    setValue("type", creatingType);
    setValue("categoryId", ""); // reset category khi đổi type
    setValue("imageUrl", "");
    setValue("imagePublicId", "");
  }, [creatingType, setValue]);

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      reset({
        type: "EXPENSE",
        categoryId: "",
        amount: 0,
        title: "",
        date: todayInputValue(),
        note: "",
        imageUrl: "",
        imagePublicId: "",
      });
    } else if (createPrefillData) {
      setValue("type", "EXPENSE");
      setValue("categoryId", createPrefillData.categoryId || "");
      setValue("imageUrl", createPrefillData.imageUrl || "");
      setValue("imagePublicId", createPrefillData.imagePublicId || "");
      
      if (createPrefillData.amount !== undefined) setValue("amount", createPrefillData.amount);
      if (createPrefillData.title) setValue("title", createPrefillData.title);
      if (createPrefillData.date) setValue("date", createPrefillData.date);
      if (createPrefillData.note) setValue("note", createPrefillData.note);
    }
  }, [isOpen, reset, createPrefillData, setValue]);

  const watchedValues = watch();

  const onSubmit = (data: CreateTransactionFormValues) => {
    createTransaction({
      type: data.type,
      dto: {
        categoryId: data.categoryId,
        amount: data.amount,
        title: data.title,
        date: toISOString(data.date),
        note: data.note || undefined,
        imageUrl: data.imageUrl || undefined,
        imagePublicId: data.imagePublicId || undefined,
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open && !isPending) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] bg-white border-l border-[#E8E7E5] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-[#E8E7E5]">
          <SheetTitle className="text-base font-semibold text-[#37352F]">
            Thêm giao dịch
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
            {/* Type selector */}
            <FieldRow label="Loại giao dịch" error={errors.type?.message}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Tabs value={field.value} onValueChange={(val) => {
                    field.onChange(val as TransactionType);
                    setValue("categoryId", "");
                  }}>
                    <TabsList className="h-9 bg-[#F7F6F3] border border-[#E8E7E5] rounded-lg p-0.5 w-full">
                      <TabsTrigger value="EXPENSE" className="flex-1 h-8 text-sm rounded-md font-medium text-[#9B9A97] data-[state=active]:bg-white data-[state=active]:text-[#37352F] data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:text-[#37352F] transition-all duration-150">
                        Chi tiêu
                      </TabsTrigger>
                      <TabsTrigger value="INCOME" className="flex-1 h-8 text-sm rounded-md font-medium text-[#9B9A97] data-[state=active]:bg-white data-[state=active]:text-[#37352F] data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:text-[#37352F] transition-all duration-150">
                        Thu nhập
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              />
            </FieldRow>

            {/* Amount */}
            <FieldRow label="Số tiền (VND)" htmlFor="amount">
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.amount?.message}
                  />
                )}
              />
              {/* Preview */}
              {watchedValues.amount > 0 && (
                <AmountDisplay
                  amount={watchedValues.amount}
                  type={watchedValues.type}
                  size="sm"
                  className="mt-1"
                />
              )}
            </FieldRow>

            {/* Title */}
            <FieldRow label="Tiêu đề" htmlFor="title" error={errors.title?.message}>
              <Input
                id="title"
                placeholder={watchedValues.type === "EXPENSE" ? "VD: Ăn trưa, Cà phê..." : "VD: Lương tháng 6..."}
                disabled={isPending}
                autoFocus
                {...register("title")}
                className="h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F] placeholder:text-[#9B9A97] focus-visible:ring-2 focus-visible:ring-[#37352F] focus-visible:border-[#37352F] transition-all duration-150"
              />
            </FieldRow>

            {/* Category */}
            <FieldRow label="Danh mục" error={errors.categoryId?.message}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelect
                    type={watchedValues.type}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </FieldRow>

            {/* Date */}
            <FieldRow label="Ngày" htmlFor="date" error={errors.date?.message}>
              <Input
                id="date"
                type="date"
                disabled={isPending}
                max={todayInputValue()}
                {...register("date")}
                className="h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F] focus-visible:ring-2 focus-visible:ring-[#37352F] focus-visible:border-[#37352F] transition-all duration-150"
              />
            </FieldRow>

            {/* Note */}
            <FieldRow label="Ghi chú (tuỳ chọn)" htmlFor="note" error={errors.note?.message}>
              <textarea
                id="note"
                placeholder="Thêm ghi chú..."
                disabled={isPending}
                rows={2}
                {...register("note")}
                className="
                  w-full px-3 py-2 text-sm bg-white border border-[#E8E7E5] rounded-md
                  text-[#37352F] placeholder:text-[#9B9A97] resize-none
                  focus:outline-none focus:ring-2 focus:ring-[#37352F] focus:border-[#37352F]
                  transition-all duration-150 disabled:opacity-50
                "
              />
            </FieldRow>

            {/* Image Upload - Chỉ hiện cho Chi tiêu */}
            {watchedValues.type === "EXPENSE" && (
              <FieldRow label="Ảnh hóa đơn (tuỳ chọn)" error={errors.imageUrl?.message}>
                <Controller
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={(url, publicId) => {
                        field.onChange(url);
                        setValue("imagePublicId", publicId);
                      }}
                      onRemove={() => {
                        field.onChange("");
                        setValue("imagePublicId", "");
                      }}
                      disabled={isPending}
                      context="expense"
                    />
                  )}
                />
              </FieldRow>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#E8E7E5] flex flex-row gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={onClose}
              className="flex-1 bg-[#F7F6F3] text-[#37352F] border border-[#E8E7E5] hover:bg-[#EFEFED] text-sm font-medium transition-colors duration-150">
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isPending}
              className="flex-1 bg-[#37352F] text-[#FFFEFC] hover:bg-[#2D2B27] text-sm font-medium transition-colors duration-150 disabled:opacity-50">
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang lưu...
                </span>
              ) : "Thêm giao dịch"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ================================================================
// EDIT SHEET
// ================================================================

function EditTransactionSheet({ isOpen }: { isOpen: boolean }) {
  const { editingTransaction, closeEditSheet } = useTransactionStore();
  const { mutate: updateTransaction, isPending } = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      categoryId: editingTransaction?.categoryId ?? "",
      amount: editingTransaction?.amount ?? 0,
      title: editingTransaction?.title ?? "",
      date: editingTransaction ? toDateInputValue(editingTransaction.date) : todayInputValue(),
      note: editingTransaction?.note ?? "",
      imageUrl: editingTransaction?.imageUrl ?? "",
      imagePublicId: editingTransaction?.imagePublicId ?? "",
    },
  });

  useEffect(() => {
    if (editingTransaction) {
      reset({
        categoryId: editingTransaction.categoryId,
        amount: editingTransaction.amount,
        title: editingTransaction.title,
        date: toDateInputValue(editingTransaction.date),
        note: editingTransaction.note ?? "",
        imageUrl: editingTransaction.imageUrl ?? "",
        imagePublicId: editingTransaction.imagePublicId ?? "",
      });
    }
  }, [editingTransaction, reset]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const { data: analysis } = useImageAnalysis(editingTransaction?.id);
  const watchedValues = watch();

  if (!editingTransaction) return null;

  const onSubmit = (data: EditTransactionFormValues) => {
    updateTransaction({
      type: editingTransaction.type,
      id: editingTransaction.id,
      dto: {
        categoryId: data.categoryId,
        amount: data.amount,
        title: data.title,
        date: toISOString(data.date),
        note: data.note || undefined,
        imageUrl: data.imageUrl || undefined,
        imagePublicId: data.imagePublicId || undefined,
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open && !isPending) closeEditSheet(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] bg-white border-l border-[#E8E7E5] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-[#E8E7E5]">
          <SheetTitle className="text-base font-semibold text-[#37352F]">
            Chỉnh sửa giao dịch
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">

            {/* Type — disabled */}
            <FieldRow label="Loại giao dịch">
              <div className="flex items-center gap-2">
                <div className="h-9 px-3 flex items-center text-sm text-[#9B9A97] bg-[#F7F6F3] border border-[#E8E7E5] rounded-md cursor-not-allowed select-none">
                  {editingTransaction.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
                </div>
                <p className="text-xs text-[#9B9A97]">Không thể thay đổi</p>
              </div>
            </FieldRow>

            {/* Amount */}
            <FieldRow label="Số tiền (VND)" htmlFor="amount">
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.amount?.message}
                  />
                )}
              />
              {watchedValues.amount > 0 && (
                <AmountDisplay amount={watchedValues.amount} type={editingTransaction.type} size="sm" className="mt-1" />
              )}
            </FieldRow>

            {/* Title */}
            <FieldRow label="Tiêu đề" htmlFor="title" error={errors.title?.message}>
              <Input id="title" disabled={isPending} {...register("title")}
                className="h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F] focus-visible:ring-2 focus-visible:ring-[#37352F] focus-visible:border-[#37352F] transition-all duration-150" />
            </FieldRow>

            {/* Category */}
            <FieldRow label="Danh mục" error={errors.categoryId?.message}>
              {analysis?.suggestedCategory && analysis.suggestedCategoryId !== watchedValues.categoryId && (
                <div className="mb-2 p-2.5 rounded-md bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{analysis.suggestedCategory.icon}</span>
                    <span className="text-sm font-medium text-violet-700">
                      AI gợi ý: {analysis.suggestedCategory.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs bg-white hover:bg-violet-100 text-violet-700 hover:text-violet-800"
                    onClick={() => setValue("categoryId", analysis.suggestedCategoryId!, { shouldValidate: true, shouldDirty: true })}
                  >
                    Áp dụng
                  </Button>
                </div>
              )}
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelect
                    type={editingTransaction.type}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </FieldRow>

            {/* Date */}
            <FieldRow label="Ngày" htmlFor="date" error={errors.date?.message}>
              <Input id="date" type="date" disabled={isPending} max={todayInputValue()} {...register("date")}
                className="h-9 text-sm bg-white border-[#E8E7E5] text-[#37352F] focus-visible:ring-2 focus-visible:ring-[#37352F] focus-visible:border-[#37352F] transition-all duration-150" />
            </FieldRow>

            {/* Note */}
            <FieldRow label="Ghi chú (tuỳ chọn)" htmlFor="note" error={errors.note?.message}>
              <textarea id="note" disabled={isPending} rows={2} {...register("note")}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E8E7E5] rounded-md text-[#37352F] placeholder:text-[#9B9A97] resize-none focus:outline-none focus:ring-2 focus:ring-[#37352F] focus:border-[#37352F] transition-all duration-150 disabled:opacity-50" />
            </FieldRow>

            {/* Image Upload - Chỉ hiện cho Chi tiêu */}
            {editingTransaction.type === "EXPENSE" && (
              <FieldRow label="Ảnh hóa đơn (tuỳ chọn)" error={errors.imageUrl?.message}>
                <Controller
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={(url, publicId) => {
                        field.onChange(url);
                        // Using any here as a quick bypass for setValue generic typing issues in this complex form
                        (setValue as any)("imagePublicId", publicId);
                      }}
                      onRemove={() => {
                        field.onChange("");
                        (setValue as any)("imagePublicId", "");
                      }}
                      disabled={isPending}
                      context="expense"
                    />
                  )}
                />
              </FieldRow>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t border-[#E8E7E5] flex flex-row gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={closeEditSheet}
              className="flex-1 bg-[#F7F6F3] text-[#37352F] border border-[#E8E7E5] hover:bg-[#EFEFED] text-sm font-medium transition-colors duration-150">
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isPending}
              className="flex-1 bg-[#37352F] text-[#FFFEFC] hover:bg-[#2D2B27] text-sm font-medium transition-colors duration-150 disabled:opacity-50">
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang lưu...
                </span>
              ) : "Lưu thay đổi"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ================================================================
// Export duy nhất — render cả 2 sheet
// ================================================================

export function TransactionSheet() {
  const { isCreateSheetOpen, closeCreateSheet, isEditSheetOpen } = useTransactionStore();

  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [manualSheetOpen, setManualSheetOpen] = useState(false);

  useEffect(() => {
    if (isCreateSheetOpen) {
      const { createPrefillData } = useTransactionStore.getState();
      if (createPrefillData) {
        setManualSheetOpen(true);
        setMethodDialogOpen(false);
      } else {
        setMethodDialogOpen(true);
      }
    } else {
      setMethodDialogOpen(false);
      setManualSheetOpen(false);
    }
  }, [isCreateSheetOpen]);

  const handleCloseAll = () => {
    closeCreateSheet();
  };

  return (
    <>
      <TransactionMethodDialog
        open={methodDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseAll();
        }}
        onSelectManual={() => {
          setMethodDialogOpen(false);
          setManualSheetOpen(true);
        }}
        onSelectAiImage={() => {
          import("@/features/ai/stores/ai-processing.store").then(({ useAiProcessingStore }) => {
            closeCreateSheet();
            useAiProcessingStore.getState().openDrawer("classification");
          });
        }}
        onSelectOcr={() => {
          // IMPORTANT: Import useAiProcessingStore directly inside the handler to avoid circular dependency
          import("@/features/ai/stores/ai-processing.store").then(({ useAiProcessingStore }) => {
            closeCreateSheet();
            useAiProcessingStore.getState().openDrawer();
          });
        }}
      />



      <CreateTransactionSheet
        isOpen={manualSheetOpen}
        onClose={handleCloseAll}
      />

      <EditTransactionSheet isOpen={isEditSheetOpen} />
    </>
  );
}
