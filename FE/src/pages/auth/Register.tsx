import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas/auth.schema";

export function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [isSlowResponse, setIsSlowResponse] = useState(false);
    const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const passwordValue = useWatch({ control, name: "password" });
    const confirmPasswordValue = useWatch({ control, name: "confirmPassword" });

    async function onSubmit(data: RegisterFormData) {
        setGlobalError("");
        setIsLoading(true);
        setIsSlowResponse(false);

        // Show a cold-start hint if the server hasn't responded within 5 seconds
        slowTimerRef.current = setTimeout(() => setIsSlowResponse(true), 5000);

        try {
            await apiClient.post(
                "/auth/register",
                { email: data.email, password: data.password, name: data.name },
                { withCredentials: true },
            );
            localStorage.setItem("emailForVerification", data.email);
            toast.success("Đăng ký thành công! Vui lòng xác thực email.");
            navigate("/verify", { replace: true });
        } catch (error) {
            let message: string;

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const serverMessage = error.response?.data?.message as string | undefined;

                if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
                    message =
                        "Server đang khởi động, vui lòng đợi. Nếu bạn đã nhận được email xác thực thì tài khoản đã được tạo thành công — hãy thử đăng nhập.";
                } else if (status === 409) {
                    message =
                        serverMessage ??
                        "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng chức năng Quên mật khẩu.";
                } else if (!error.response) {
                    message = "Không thể kết nối tới server. Vui lòng kiểm tra mạng và thử lại.";
                } else {
                    message = serverMessage ?? "Đăng ký thất bại. Vui lòng thử lại.";
                }
            } else {
                message = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";
            }

            toast.error(message);
            setGlobalError(message);
        } finally {
            if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
            setIsLoading(false);
            setIsSlowResponse(false);
        }
    }

    return (
        <AuthLayout
            title="Tạo tài khoản"
            description="Miễn phí, không cần thẻ tín dụng"
            actionText=""
            actionLink="/login"
            actionLabel="Đăng nhập"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-6 pt-0 pb-4">
                    <div className="flex flex-col gap-6">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Nguyễn Văn A"
                                autoComplete="name"
                                disabled={isLoading}
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 leading-4">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                disabled={isLoading}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 leading-4">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mật khẩu</Label>
                            </div>
                            <PasswordInput
                                id="password"
                                placeholder="Tối thiểu 8 ký tự"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...register("password")}
                            />
                            <PasswordStrength password={passwordValue} />
                            {errors.password && (
                                <p className="text-sm text-red-500 leading-4">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                            </div>
                            <PasswordInput
                                id="confirm-password"
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...register("confirmPassword")}
                            />
                            {/* Match indicator */}
                            {confirmPasswordValue && (
                                <p className={`text-xs leading-4 ${passwordValue === confirmPasswordValue ? "text-success" : "text-destructive"}`}>
                                    {passwordValue === confirmPasswordValue ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                                </p>
                            )}
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500 leading-4">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Global Error */}
                        {globalError && (
                            <p className="text-sm text-red-500 leading-4" role="alert">
                                {globalError}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-0 flex-col gap-2 flex">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                                {isSlowResponse ? "Server đang khởi động..." : "Đang đăng ký..."}
                            </span>
                        ) : (
                            "Tạo tài khoản"
                        )}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}