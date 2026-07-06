import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "../hooks/useUser";
import { Loader2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const passwordSchema = z.string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[a-z]/, "Phải chứa ít nhất 1 chữ thường")
  .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ hoa")
  .regex(/[0-9]/, "Phải chứa ít nhất 1 số")
  .regex(/[^a-zA-Z0-9]/, "Phải chứa ít nhất 1 ký tự đặc biệt");

const formSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export function SecurityForm() {
  const { mutate: changePassword, isPending } = useChangePassword();
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { isDirty, isValid } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    changePassword({ newPassword: values.newPassword }, {
      onSuccess: () => {
        form.reset(); // Reset form on success
      }
    });
  }

  // Realtime password strength validation
  const newPasswordValue = form.watch("newPassword");
  const validations = [
    { label: "Tối thiểu 8 ký tự", isMet: newPasswordValue.length >= 8 },
    { label: "1 chữ thường", isMet: /[a-z]/.test(newPasswordValue) },
    { label: "1 chữ hoa", isMet: /[A-Z]/.test(newPasswordValue) },
    { label: "1 số", isMet: /[0-9]/.test(newPasswordValue) },
    { label: "1 ký tự đặc biệt", isMet: /[^a-zA-Z0-9]/.test(newPasswordValue) },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Bảo mật</h3>
        <p className="text-sm text-muted-foreground mt-1">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
      </div>

      <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground font-medium">Mật khẩu hiện tại</Label>
              <div className="relative max-w-md">
                <Input 
                  id="currentPassword"
                  {...form.register("currentPassword")} 
                  type={showCurrent ? "text" : "password"} 
                  placeholder="Nhập mật khẩu hiện tại" 
                  className="bg-background pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.currentPassword && (
                <p className="text-[0.8rem] font-medium text-red-500">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-6 max-w-md" />

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground font-medium">Mật khẩu mới</Label>
              <div className="relative max-w-md">
                <Input 
                  id="newPassword"
                  {...form.register("newPassword")} 
                  type={showNew ? "text" : "password"} 
                  placeholder="Nhập mật khẩu mới" 
                  className="bg-background pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Realtime password strength indicator */}
              {newPasswordValue.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs max-w-md">
                  {validations.map((v, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      v.isMet ? "text-emerald-600" : "text-muted-foreground"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        v.isMet ? "bg-emerald-500/10 text-emerald-5000" : "bg-muted"
                      )} />
                      {v.label}
                    </div>
                  ))}
                </div>
              )}
              
              {form.formState.errors.newPassword && (
                <p className="text-[0.8rem] font-medium text-red-500">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Xác nhận mật khẩu mới</Label>
              <div className="relative max-w-md">
                <Input 
                  id="confirmPassword"
                  {...form.register("confirmPassword")} 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Nhập lại mật khẩu mới" 
                  className="bg-background pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-[0.8rem] font-medium text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                type="submit" 
                disabled={!isDirty || !isValid || isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Lưu mật khẩu
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
}
