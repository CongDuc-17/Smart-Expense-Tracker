// ============================================================
// CategorySheet — Create & Edit Sheet
// Phase 2 — Category Module
//
// Một component xử lý cả 2 chế độ: Create và Edit.
// Mode được quyết định bởi Zustand store state.
//
// - Create mode: isCreateSheetOpen = true, editingCategory = null
// - Edit mode:   isEditSheetOpen = true,   editingCategory = Category
//
// Form: React Hook Form + Zod
// ============================================================

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/features/categories/components/ColorPicker";
import { IconPicker } from "@/features/categories/components/IconPicker";
import { CategoryPreview } from "@/features/categories/components/CategoryPreview";
import { useCategoryStore } from "@/features/categories/stores/category.store";
import { useCreateCategory } from "@/features/categories/hooks/useCreateCategory";
import { useUpdateCategory } from "@/features/categories/hooks/useUpdateCategory";
import {
  createCategorySchema,
  editCategorySchema,
  type CreateCategoryFormValues,
  type EditCategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import {
  DEFAULT_CATEGORY_COLOR,
} from "@/features/categories/constants/category-colors";
import {
  DEFAULT_CATEGORY_ICON,
} from "@/features/categories/constants/category-icons";
import type { TransactionType } from "@/features/categories/types/category.types";

// ---------------------------------------------------------------
// Sub-component: Form Field Row
// ---------------------------------------------------------------

interface FieldRowProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldRow({ label, htmlFor, error, children }: FieldRowProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
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
// Create Category Sheet
// ---------------------------------------------------------------

function CreateCategorySheet({ isOpen }: { isOpen: boolean }) {
  const closeCreateSheet = useCategoryStore((s) => s.closeCreateSheet);
  const { mutate: createCategory, isPending } = useCreateCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      icon: DEFAULT_CATEGORY_ICON,
      color: DEFAULT_CATEGORY_COLOR,
    },
  });

  // Reset form khi sheet đóng lại
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const watchedValues = watch();

  const onSubmit = (data: CreateCategoryFormValues) => {
    createCategory(data);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) closeCreateSheet();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-card border-l border-border flex flex-col p-0 overflow-y-auto"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground">
            Tạo danh mục
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1"
        >
          {/* ── Form Body ───────────────────────────────────── */}
          <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
            {/* Tên danh mục */}
            <FieldRow
              label="Tên danh mục"
              htmlFor="create-name"
              error={errors.name?.message}
            >
              <Input
                id="create-name"
                placeholder="VD: Trà sữa, Du lịch, Lương..."
                autoFocus
                {...register("name")}
                className="
                  h-9 text-sm bg-card border-border text-foreground
                  placeholder:text-muted-foreground
                  focus-visible:ring-2 focus-visible:ring-ring
                  focus-visible:border-ring
                  transition-all duration-150
                "
              />
            </FieldRow>

            {/* Loại giao dịch */}
            <FieldRow label="Loại giao dịch" error={errors.type?.message}>
              <Tabs
                value={watchedValues.type}
                onValueChange={(val) =>
                  setValue("type", val as TransactionType, {
                    shouldValidate: true,
                  })
                }
              >
                <TabsList className="h-9 bg-muted border border-border rounded-lg p-0.5 w-full">
                  <TabsTrigger
                    value="EXPENSE"
                    className="
                      flex-1 h-8 text-sm rounded-md font-medium
                      text-muted-foreground
                      data-[state=active]:bg-background data-[state=active]:text-foreground
                      data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                      hover:text-foreground transition-all duration-150
                    "
                  >
                    Chi tiêu
                  </TabsTrigger>
                  <TabsTrigger
                    value="INCOME"
                    className="
                      flex-1 h-8 text-sm rounded-md font-medium
                      text-muted-foreground
                      data-[state=active]:bg-background data-[state=active]:text-foreground
                      data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]
                      hover:text-foreground transition-all duration-150
                    "
                  >
                    Thu nhập
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </FieldRow>

            {/* Màu sắc */}
            <FieldRow label="Màu sắc" error={errors.color?.message}>
              <ColorPicker
                value={watchedValues.color}
                onChange={(color) =>
                  setValue("color", color, { shouldValidate: true })
                }
              />
            </FieldRow>

            {/* Biểu tượng */}
            <FieldRow label="Biểu tượng" error={errors.icon?.message}>
              <IconPicker
                value={watchedValues.icon}
                onChange={(iconKey) =>
                  setValue("icon", iconKey, { shouldValidate: true })
                }
                selectedColor={watchedValues.color}
              />
            </FieldRow>

            {/* Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Xem trước</p>
              <CategoryPreview
                name={watchedValues.name}
                type={watchedValues.type}
                iconKey={watchedValues.icon}
                color={watchedValues.color}
              />
            </div>
          </div>

          {/* ── Footer Actions ──────────────────────────────── */}
          <SheetFooter className="px-6 py-4 border-t border-border flex flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={closeCreateSheet}
              className="
                flex-1 bg-muted text-foreground border border-border
                hover:bg-secondary text-sm font-medium transition-colors duration-150
              "
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="
                flex-1 bg-primary text-primary-foreground
                hover:bg-primary/90 active:scale-95
                text-sm font-medium transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang tạo...
                </span>
              ) : (
                "Tạo danh mục"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------
// Edit Category Sheet
// ---------------------------------------------------------------

function EditCategorySheet({ isOpen }: { isOpen: boolean }) {
  const { editingCategory, closeEditSheet } = useCategoryStore();
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: editingCategory?.name ?? "",
      icon: editingCategory?.icon ?? DEFAULT_CATEGORY_ICON,
      color: editingCategory?.color ?? DEFAULT_CATEGORY_COLOR,
    },
  });

  // Re-populate form khi editingCategory thay đổi
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
      });
    }
  }, [editingCategory, reset]);

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const watchedValues = watch();

  const onSubmit = (data: EditCategoryFormValues) => {
    if (!editingCategory) return;
    updateCategory({ id: editingCategory.id, dto: data });
  };

  if (!editingCategory) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) closeEditSheet();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-card border-l border-border flex flex-col p-0 overflow-y-auto"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground">
            Chỉnh sửa danh mục
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1"
        >
          <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
            {/* Tên */}
            <FieldRow
              label="Tên danh mục"
              htmlFor="edit-name"
              error={errors.name?.message}
            >
              <Input
                id="edit-name"
                autoFocus
                {...register("name")}
                className="
                  h-9 text-sm bg-card border-border text-foreground
                  placeholder:text-muted-foreground
                  focus-visible:ring-2 focus-visible:ring-ring
                  focus-visible:border-ring
                  transition-all duration-150
                "
              />
            </FieldRow>

            {/* Type — disabled */}
            <FieldRow label="Loại giao dịch">
              <div className="flex items-center gap-2">
                <div
                  className="
                    h-9 px-3 flex items-center text-sm text-muted-foreground
                    bg-muted border border-border rounded-md
                    cursor-not-allowed select-none
                  "
                >
                  {editingCategory.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Không thể thay đổi sau khi tạo
                </p>
              </div>
            </FieldRow>

            {/* Màu */}
            <FieldRow label="Màu sắc" error={errors.color?.message}>
              <ColorPicker
                value={watchedValues.color}
                onChange={(color) =>
                  setValue("color", color, { shouldValidate: true })
                }
              />
            </FieldRow>

            {/* Icon */}
            <FieldRow label="Biểu tượng" error={errors.icon?.message}>
              <IconPicker
                value={watchedValues.icon}
                onChange={(iconKey) =>
                  setValue("icon", iconKey, { shouldValidate: true })
                }
                selectedColor={watchedValues.color}
              />
            </FieldRow>

            {/* Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Xem trước</p>
              <CategoryPreview
                name={watchedValues.name}
                type={editingCategory.type}
                iconKey={watchedValues.icon}
                color={watchedValues.color}
              />
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border flex flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={closeEditSheet}
              className="
                flex-1 bg-muted text-foreground border border-border
                hover:bg-secondary text-sm font-medium transition-colors duration-150
              "
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="
                flex-1 bg-primary text-primary-foreground
                hover:bg-primary/90 active:scale-95
                text-sm font-medium transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
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

// ---------------------------------------------------------------
// CategorySheet — Export duy nhất (render cả 2 sheet)
// CategoriesPage chỉ cần render <CategorySheet /> một lần.
// ---------------------------------------------------------------

export function CategorySheet() {
  const { isCreateSheetOpen, isEditSheetOpen } = useCategoryStore();

  return (
    <>
      <CreateCategorySheet isOpen={isCreateSheetOpen} />
      <EditCategorySheet isOpen={isEditSheetOpen} />
    </>
  );
}
