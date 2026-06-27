# PHASE 5: BUDGET MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 2 (Category), Phase 3 (Expense)
> **Enables:** Phase 7 (Analytics), Phase 8 (Notification)

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cho phép người dùng thiết lập hạn mức chi tiêu (Budget) theo từng danh mục và từng tháng. Hệ thống tự động tính toán phần trăm đã sử dụng và gửi cảnh báo (Notification) khi vượt ngưỡng 70% (WARNING) hoặc 90% (EXCEEDED). Đây là tính năng **cốt lõi** tạo ra giá trị phân biệt của ứng dụng.

### User Story
- Là người dùng, tôi muốn đặt hạn mức chi tiêu cho danh mục "Ăn uống" là 3,000,000 VNĐ mỗi tháng.
- Là người dùng, tôi muốn xem mình đã tiêu bao nhiêu % so với hạn mức đã đặt, theo từng danh mục.
- Là người dùng, tôi muốn nhận cảnh báo khi sắp chạm ngưỡng ngân sách để điều chỉnh chi tiêu kịp thời.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Tạo budget mới cho category/tháng/năm | Mỗi user chỉ có 1 budget cho 1 category trong 1 tháng/năm |
| UC2 | Xem danh sách budget tháng hiện tại | Trả về kèm `spentAmount` (tổng expense), `percentage`, `alertStatus` |
| UC3 | Cập nhật `limitAmount` của budget | Tính toán lại `alertStatus` ngay sau khi update |
| UC4 | Xóa budget | Hard delete (không cần soft delete cho budget) |
| EC1 | Tạo budget trùng category + month + year | 409 Conflict (Schema có `@@unique([userId, categoryId, month, year])`) |
| EC2 | Budget cho category của người khác | 400/403 — Validate category ownership |
| EC3 | `limitAmount` = 0 | 400 — Chặn: hạn mức phải > 0 |
| EC4 | Month/Year không hợp lệ (13, 999) | 400 — Zod validation |
| EC5 | Thêm Expense vượt ngưỡng | Trigger budget check → update `alertStatus` → Tạo Notification |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Create Budget | Đặt hạn mức. Validate category ownership. |
| Get Budgets by Month/Year | Lấy tất cả budget của user trong tháng, kèm `spentAmount` được tính từ Expense aggregate. |
| Update Budget | Đổi `limitAmount`. Tính lại `alertStatus`. |
| Delete Budget | Xóa hạn mức. |
| **Budget Check (Internal)** | Service nội bộ được gọi sau mỗi khi Expense được thêm/sửa/xóa để cập nhật `alertStatus` và sinh Notification. |

---

## 2. DATABASE DESIGN

### Cấu trúc hiện tại (Đã đủ)

```prisma
model Budget {
    id          String                @id @default(cuid())
    userId      String
    categoryId  String
    limitAmount Decimal               @db.Decimal(12, 2)
    month       Int // 1 - 12
    year        Int
    alertStatus BudgetAlertStatusEnum @default(NORMAL)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    category Category @relation(fields: [categoryId], references: [id])

    @@unique([userId, categoryId, month, year])
    @@index([userId, month, year])
    @@map("budgets")
}
```

### Schema Optimization Đề xuất

```prisma
model Budget {
    // ... existing fields ...

    // THÊM: Lưu snapshot spentAmount để không phải aggregate mỗi lần GET
    // Được cập nhật bởi BudgetCheckService sau mỗi expense mutation
    spentAmount Decimal @default(0) @db.Decimal(12, 2) // [MỚI]

    @@map("budgets")
}
```

> **Lý do thêm `spentAmount`:** Nếu mỗi lần GET `/budgets` đều phải chạy `SUM(amount)` từ bảng Expense, hiệu năng sẽ kém khi có nhiều user. Giải pháp là **dùng `spentAmount` như một denormalized cache** được cập nhật tự động khi Expense thay đổi (Event-Driven approach). Trade-off: cần đảm bảo tính consistency.

