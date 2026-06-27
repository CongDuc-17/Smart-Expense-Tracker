# ADMIN MODULE — API DEVELOPMENT WORKFLOW

> **Note:** Chạy song song với các phase khác. Tích hợp `roleGuard` đã có từ Phase 1.
> **Authorization:** ADMIN role only

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cung cấp giao diện quản trị cho Admin để giám sát hệ thống, quản lý tài khoản người dùng và theo dõi thống kê tổng thể ứng dụng.

### User Story (Admin)
- Là Admin, tôi muốn xem danh sách tất cả user để quản lý tài khoản.
- Là Admin, tôi muốn khóa tài khoản user vi phạm để bảo vệ hệ thống.
- Là Admin, tôi muốn xem thống kê tổng số user, tổng giao dịch để monitor hệ thống.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | GET danh sách users với phân trang và search | Filter theo email, status |
| UC2 | Khóa/Mở tài khoản user | Cập nhật `status = LOCKED | ACTIVE` |
| UC3 | Xem thống kê hệ thống | Tổng user, total transactions, total users registered today |
| EC1 | Admin tự khóa chính mình | Chặn — không thể lock chính account mình đang dùng |
| EC2 | Khóa user đang ADMIN | Chặn (hoặc chỉ Super Admin có thể làm — out of scope) |
| EC3 | User bị khóa cố gắng đăng nhập | Auth middleware check `status === 'LOCKED'` → 401 |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Get Users (Admin) | Danh sách user với search, filter theo status/role, phân trang |
| Get User Detail | Xem chi tiết 1 user (không trả mật khẩu) |
| Update User Status | Lock/Unlock tài khoản |
| System Stats | Thống kê tổng hợp toàn hệ thống |
| **Seed Default Categories** | Admin trigger seed categories mặc định (nếu chưa có) |

---

## 2. DATABASE DESIGN

Không cần bảng mới. `UserStatusEnum` (`ACTIVE`, `LOCKED`) đã có trong schema.

---

## 3. API CONTRACT DESIGN

### `GET /api/admin/users`

**Authorization:** ADMIN  
**Query Params:** `page`, `limit`, `search` (email/name), `status` (ACTIVE|LOCKED), `role` (USER|ADMIN)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "role": "USER",
      "status": "ACTIVE",
      "verify": true,
      "createdAt": "2026-01-01T...",
      "_count": {
        "expenses": 45,
        "incomes": 12,
        "budgets": 3
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

### `GET /api/admin/users/:id`

**Response (200 OK):** User detail (không có password/salt)

### `PATCH /api/admin/users/:id/status`

**Request Body:**
```json
{ "status": "LOCKED" }
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": { "id": "cuid...", "status": "LOCKED" }
}
```

**Errors:**
- `403`: Admin cố khóa chính mình
- `404`: User không tồn tại

### `GET /api/admin/stats`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalUsers": 500,
    "activeUsers": 480,
    "lockedUsers": 20,
    "newUsersToday": 5,
    "totalExpenses": 15000,
    "totalIncomes": 8000,
    "totalTransactions": 23000,
    "totalExpenseAmount": "450000000"
  }
}
```

### `POST /api/admin/seed-categories`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": { "created": 12, "skipped": 0, "message": "Seed categories hoàn thành" }
}
```

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const adminGetUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    status: z.nativeEnum(UserStatusEnum).optional(),
    role: z.nativeEnum(RoleEnum).optional(),
  })
});

export const updateUserStatusSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    status: z.nativeEnum(UserStatusEnum)
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class AdminUserService {
  findAll(query: AdminGetUsersDTO): Promise<PaginatedUsers>
  findById(userId: string): Promise<UserDetail>
  updateStatus(adminId: string, targetUserId: string, status: UserStatusEnum): Promise<User>
  getSystemStats(): Promise<SystemStats>
  seedDefaultCategories(): Promise<SeedResult>
}
```

**`updateStatus()` Business Rules:**
```
1. Không cho phép admin tự lock mình: adminId === targetUserId → throw 403
2. (Optional) Không cho phép lock ADMIN role khác
3. Update user.status
4. Nếu status = LOCKED: Xóa tất cả RefreshToken của user đó → Force logout ngay lập tức
```

**`getSystemStats()` — Parallel aggregates:**
```typescript
const [totalUsers, activeUsers, totalExpenses, totalIncomes, newUsersToday] =
  await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.expense.count({ where: { deletedAt: null } }),
    prisma.income.count({ where: { deletedAt: null } }),
    prisma.user.count({
      where: { createdAt: { gte: startOfToday() } }
    })
  ]);
```

---

## 6. CONTROLLER DESIGN

**`AdminController`**

| Method | Handler | Status |
|--------|---------|--------|
| GET | `getUsers` | 200 |
| GET | `getUserById` | 200 |
| PATCH | `updateUserStatus` | 200 |
| GET | `getSystemStats` | 200 |
| POST | `seedCategories` | 200 |

---

## 7. REPOSITORY / PRISMA DESIGN

**`findAll` với search:**
```typescript
prisma.user.findMany({
  where: {
    ...(search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : {}),
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
  },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    status: true,
    verify: true,
    createdAt: true,
    // KHÔNG select: password, salt, refreshTokens
    _count: {
      select: { expenses: true, incomes: true, budgets: true }
    }
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| Role bypass | `roleGuard('ADMIN')` middleware trên tất cả routes `/api/admin/*` |
| Admin self-lock | Check `adminId === targetUserId` trong service |
| Password leak | Dùng `select` để exclude `password`, `salt` hoàn toàn |
| Privilege escalation | Chỉ SUPER_ADMIN mới tạo được ADMIN (out of scope, nhưng cần document) |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| Admin cố self-lock | Throw 403 |
| Lock user → Refresh tokens bị xóa | `prisma.refreshToken.deleteMany` được gọi |
| `getSystemStats` với DB rỗng | Trả về object với tất cả giá trị = 0 |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `GET /admin/users` | USER thường gọi endpoint Admin | 403 Forbidden |
| `PATCH /admin/users/:id/status` | Lock user → User đó gọi API | 401 Unauthorized |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Admin
    description: Admin-only management endpoints

x-tagGroups:
  - name: Admin
    tags: [Admin]
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | `roleGuard` middleware (có thể đã có từ Phase 1) | Easy |
| 2 | Seed categories script | Medium |
| 3 | `AdminUserService` | Medium |
| 4 | `AdminController` + Routes under `/api/admin/*` | Easy |
| 5 | Swagger | Easy |
| 6 | Tests | Medium |

---

## 12. DEFINITION OF DONE

- [ ] Tất cả admin routes đều bị block với USER thường (403)
- [ ] Lock user → Force logout (xóa refresh tokens)
- [ ] Không có password/salt trong response
- [ ] System stats chính xác

---

## ⚠️ Anti-Patterns
- **Expose admin routes không có `roleGuard`:** Nguy hiểm nhất. Phải test endpoint không có token hoặc với USER token.
- **Cho phép admin update `role` của user qua API:** Out of scope, nhưng nếu implement thì phải cực kỳ cẩn thận về privilege escalation.
