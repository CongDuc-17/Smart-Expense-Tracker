import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BudgetForm({ categories, onSubmit }: { categories: any[], onSubmit: (data: any) => void }) {
  const { register, handleSubmit, control } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Select Danh mục (Dùng Controller để tránh lỗi) */}
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {/* 2. Input Hạn mức (Không để disabled) */}
      <Input 
        {...register("limitAmount")} 
        type="number" 
        placeholder="1,000,000" 
      />

      <Button type="submit" className="w-full">Lưu</Button>
    </form>
  );
}