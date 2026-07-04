import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";

export function BudgetCreateForm({ categories, onClose }: { categories: any[], onClose: () => void }) {
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = async (data: any) => {
    try {
      
      await apiClient.post('/budgets', {
        categoryId: data.categoryId,
        limitAmount: Number(data.limitAmount.replace(/,/g, '')),
        month: Number(data.month),
        year: Number(data.year),
      });
      onClose(); 
      window.location.reload(); 
    } catch (error) {
      console.error("Lỗi khi tạo ngân sách:", error);
      alert("Không thể tạo ngân sách, vui lòng kiểm tra lại!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Chọn Danh mục */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Danh mục</label>
        <Select onValueChange={(val) => setValue("categoryId", val)}>
          <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Giới hạn ngân sách */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Giới hạn ngân sách (VNĐ)</label>
        <Input {...register("limitAmount")} placeholder="1,000,000" />
      </div>

      {/* 3. Tháng & Năm (Mặc định lấy thời gian hiện tại) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tháng</label>
          <Input {...register("month")} type="number" defaultValue={new Date().getMonth() + 1} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Năm</label>
          <Input {...register("year")} type="number" defaultValue={new Date().getFullYear()} />
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" type="button" onClick={onClose} className="w-full">Hủy</Button>
        <Button type="submit" className="w-full">Tạo</Button>
      </div>
    </form>
  );
}