### Relationships
```
User  1-N Budget
Category 1-N Budget
Budget được check sau mỗi Expense mutation (Event: expense.created, expense.updated, expense.deleted)
Budget 1-N Notification (gián tiếp qua BudgetCheckService → NotificationService)
```

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/budgets?month=&year=`

**Authorization:** USER  
**Query Params:** `month` (required), `year` (required)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "category": { "id": "...", "name": "Ăn uống", "icon": "food", "color": "#FF5733" },
      "limitAmount": "3000000",
      "spentAmount": "2100000",
      "remainingAmount": "900000",
      "percentage": 70.0,
      "alertStatus": "WARNING",
      "month": 6,
      "year": 2026
    }
  ]
}
```

### 3.2. `POST /api/budgets`

**Request Body:**
```json
{
  "categoryId": "cuid...",
  "limitAmount": 3000000,
  "month": 6,
  "year": 2026
}
```
**Response (201 Created):** Budget object

**Errors:** `409` (trùng budget), `400` (invalid input), `403` (wrong category)

### 3.3. `PATCH /api/budgets/:id`

**Request Body:** `{ "limitAmount": 4000000 }`  
**Response (200 OK):** Updated budget với `alertStatus` được tính lại.

### 3.4. `DELETE /api/budgets/:id`

**Response (200 OK):** `{ "status": "success", "message": "Budget deleted" }`

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid(),
    limitAmount: z.number().positive("Hạn mức phải lớn hơn 0").max(999_999_999),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
  })
});

export const updateBudgetSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    limitAmount: z.number().positive().max(999_999_999),
  })
});

export const getBudgetsQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class BudgetService {
  // CRUD
  create(userId, dto): Promise<Budget>
  findAll(userId, month, year): Promise<BudgetWithStats[]>
  update(userId, budgetId, dto): Promise<Budget>
  delete(userId, budgetId): Promise<void>

  // CORE: Internal method - được gọi bởi ExpenseService
  checkAndUpdateBudget(userId, categoryId, month, year): Promise<void>
}
```

**`checkAndUpdateBudget()` Logic (Critical Path):**
```
1. Tìm Budget với [userId, categoryId, month, year]
2. Nếu không có Budget → Return sớm (user chưa đặt ngưỡng)
3. Aggregate SUM(expense.amount) WHERE userId, categoryId, month, year, deletedAt IS NULL
4. Tính percentage = (spent / limitAmount) * 100
5. Xác định newAlertStatus:
   - percentage < 70  → NORMAL
   - percentage >= 70 → WARNING
   - percentage >= 90 → EXCEEDED
6. UPDATE budget SET spentAmount = spent, alertStatus = newAlertStatus
7. Nếu alertStatus THAY ĐỔI:
   - Gọi NotificationService.create() với type tương ứng
```

**Business Rule quan trọng:** Chỉ tạo Notification khi `alertStatus` **thay đổi từ thấp lên cao** (NORMAL→WARNING, NORMAL→EXCEEDED, WARNING→EXCEEDED). Không spam notification mỗi lần thêm expense.

---

## 6. CONTROLLER DESIGN

**`BudgetController`**

| Method | Handler | HTTP Status | Notes |
|--------|---------|-------------|-------|
| GET | `getBudgets(req, res)` | 200 | Kèm computed fields |
| POST | `createBudget(req, res)` | 201 | |
| PATCH | `updateBudget(req, res)` | 200 | Tính lại alertStatus |
| DELETE | `deleteBudget(req, res)` | 200 | |

---

## 7. REPOSITORY / PRISMA DESIGN

**`findAll` với computed fields:**
```typescript
// Lấy budget + aggregate spentAmount real-time từ expenses
// Option A: Dùng spentAmount đã cache trong Budget table (nếu implement event-driven)
prisma.budget.findMany({
  where: { userId, month, year },
  include: {
    category: { select: { name: true, icon: true, color: true } }
  }
});

