import { RefreshCwIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { apiClient } from "@/lib/apiClient";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("emailForVerification") || "";

  // 1. Single Source of Truth Countdown Timer
  const [otpRemainingTime, setOtpRemainingTime] = useState(() => {
    if (!email) return 0;
    const saved = localStorage.getItem("otpExpiresAt_verify");
    if (saved) {
      const remaining = Math.floor((Number(saved) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    const newExpiresAt = Date.now() + 5 * 60 * 1000; // 5 phút
    localStorage.setItem("otpExpiresAt_verify", newExpiresAt.toString());
    return 5 * 60;
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Logic chạy timer
  useEffect(() => {
    if (otpRemainingTime <= 0) return;
    const timer = window.setInterval(() => {
      setOtpRemainingTime((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpRemainingTime]);

  const handleResendOtp = async () => {
    if (otpRemainingTime > 0 || isResending) return;
    
    try {
      setIsResending(true);
      await apiClient.post("/auth/send-otp", { email });
      
      const newExpiresAt = Date.now() + 5 * 60 * 1000;
      localStorage.setItem("otpExpiresAt_verify", newExpiresAt.toString());
      setOtpRemainingTime(5 * 60);
      
      toast.success("Mã xác minh mới đã được gửi.");
    } catch (error) {
      toast.error("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ mã 6 số");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/auth/verify", {
        email,
        otp,
      });
      localStorage.removeItem("emailForVerification");
      localStorage.removeItem("otpExpiresAt_verify");
      toast.success("Xác minh thành công. Bạn có thể đăng nhập.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Verification failed", error);
      toast.error("Xác minh thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Button State Logic
  const canResend = otpRemainingTime === 0;

  return (
    <AuthLayout
      title="Xác minh tài khoản"
      description={
        <>
          Nhập mã xác minh đã gửi đến email:{" "}
          <span className="font-medium">{email}</span>.
        </>
      }
      maxWidth="md"
    >
      <div className="p-6 pt-0">
        <Field className="mb-6">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">Mã xác minh</FieldLabel>
            
            {/* The Unified Resend Button */}
            <Button 
              type="button"
              variant={canResend ? "default" : "outline"} 
              size="xs" 
              onClick={handleResendOtp}
              disabled={loading || isResending || !canResend}
              aria-live="polite"
              aria-label="Gửi lại mã xác minh"
            >
              {isResending ? (
                <>
                  <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <RefreshCwIcon className={`mr-2 h-3.5 w-3.5 ${!canResend ? "opacity-50" : ""}`} />
                  {canResend ? "Gửi lại mã" : `Gửi lại sau ${formatTime(otpRemainingTime)}`}
                </>
              )}
            </Button>
          </div>
          <div className="flex justify-center mt-2">
            <InputOTP
              maxLength={6}
              id="otp-verification"
              required
              onChange={setOtp}
              disabled={loading}
            >
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </Field>

        <Button
          type="button"
          className="w-full"
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Đang xác minh...
            </span>
          ) : (
            "Xác minh"
          )}
        </Button>
      </div>
    </AuthLayout>
  );
}
