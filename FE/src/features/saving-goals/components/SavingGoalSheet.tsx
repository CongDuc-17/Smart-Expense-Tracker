import { useEffect } from "react";
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

  const form = useForm<CreateSavingGoalFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? updateSavingGoalSchema : createSavingGoalSchema) as any,
    defaultValues: {
      title: "",
      targetAmount: undefined,
      deadline: undefined,
      note: "",
    },
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
        form.reset({
          title: "",
          targetAmount: undefined as unknown as number,
          deadline: undefined,
          note: "",
        });
      }
    }
  }, [isOpen, isEditing, editingGoal, form]);

  const handleClose = () => {
    if (isCreateSheetOpen) closeCreateSheet();
    if (isEditSheetOpen) closeEditSheet();
    form.reset();
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
          onSuccess: () => handleClose(),
        }
      );
    } else {
      createGoal(payload, {
        onSuccess: () => handleClose(),
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md border-l border-[#E8E7E5] bg-white p-0 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#E8E7E5] bg-[#FFFEFC]">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-[#37352F]">
              {isEditing ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
            </SheetTitle>
            <SheetDescription className="text-sm text-[#9B9A97]">
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
                <Target className="absolute left-3 top-2.5 h-4 w-4 text-[#9B9A97]" />
                <Input
                  id="title"
                  placeholder="VD: Mua Macbook, Du lịch Nhật Bản..."
                  className="pl-9 bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                  {...form.register("title")}
                />
              </div>
            </FieldRow>

            <FieldRow label="Số tiền mục tiêu (đ) *" htmlFor="targetAmount" error={form.formState.errors.targetAmount?.message}>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                className="bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                {...form.register("targetAmount", { valueAsNumber: true })}
              />
            </FieldRow>

            <FieldRow label="Thời hạn (Không bắt buộc)" htmlFor="deadline" error={form.formState.errors.deadline?.message}>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#9B9A97]" />
                <Input
                  id="deadline"
                  type="date"
                  className="pl-9 bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                  {...form.register("deadline")}
                />
              </div>
            </FieldRow>

            <FieldRow label="Ghi chú (Không bắt buộc)" htmlFor="note" error={form.formState.errors.note?.message}>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-[#9B9A97]" />
                <Textarea
                  id="note"
                  placeholder="Thêm thông tin chi tiết..."
                  className="pl-9 min-h-[100px] resize-none bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                  {...form.register("note")}
                />
              </div>
            </FieldRow>

            {/* Dùng div rỗng để push buttons xuống cuối nếu form ngắn */}
            <div className="pb-20"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#FFFEFC] border-t border-[#E8E7E5] flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-white border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3]"
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#37352F] text-white hover:bg-[#2D2B27]"
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
