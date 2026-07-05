import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUserStore } from "../stores/user.store";
import { useUpdateProfile } from "../hooks/useUser";
import { Loader2Icon, UploadIcon } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
});

export function PersonalInfoForm() {
  const user = useUserStore((state) => state.currentUser);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Auto fill form when user data is loaded/updated
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      });
      // Do not reset selectedFile/previewAvatar if they were just selected,
      // only reset them initially when user first loads. 
      // But actually we want to reset them after successful update, which is fine since user object changes.
    }
  }, [user, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const isDirty = form.formState.isDirty || selectedFile !== null;

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateProfile({
      name: values.name !== user?.name ? values.name : undefined,
      email: values.email !== user?.email ? values.email : undefined,
      avatar: selectedFile || undefined,
    });
  }

  return (
    <div className="bg-white border border-[#E8E7E5] rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E8E7E5]">
        <h3 className="text-lg font-semibold text-[#37352F]">Thông tin cá nhân</h3>
        <p className="text-sm text-[#9B9A97] mt-1">Cập nhật tên, email và ảnh đại diện của bạn.</p>
      </div>

      <div className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#F7F6F3] border border-[#E8E7E5] shrink-0">
              {(previewAvatar || user?.avatar) ? (
                <img
                  src={previewAvatar || user?.avatar || ""}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9B9A97]">
                  <UploadIcon className="w-6 h-6 opacity-50" />
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white"
              >
                Đổi ảnh đại diện
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-[#9B9A97] mt-2">Định dạng JPG, PNG hoặc GIF. Tối đa 5MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#37352F] font-medium">Họ và tên</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Nhập họ tên của bạn"
              className="max-w-md bg-[#FFFEFC]"
            />
            {form.formState.errors.name && (
              <p className="text-[0.8rem] font-medium text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#37352F] font-medium">Địa chỉ Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Nhập địa chỉ email"
              className="max-w-md bg-[#FFFEFC]"
              disabled
            />
            {form.formState.errors.email && (
              <p className="text-[0.8rem] font-medium text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E8E7E5]">
            <Button
              type="submit"
              disabled={!isDirty || isPending}
              className="bg-[#37352F] hover:bg-[#2F2D28] text-white"
            >
              {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
