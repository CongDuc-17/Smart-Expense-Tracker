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
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";

// ---------------------------------------------------------------
// Password strength indicator
// ---------------------------------------------------------------

function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;

    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
    ];
    const strength = checks.filter(Boolean).length;
    const colors = ["bg-red-400", "bg-amber-400", "bg-[#1DD1A1]"];
    const labels = ["Yếu", "Trung bình", "Mạnh"];

    return (
        <div className="space-y-1.5 mt-2">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? colors[strength - 1] : "bg-[#E8E7E5]"
                            }`}
                    />
                ))}
            </div>
            <p className="text-xs text-gray-500">
                Độ mạnh: <span className="font-medium text-gray-900">{labels[strength - 1] ?? "Quá ngắn"}</span>
            </p>
        </div>
    );
}

// ---------------------------------------------------------------
// Register Page
// ---------------------------------------------------------------

export function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        try {
            setIsLoading(true);
            await apiClient.post(
                "/auth/register",
                { email, password, name },
                { withCredentials: true },
            );
            localStorage.setItem("emailForVerification", email);
            toast.success("Đăng ký thành công! Vui lòng xác thực email.");
            navigate("/verify", { replace: true });
        } catch (error) {
            const message = (error as any)?.response?.data?.message || "Đăng ký thất bại";
            toast.error(message);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Tạo tài khoản</CardTitle>
                    <CardDescription>
                        Miễn phí, không cần thẻ tín dụng
                    </CardDescription>
                    <CardAction>
                        <Link to="/login">
                            <Button variant="link" className="px-0">Đăng nhập</Button>
                        </Link>
                    </CardAction>
                </CardHeader>

                {/* Wrap form around Content and Footer so "Enter" to submit works properly */}
                <form onSubmit={handleSubmit}>
                    <CardContent className="pb-4">
                        <div className="flex flex-col gap-6">
                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Họ và tên</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    autoComplete="name"
                                    required
                                    disabled={isLoading}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
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
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tối thiểu 8 ký tự"
                                        autoComplete="new-password"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <PasswordStrength password={password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        autoComplete="new-password"
                                        required
                                        disabled={isLoading}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError("");
                                        }}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {/* Match indicator */}
                                {confirmPassword && (
                                    <p className={`text-xs leading-4 ${password === confirmPassword ? "text-[#1DD1A1]" : "text-red-500"}`}>
                                        {password === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                                    </p>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-red-500 leading-4" role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Đang đăng ký...
                                </span>
                            ) : (
                                "Tạo tài khoản"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}