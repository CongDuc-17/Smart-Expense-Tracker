import { useAdminStats } from "@/features/admin/hooks/useAdmin";
import { Users, UserCheck, UserX, TrendingUp, TrendingDown, ArrowLeftRight, Activity } from "lucide-react";
import { formatVND } from "@/features/transactions/components/AmountDisplay";

export function AdminStatsPage() {
  const { data, isLoading, isError } = useAdminStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <p className="text-red-500">Lỗi khi tải dữ liệu hệ thống.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Tổng Số Người Dùng",
      value: stats.totalUsers,
      icon: Users,
      color: "#3b82f6",
      bg: "#3b82f620",
    },
    {
      label: "Người Dùng Hoạt Động",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "#10b981",
      bg: "#10b98120",
    },
    {
      label: "Người Dùng Bị Khóa",
      value: stats.lockedUsers,
      icon: UserX,
      color: "#ef4444",
      bg: "#ef444420",
    },
    {
      label: "Người Dùng Mới (Hôm nay)",
      value: stats.newUsersToday,
      icon: Activity,
      color: "#f59e0b",
      bg: "#f59e0b20",
    },
    {
      label: "Tổng Thu Nhập Đã Ghi Nhận",
      value: stats.totalIncomes,
      icon: TrendingUp,
      color: "#1DD1A1",
      bg: "#1DD1A120",
    },
    {
      label: "Tổng Chi Tiêu Đã Ghi Nhận",
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: "#FF6B6B",
      bg: "#FF6B6B20",
    },
    {
      label: "Tổng Giao Dịch",
      value: stats.totalTransactions,
      icon: ArrowLeftRight,
      color: "#8b5cf6",
      bg: "#8b5cf620",
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Thống kê Hệ thống
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 leading-5">
              Giám sát tổng quan ứng dụng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{label}</span>
              </div>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-semibold leading-7" style={{ color }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Tổng Lượng Tiền Chi Tiêu Trên Hệ Thống</h2>
          </div>
          <p className="text-4xl font-bold text-foreground">
            {formatVND(Number(stats.totalExpenseAmount))}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Được tính từ tất cả các khoản chi tiêu của tất cả người dùng.
          </p>
        </div>

      </div>
    </div>
  );
}
