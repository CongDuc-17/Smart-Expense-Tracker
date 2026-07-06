import { useEffect, useState } from "react";
import type { User, UserStatusEnum } from "@/features/users/types/user.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";

interface AdminUser extends User {
  verify: boolean;
  _count: {
    expenses: number;
    incomes: number;
    budgets: number;
  };
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/users`, {
        params: { page, limit: 10, search }
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotal(response.data.pagination.totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, currentStatus: UserStatusEnum) => {
    const newStatus = currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Đã ${newStatus === "LOCKED" ? "khóa" : "mở khóa"} người dùng`);
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as UserStatusEnum } : u));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <form onSubmit={handleSearch} className="flex max-w-sm items-center space-x-2 pt-2">
            <Input 
              type="text" 
              placeholder="Tìm theo tên hoặc email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit">Tìm kiếm</Button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Giao dịch</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Đang tải...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Không có người dùng nào</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "ACTIVE" ? "success" : "destructive" as any}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        Thu: {user._count.incomes} / Chi: {user._count.expenses}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== "ADMIN" && (
                          <Button 
                            variant={user.status === "ACTIVE" ? "destructive" : "default"} 
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Tổng cộng {total} người dùng
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= total}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
