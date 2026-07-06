import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("emailForVerification") || "";

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  const handleVerify = async () => {
    setLoading(true);
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/auth/verify", {
        email,
        otp,
      });
      localStorage.removeItem("emailForVerification");
      toast.success("Email verified successfully. You can now log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Verification failed", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-muted p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Xác minh tài khoản</CardTitle>
            <CardDescription>
              Nhập mã xác minh đã gửi đến email:{" "}
              <span className="font-medium">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="otp-verification">
                  Mã xác minh
                </FieldLabel>
                <Button variant="outline" size="xs">
                  <RefreshCwIcon />
                  Gửi lại mã
                </Button>
              </div>
              <InputOTP
                maxLength={6}
                id="otp-verification"
                required
                onChange={setOtp}
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
            </Field>
          </CardContent>
          <CardFooter>
            <Field>
              <Button
                type="button"
                className="w-full"
                onClick={() => handleVerify()}
                disabled={loading}
              >
                {loading ? "Đang xác minh..." : "Xác minh"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
