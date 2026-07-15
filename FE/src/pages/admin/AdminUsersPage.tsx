import { useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "@/features/admin/hooks/useAdmin";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreVertical, Search, Lock, Unlock, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [role, setRole] = useState<string>("ALL");

  const { data, isLoading, isError } = useAdminUsers({
    page,
    limit: 10,
    search: search || undefined,
    status: status !== "ALL" ? status : undefined,
    role: role !== "ALL" ? role : undefined,
  });

  const { mutate: updateStatus, isPending } = useUpdateUserStatus();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus({ id, status: newStatus });
  };

  const users = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground leading-8 tracking-tight">
              Quản lý Người dùng
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 leading-5">
              Hệ thống có tổng cộng {total} tài khoản
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 bg-card p-4 rounded-lg border border-border shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email hoặc tên..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="LOCKED">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={(val) => { setRole(val); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Phân quyền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả quyền</SelectItem>
              <SelectItem value="USER">Người dùng</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead>Hoạt động (Thu/Chi)</TableHead>
                <TableHead>Quyền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-red-500">
                    Lỗi khi tải dữ liệu.
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user._count.incomes} Thu / {user._count.expenses} Chi
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          ADMIN
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          USER
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === "ACTIVE" ? (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/30 text-red-600 bg-red-500/10">
                          Đã khóa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === "ACTIVE" ? (
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => handleStatusChange(user.id, "LOCKED")}
                              disabled={isPending}
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              onClick={() => handleStatusChange(user.id, "ACTIVE")}
                              disabled={isPending}
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Mở khóa tài khoản
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {page} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Trang sau
          </Button>
        </div>

      </div>
    </div>
  );
}
