import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldSeparator } from "@/components/ui/field";
import { apiClient } from "@/lib/apiClient";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getErrorMessage(error: unknown, fallback: string): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object" &&
        (error as any).response !== null &&
        "data" in (error as any).response &&
        typeof (error as any).response.data === "object" &&
        (error as any).response.data !== null &&
        "message" in (error as any).response.data
    ) {
        return String((error as any).response.data.message);
    }
    return fallback;
}

// ---------------------------------------------------------------
// Login Page
// ---------------------------------------------------------------

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await apiClient.post(
                "/auth/login",
                { email, password },
                { withCredentials: true },
            );
            
            if (response.data?.role === 'ADMIN') {
                localStorage.setItem("adminToken", "true");
                toast.success("Đăng nhập Admin thành công!");
                navigate("/admin/dashboard", { replace: true });
            } else {
                localStorage.removeItem("adminToken");
                toast.success("Đăng nhập thành công!");
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            const message = getErrorMessage(error, "Đăng nhập thất bại");
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleLoginGoogle() {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google/login`;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Đăng nhập</CardTitle>
                    <CardDescription>
                        Chào mừng bạn trở lại. Nhập email dưới đây để tiếp tục.
                    </CardDescription>
                    <CardAction>
                        <Link to="/register">
                            <Button variant="link" className="px-0">Đăng ký ngay</Button>
                        </Link>
                    </CardAction>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="ml-auto inline-block text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-sm text-red-500 leading-4" role="alert">
                                    {error}
                                </p>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
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
                                    disabled={isLoading}
                                    onClick={handleLoginGoogle}
                                    className="w-full flex items-center gap-2"
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
                </CardContent>
            </Card>
        </div>
    );
}