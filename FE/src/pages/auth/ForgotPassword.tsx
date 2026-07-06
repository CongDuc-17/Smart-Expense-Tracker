import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";

// ---------------------------------------------------------------
// Cấu hình Session & Cooldown
// ---------------------------------------------------------------
const SESSION_KEY = "forgot-pwd-session";
const SESSION_TTL_MS = 15 * 60 * 1000; // Phiên đổi mật khẩu tồn tại 15 phút
const COOLDOWN_SEC = 60 * 5; // 60 giây chờ giữa 2 lần gửi OTP

type ForgotPwdSession = {
  email: string;
  expiresAt: number;
  lastOtpSentAt: number;
};

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getErrorMessage(error: unknown, fallback: string) {
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

// Đọc session từ storage
function getSavedSession(): ForgotPwdSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as ForgotPwdSession;
    // Nếu phiên đã quá 15 phút -> xóa bỏ
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// Lưu session vào storage
function saveSession(email: string, lastOtpSentAt: number) {
  const session: ForgotPwdSession = {
    email,
    expiresAt: Date.now() + SESSION_TTL_MS,
    lastOtpSentAt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ---------------------------------------------------------------
// Forgot Password Page
// ---------------------------------------------------------------

export function ForgotPassword() {
  const navigate = useNavigate();

  // Init thẳng từ session — tránh flash form email trước khi useEffect chạy
  const initialSession = getSavedSession();
  const [email, setEmail] = useState(initialSession?.email ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"email" | "reset">(initialSession ? "reset" : "email");
  const [resendIn, setResendIn] = useState(() => {
    if (!initialSession) return 0;
    const elapsed = Math.floor((Date.now() - initialSession.lastOtpSentAt) / 1000);
    return Math.max(COOLDOWN_SEC - elapsed, 0);
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmitReset = useMemo(
    () =>
      otp.trim().length === 6 &&
      newPassword.length >= 8 &&
      confirmPassword.length >= 8 &&
      newPassword === confirmPassword,
    [confirmPassword, newPassword, otp],
  );

  // 1. Hiển thị toast thông báo khi phục hồi session sau F5
  useEffect(() => {
    if (!initialSession) return;

    if (resendIn > 0) {
      toast.info(`OTP đã được gửi đến ${initialSession.email}. Có thể gửi lại sau ${resendIn}s.`, {
        duration: 5000,
      });
    } else {
      toast.info('Phiên làm việc được khôi phục. Nhấn "Gửi lại OTP" nếu bạn chưa nhận được mã.', {
        duration: 6000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Xử lý đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  // Hàm gọi API gửi OTP
  async function sendOtp(targetEmail = email) {
    const normalizedEmail = targetEmail.trim();
    if (!normalizedEmail) {
      setError("Vui lòng nhập email");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await apiClient.post(
        "/auth/send-otp",
        { email: normalizedEmail },
        { withCredentials: true },
      );

      // Lưu lại thời điểm gửi OTP để F5 không bị mất
      saveSession(normalizedEmail, Date.now());
      setEmail(normalizedEmail);
      setStep("reset");
      setResendIn(COOLDOWN_SEC);
      toast.success("Mã OTP đã được gửi đến email của bạn");
    } catch (error) {
      const message = getErrorMessage(error, "Gửi OTP thất bại");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Xử lý nút "Gửi OTP" ở bước 1
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp();
  }

  // Xử lý nút "Đổi mật khẩu" ở bước 2
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("OTP phải có 6 ký tự");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
          newPassword,
          otp: otp.trim(),
        },
        { withCredentials: true },
      );

      // Đổi thành công thì xóa phiên làm việc
      localStorage.removeItem(SESSION_KEY);
      toast.success("Đổi mật khẩu thành công");
      navigate("/login", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Đổi mật khẩu thất bại");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Xử lý khi người dùng ấn "Dùng email khác"
  function handleChangeEmail() {
    localStorage.removeItem(SESSION_KEY);
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Nhập email để nhận mã xác thực"
              : `Nhập mã OTP được gửi đến ${email}`}
          </CardDescription>
          <CardAction>
            <Link to="/login">
              <Button variant="link" className="px-0">Đăng nhập</Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleRequestOtp}>
              <div className="flex flex-col gap-6">
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

                {error && <p className="text-sm text-red-500 leading-4">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Đang gửi OTP...
                    </span>
                  ) : (
                    "Gửi OTP"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-6">
                {/* OTP Input */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp">Mã OTP</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      disabled={isLoading || resendIn > 0}
                      onClick={() => sendOtp()}
                    >
                      {resendIn > 0 ? `Gửi lại trong ${resendIn}s` : "Gửi lại OTP"}
                    </Button>
                  </div>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Nhập 6 số xác thực"
                    required
                    disabled={isLoading}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.trim());
                      setError("");
                    }}
                  />
                </div>

                {/* New Password */}
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Tối thiểu 8 ký tự"
                      required
                      minLength={8}
                      disabled={isLoading}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength={8}
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
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p className={`text-xs leading-4 ${newPassword === confirmPassword ? "text-[#1DD1A1]" : "text-red-500"}`}>
                      {newPassword === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && <p className="text-sm text-red-500 leading-4">{error}</p>}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !canSubmitReset}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Đang đổi mật khẩu...
                      </span>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                    onClick={handleChangeEmail}
                  >
                    Dùng email khác
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}