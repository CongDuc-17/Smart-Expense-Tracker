// FE/src/features/budgets/components/BudgetSheet.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetStore } from "@/features/budgets/stores/budget.store";
import { useCreateBudget, useUpdateBudget } from "@/features/budgets/hooks/useBudgets";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Loader2 } from "lucide-react";

export function BudgetSheet() {
  const { data: categories } = useCategories();
  const { isCreateSheetOpen, isEditSheetOpen, editingBudget, closeCreateSheet, closeEditSheet } =
    useBudgetStore();

  const { mutate: createBudget, isPending: isCreating } = useCreateBudget();
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();

  const [formData, setFormData] = useState({
    categoryId: "",
    limitAmount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    alertThreshold: 80,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingBudget && isEditSheetOpen) {
      setFormData({
        categoryId: editingBudget.categoryId,
        limitAmount: editingBudget.limitAmount.toString(),
        month: editingBudget.month,
        year: editingBudget.year,
        alertThreshold: editingBudget.alertThreshold,
      });
      setErrors({});
    } else if (isCreateSheetOpen) {
      setFormData({
        categoryId: "",
        limitAmount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        alertThreshold: 80,
      });
      setErrors({});
    }
  }, [isCreateSheetOpen, isEditSheetOpen, editingBudget]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
    const amount = parseFloat(formData.limitAmount);
    if (!formData.limitAmount) newErrors.limitAmount = "Vui lòng nhập giới hạn ngân sách";
    else if (isNaN(amount) || amount < 1000) newErrors.limitAmount = "Ngân sách tối thiểu là 1,000";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (editingBudget) {
      updateBudget({ id: editingBudget.id, data: { limitAmount: parseFloat(formData.limitAmount), alertThreshold: formData.alertThreshold } }, { onSuccess: () => closeEditSheet() });
    } else {
      createBudget({ categoryId: formData.categoryId, limitAmount: parseFloat(formData.limitAmount), month: formData.month, year: formData.year, alertThreshold: formData.alertThreshold }, { onSuccess: () => closeCreateSheet() });
    }
  };

  const isOpen = isCreateSheetOpen || isEditSheetOpen;
  const isLoading = isCreating || isUpdating;

 return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) { if (isEditSheetOpen) closeEditSheet(); if (isCreateSheetOpen) closeCreateSheet(); } }}>
      <SheetContent 
        className="bg-[#FFFEFC] border-[#E8E7E5] w-full sm:max-w-md pointer-events-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle className="text-[#37352F] text-lg font-semibold">
            {editingBudget ? "Chỉnh sửa ngân sách" : "Tạo ngân sách mới"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-6 mt-6">
          {/* Danh mục */}
          <div className="space-y-2">
            <Label className="text-[#37352F] font-medium">Danh mục</Label>
            <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })} disabled={editingBudget !== null}>
              <SelectTrigger className="bg-white border-[#E8E7E5] text-black">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id} className="text-black">{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
          </div>

          {/* Giới hạn ngân sách */}
          <div className="space-y-2">
            <Label className="text-[#37352F] font-medium">Giới hạn ngân sách (VND)</Label>
            <Input 
              type="number" 
              placeholder="1,000,000" 
              value={formData.limitAmount} 
              onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })} 
              className="bg-white border-[#E8E7E5] text-black" 
            />
            {errors.limitAmount && <p className="text-xs text-red-600">{errors.limitAmount}</p>}
          </div>

          {/* Tháng */}
          <div className="space-y-2">
            <Label className="text-[#37352F] font-medium">Tháng</Label>
            <Select value={formData.month.toString()} onValueChange={(v) => setFormData({ ...formData, month: parseInt(v) })}>
              <SelectTrigger className="bg-white border-[#E8E7E5] text-black"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <SelectItem key={m} value={m.toString()} className="text-black">Tháng {m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Năm */}
          <div className="space-y-2">
            <Label className="text-[#37352F] font-medium">Năm</Label>
            <Select value={formData.year.toString()} onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}>
              <SelectTrigger className="bg-white border-[#E8E7E5] text-black"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => <SelectItem key={y} value={y.toString()} className="text-black">{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Ngưỡng cảnh báo */}
          <div className="space-y-2">
            <Label className="text-[#37352F] font-medium">Ngưỡng cảnh báo (%)</Label>
            <Input 
              type="number" 
              min="50" max="100" 
              value={formData.alertThreshold} 
              onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })} 
              className="bg-white border-[#E8E7E5] text-black" 
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#E8E7E5]">
            <Button type="button" variant="outline" onClick={() => { if (isEditSheetOpen) closeEditSheet(); if (isCreateSheetOpen) closeCreateSheet(); }} className="flex-1 border-[#E8E7E5] text-black">Hủy</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-[#37352F] text-[#FFFEFC] hover:bg-[#2D2B27]">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBudget ? "Cập nhật" : "Tạo"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}