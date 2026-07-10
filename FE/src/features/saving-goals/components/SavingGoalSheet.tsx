import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Target, Calendar as CalendarIcon, AlignLeft } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useSavingGoalStore } from "@/features/saving-goals/stores/saving-goal.store";
import { useCreateSavingGoal } from "@/features/saving-goals/hooks/useCreateSavingGoal";
import { useUpdateSavingGoal } from "@/features/saving-goals/hooks/useUpdateSavingGoal";
import { createSavingGoalSchema, updateSavingGoalSchema, type CreateSavingGoalFormValues } from "@/features/saving-goals/schemas/saving-goal.schema";
import { useDraftStore } from "@/stores/draft.store";

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
        <p className="text-xs text-[#FF6B6B] leading-4" role="alert">{error}</p>
      )}
    </div>
  );
}


export function SavingGoalSheet() {
  const {
    isCreateSheetOpen,
    closeCreateSheet,
    isEditSheetOpen,
    closeEditSheet,
    editingGoal
  } = useSavingGoalStore();

  const isOpen = isCreateSheetOpen || isEditSheetOpen;
  const isEditing = isEditSheetOpen && !!editingGoal;

  const { mutate: createGoal, isPending: isCreating } = useCreateSavingGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateSavingGoal();

  const isPending = isCreating || isUpdating;

  const saveDraft = useDraftStore((s) => s.saveDraft);
  const clearDraft = useDraftStore((s) => s.clearDraft);

  const defaultFormValues = useMemo<CreateSavingGoalFormValues>(() => ({
    title: "",
    targetAmount: undefined as unknown as number,
    deadline: undefined,
    note: "",
  }), []);

  const form = useForm<CreateSavingGoalFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? updateSavingGoalSchema : createSavingGoalSchema) as any,
    defaultValues: defaultFormValues,
  });

  // Reset form when opening/closing or changing editingGoal
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingGoal) {
        form.reset({
          title: editingGoal.title,
          targetAmount: Number(editingGoal.targetAmount),
          deadline: editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : undefined,
          note: editingGoal.note || "",
        });
      } else {
        const draft = useDraftStore.getState().getDraft<CreateSavingGoalFormValues>("savingGoal");
        if (draft) {
          form.reset(draft.formData);
        } else {
          form.reset(defaultFormValues);
        }
      }
    }
  }, [isOpen, isEditing, editingGoal, form, defaultFormValues]);

  const watchedValues = form.watch();
  const watchedValuesString = JSON.stringify(watchedValues);
  const defaultValuesString = JSON.stringify(defaultFormValues);

  // Save draft on change (only for Create mode)
  useEffect(() => {
    if (!isOpen || isEditing) return;
    const isDirty = watchedValuesString !== defaultValuesString;
    saveDraft("savingGoal", JSON.parse(watchedValuesString), isDirty);
  }, [watchedValuesString, defaultValuesString, isOpen, isEditing, saveDraft]);

  const handleClose = () => {
    if (isCreateSheetOpen) closeCreateSheet();
    if (isEditSheetOpen) closeEditSheet();
  };

  const onSubmit = (values: CreateSavingGoalFormValues) => {
    // Chuyển đổi targetAmount thành số
    const payload = {
      ...values,
      targetAmount: Number(values.targetAmount),
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
    };

    if (isEditing && editingGoal) {
      updateGoal(
        { id: editingGoal.id, payload },
        {
          onSuccess: () => {
            handleClose();
            form.reset(defaultFormValues);
          },
        }
      );
    } else {
      createGoal(payload, {
        onSuccess: () => {
          clearDraft("savingGoal");
          form.reset(defaultFormValues);
          handleClose();
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md border-l border-border bg-card p-0 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-border bg-background">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-foreground">
              {isEditing ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {isEditing
                ? "Cập nhật thông tin mục tiêu tiết kiệm của bạn."
                : "Thiết lập mục tiêu tiết kiệm mới để theo dõi tiến độ."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FieldRow label="Tên mục tiêu *" htmlFor="title" error={form.formState.errors.title?.message}>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="VD: Mua Macbook, Du lịch Nhật Bản..."
                  className="pl-9 bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("title")}
                />
              </div>
            </FieldRow>

            <FieldRow label="Số tiền mục tiêu (đ) *" htmlFor="targetAmount" error={form.formState.errors.targetAmount?.message}>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                className="bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("targetAmount", { valueAsNumber: true })}
              />
            </FieldRow>

            <FieldRow label="Thời hạn (Không bắt buộc)" htmlFor="deadline" error={form.formState.errors.deadline?.message}>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  type="date"
                  className="pl-9 bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("deadline")}
                />
              </div>
            </FieldRow>

            <FieldRow label="Ghi chú (Không bắt buộc)" htmlFor="note" error={form.formState.errors.note?.message}>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="note"
                  placeholder="Thêm thông tin chi tiết..."
                  className="pl-9 min-h-[100px] resize-none bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("note")}
                />
              </div>
            </FieldRow>

            {/* Dùng div rỗng để push buttons xuống cuối nếu form ngắn */}
            <div className="pb-20"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-card border-border text-foreground hover:bg-muted"
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Đang lưu..." : "Lưu mục tiêu"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
