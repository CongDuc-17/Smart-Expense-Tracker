import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldSeparator } from "@/components/ui/field";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Login() {
    const [globalError, setGlobalError] = useState("");
    const { login, isLoggingIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(data: LoginFormData) {
        setGlobalError("");
        login(data);
    }

    function handleLoginGoogle() {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google/login`;
    }

    return (
        <AuthLayout
            title="Đăng nhập"
            description="Chào mừng bạn trở lại. Nhập email dưới đây để tiếp tục."
            actionText=""
            actionLink="/register"
            actionLabel="Đăng ký ngay"
        >
            <div className="p-6 pt-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6">
                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                disabled={isLoggingIn}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 leading-4">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                disabled={isLoggingIn}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 leading-4">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Global Error Message */}
                        {globalError && (
                            <p className="text-sm text-red-500 leading-4" role="alert">
                                {globalError}
                            </p>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Đang đăng nhập...
                                </span>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </div>

                    {/* Divider & Google Login */}
                    <div className="relative mt-6">
                        <FieldSeparator className="mb-4 text-xs text-muted-foreground">
                            Hoặc tiếp tục với
                        </FieldSeparator>

                        <Field>
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoggingIn}
                                onClick={handleLoginGoogle}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Đăng nhập bằng Google
                            </Button>
                        </Field>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}