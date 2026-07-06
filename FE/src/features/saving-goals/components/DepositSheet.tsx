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
      <SheetContent className="w-full sm:max-w-md border-l border-border bg-card p-0 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-border bg-background">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-foreground">
              Nạp tiền
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Cập nhật số tiền bạn đã tiết kiệm được cho mục tiêu này.
            </SheetDescription>
          </SheetHeader>

          {depositingGoal && (
            <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
              <div className="text-sm font-medium text-foreground">{depositingGoal.title}</div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">Mục tiêu: {formatVND(depositingGoal.targetAmount)}</span>
                <span className="text-muted-foreground">Còn thiếu: {formatVND(depositingGoal.remainingAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FieldRow label="Số tiền nạp (đ) *" htmlFor="amount" error={form.formState.errors.amount?.message}>
              <div className="relative">
                <PiggyBank className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="amount"
                  type="number" 
                  placeholder="0" 
                  className="pl-9 bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("amount", { valueAsNumber: true })} 
                />
              </div>
            </FieldRow>

            <FieldRow label="Nguồn tiền / Ghi chú" htmlFor="note" error={form.formState.errors.note?.message}>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  id="note"
                  placeholder="VD: Lương tháng 6..." 
                  className="pl-9 min-h-[100px] resize-none bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("note")} 
                />
              </div>
            </FieldRow>

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
                {isPending ? "Đang xử lý..." : "Nạp tiền"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