// Sau đó compute remainingAmount và percentage ở Service layer
const enriched = budgets.map(b => ({
  ...b,
  spentAmount: b.spentAmount,
  remainingAmount: b.limitAmount - b.spentAmount,
  percentage: (b.spentAmount / b.limitAmount * 100).toFixed(2)
}));
```

**`checkAndUpdateBudget` aggregate query:**
```typescript
const result = await prisma.expense.aggregate({
  where: {
    userId,
    categoryId,
    deletedAt: null,
    date: {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1)
    }
  },
  _sum: { amount: true }
});
const spent = result._sum.amount ?? 0;
```

**Index cần thiết (đã có):** `@@index([userId, month, year])` trên Budget.

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| Ownership | Bắt buộc `userId` từ token cho mọi CRUD operation |
| Category Cross-user | Validate `category.userId === userId OR category.isDefault === true` |
| `limitAmount` manipulation | Chỉ cho phép update `limitAmount`, không cho phép update `alertStatus` trực tiếp từ client |
| Mass Assignment | Body chỉ nhận `categoryId`, `limitAmount`, `month`, `year` |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| `checkAndUpdateBudget`: spent = 0 | alertStatus = NORMAL |
| `checkAndUpdateBudget`: spent = 75% | alertStatus = WARNING, Notification được tạo |
| `checkAndUpdateBudget`: spent = 95% | alertStatus = EXCEEDED, Notification được tạo |
| Notification không bị tạo 2 lần | Chỉ notify khi status **thay đổi** (NORMAL→WARNING), không notify nếu vẫn là WARNING |
| Create budget trùng | Throw 409 Conflict |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `POST /budgets` | Tạo budget hợp lệ | 201 + budget object |
| `GET /budgets` | Lấy budget tháng 6/2026 | Trả về kèm percentage, alertStatus |
| `PATCH /expenses` | Update amount làm tăng chi tiêu > 90% | Budget alertStatus cập nhật EXCEEDED |

### E2E Cases

| Flow | Description |
|------|-------------|
| Budget Alert Flow | Tạo Budget (3tr) → Thêm Expense (2.1tr) → Kiểm tra Budget percentage = 70% và alertStatus = WARNING → Kiểm tra Notification được tạo |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Budgets
    description: Quản lý ngân sách theo danh mục và tháng

components:
  schemas:
    BudgetResponse:
      type: object
      properties:
        id: { type: string }
        category: { $ref: '#/components/schemas/CategorySummary' }
        limitAmount: { type: string, example: "3000000" }
        spentAmount: { type: string, example: "2100000" }
        remainingAmount: { type: string, example: "900000" }
        percentage: { type: number, example: 70.0 }
        alertStatus:
          type: string
          enum: [NORMAL, WARNING, EXCEEDED]
        month: { type: integer }
        year: { type: integer }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Update Prisma Schema: thêm `spentAmount` vào Budget | Easy |
| 2 | Migration | Easy |
| 3 | Zod Schemas | Easy |
| 4 | `BudgetService`: CRUD methods | Medium |
| 5 | `BudgetService.checkAndUpdateBudget()` | Hard |
| 6 | Tích hợp `checkAndUpdateBudget` vào `ExpenseService` (sau create/update/delete) | Medium |
| 7 | `BudgetController` | Easy |
| 8 | `budget.route.ts` | Easy |
| 9 | Swagger docs | Medium |
| 10 | Unit Tests (đặc biệt test `checkAndUpdateBudget`) | Hard |
| 11 | Integration Tests | Hard |

---

## 12. DEFINITION OF DONE

- [ ] CRUD Budget hoạt động đúng
- [ ] `spentAmount` và `alertStatus` được cập nhật tự động sau mỗi Expense mutation
- [ ] Notification được tạo đúng timing (chỉ khi status thay đổi)
- [ ] Không có duplicate Notification khi thêm nhiều expenses liên tục ở cùng threshold
- [ ] Test coverage cho `checkAndUpdateBudget()` đạt 100% branch coverage

---

## ⚠️ Anti-Patterns Cần Tránh
- **Tính `spentAmount` real-time từ aggregate mỗi lần GET:** Khi user có nhiều expense, query này sẽ rất chậm. Dùng cached `spentAmount` + event-driven update.
- **Gọi NotificationService trực tiếp trong ExpenseService:** Vi phạm Single Responsibility. Dùng Event Emitter: `eventBus.emit('expense.mutated', { userId, categoryId, month, year })` → BudgetService lắng nghe.

## 🔮 Technical Debt
- `spentAmount` snapshot có thể out-of-sync nếu có lỗi partial transaction. Nên wrap Expense mutation + Budget update trong `prisma.$transaction()`.
