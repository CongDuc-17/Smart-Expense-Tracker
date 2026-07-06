import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/api-error";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailFormData,
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/schemas/auth.schema";

// ---------------------------------------------------------------
// Cấu hình Session & Cooldown
// ---------------------------------------------------------------
const SESSION_KEY = "forgot-pwd-session";
const SESSION_TTL_MS = 15 * 60 * 1000;
const COOLDOWN_SEC = 60 * 5;

type ForgotPwdSession = {
  email: string;
  expiresAt: number;
  lastOtpSentAt: number;
};

// Đọc session từ storage
function getSavedSession(): ForgotPwdSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as ForgotPwdSession;
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

  // Init thẳng từ session
  const initialSession = getSavedSession();
  const [email, setEmail] = useState(initialSession?.email ?? "");
  const [step, setStep] = useState<"email" | "reset">(initialSession ? "reset" : "email");
  const [resendIn, setResendIn] = useState(() => {
    if (!initialSession) return 0;
    const elapsed = Math.floor((Date.now() - initialSession.lastOtpSentAt) / 1000);
    return Math.max(COOLDOWN_SEC - elapsed, 0);
  });
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forms
  const emailForm = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: initialSession?.email ?? "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = useWatch({ control: resetForm.control, name: "newPassword" });
  const confirmPasswordValue = useWatch({ control: resetForm.control, name: "confirmPassword" });

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


  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);


  async function sendOtp(targetEmail = email) {
    const normalizedEmail = targetEmail.trim();
    if (!normalizedEmail) return;

    setGlobalError("");
    setIsLoading(true);

    try {
      await apiClient.post(
        "/auth/send-otp",
        { email: normalizedEmail },
        { withCredentials: true },
      );

      saveSession(normalizedEmail, Date.now());
      setEmail(normalizedEmail);
      setStep("reset");
      setResendIn(COOLDOWN_SEC);
      toast.success("Mã OTP đã được gửi đến email của bạn");
    } catch (error) {
      const message = getErrorMessage(error, "Gửi OTP thất bại");
      setGlobalError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }


  async function onSubmitEmail(data: ForgotPasswordEmailFormData) {
    await sendOtp(data.email);
  }
  async function onSubmitReset(data: ResetPasswordFormData) {
    setGlobalError("");
    setIsLoading(true);

    try {
      await apiClient.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
          newPassword: data.newPassword,
          otp: data.otp.trim(),
        },
        { withCredentials: true },
      );

      localStorage.removeItem(SESSION_KEY);
      toast.success("Đổi mật khẩu thành công");
      navigate("/login", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, "Đổi mật khẩu thất bại");
      setGlobalError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChangeEmail() {
    localStorage.removeItem(SESSION_KEY);
    setStep("email");
    resetForm.reset();
    setGlobalError("");
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      description={step === "email" ? "Nhập email để nhận mã xác thực" : `Nhập mã OTP được gửi đến ${email}`}
      actionText=""
      actionLink="/login"
      actionLabel="Đăng nhập"
    >
      <div className="p-6 pt-0">
        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500 leading-4">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              {globalError && <p className="text-sm text-red-500 leading-4">{globalError}</p>}

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
          <form onSubmit={resetForm.handleSubmit(onSubmitReset)}>
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
                  disabled={isLoading}
                  {...resetForm.register("otp")}
                />
                {resetForm.formState.errors.otp && (
                  <p className="text-sm text-red-500 leading-4">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="grid gap-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  disabled={isLoading}
                  {...resetForm.register("newPassword")}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500 leading-4">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={isLoading}
                  {...resetForm.register("confirmPassword")}
                />
                {/* Match indicator */}
                {confirmPasswordValue && (
                  <p className={`text-xs leading-4 ${newPasswordValue === confirmPasswordValue ? "text-success" : "text-destructive"}`}>
                    {newPasswordValue === confirmPasswordValue ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                  </p>
                )}
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 leading-4">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {globalError && <p className="text-sm text-red-500 leading-4">{globalError}</p>}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !resetForm.formState.isValid}
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
      </div>
    </AuthLayout>
  );
}