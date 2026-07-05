import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PiggyBank, AlignLeft } from "lucide-react";

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
import { useDepositSavingGoal } from "@/features/saving-goals/hooks/useDepositSavingGoal";
import { depositSavingGoalSchema, type DepositSavingGoalFormValues } from "@/features/saving-goals/schemas/saving-goal.schema";
import { formatVND } from "./SavingGoalCard";

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


export function DepositSheet() {
  const { 
    isDepositSheetOpen, 
    closeDepositSheet, 
    depositingGoal 
  } = useSavingGoalStore();

  const { mutate: depositGoal, isPending } = useDepositSavingGoal();

  const form = useForm<DepositSavingGoalFormValues>({
    resolver: zodResolver(depositSavingGoalSchema),
    defaultValues: {
      amount: undefined,
      note: "",
    },
  });

  useEffect(() => {
    if (isDepositSheetOpen) {
      form.reset({
        amount: undefined as unknown as number,
        note: "",
      });
    }
  }, [isDepositSheetOpen, form]);

  const handleClose = () => {
    closeDepositSheet();
    form.reset();
  };

  const onSubmit = (values: DepositSavingGoalFormValues) => {
    if (!depositingGoal) return;

    const payload = {
      ...values,
      amount: Number(values.amount),
    };

    depositGoal(
      { id: depositingGoal.id, payload },
      {
        onSuccess: () => handleClose(),
      }
    );
  };

  return (
    <Sheet open={isDepositSheetOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md border-l border-[#E8E7E5] bg-white p-0 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#E8E7E5] bg-[#FFFEFC]">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-[#37352F]">
              Nạp tiền
            </SheetTitle>
            <SheetDescription className="text-sm text-[#9B9A97]">
              Cập nhật số tiền bạn đã tiết kiệm được cho mục tiêu này.
            </SheetDescription>
          </SheetHeader>

          {depositingGoal && (
            <div className="mt-4 p-3 bg-[#F7F6F3] rounded-lg border border-[#E8E7E5]">
              <div className="text-sm font-medium text-[#37352F]">{depositingGoal.title}</div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[#9B9A97]">Mục tiêu: {formatVND(depositingGoal.targetAmount)}</span>
                <span className="text-[#9B9A97]">Còn thiếu: {formatVND(depositingGoal.remainingAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FieldRow label="Số tiền nạp (đ) *" htmlFor="amount" error={form.formState.errors.amount?.message}>
              <div className="relative">
                <PiggyBank className="absolute left-3 top-2.5 h-4 w-4 text-[#9B9A97]" />
                <Input 
                  id="amount"
                  type="number" 
                  placeholder="0" 
                  className="pl-9 bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                  {...form.register("amount", { valueAsNumber: true })} 
                />
              </div>
            </FieldRow>

            <FieldRow label="Nguồn tiền / Ghi chú" htmlFor="note" error={form.formState.errors.note?.message}>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-[#9B9A97]" />
                <Textarea 
                  id="note"
                  placeholder="VD: Lương tháng 6..." 
                  className="pl-9 min-h-[100px] resize-none bg-[#FFFEFC] border-[#E8E7E5] focus-visible:ring-1 focus-visible:ring-[#37352F]"
                  {...form.register("note")} 
                />
              </div>
            </FieldRow>

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
                {isPending ? "Đang xử lý..." : "Nạp tiền"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
