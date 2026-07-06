import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập Email và Password");
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng nhập Admin để lấy Admin Token
      const response = await apiClient.post("/admin/login", { email, password });
      
      const adminToken = response.data?.token || response.token;
      if (!adminToken) {
        throw new Error("Không nhận được token từ máy chủ");
      }

      // Lưu token vào localStorage
      localStorage.setItem("adminToken", adminToken);
      
      toast.success("Đăng nhập Admin thành công");
      navigate("/admin/dashboard");
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Sai Email hoặc Mật khẩu Quản trị viên");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <ShieldAlertIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Đăng nhập Quản trị viên bằng Email và Mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Nhập Email Admin..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Nhập Mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xác thực..." : "Truy cập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
