# PHASE 3: EXPENSE & INCOME MODULE - API DEVELOPMENT WORKFLOW

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Quản lý các giao dịch tài chính cốt lõi bao gồm Chi tiêu (Expense) và Thu nhập (Income). Cung cấp khả năng ghi nhận, sửa đổi, xóa và tra cứu các giao dịch theo tháng, năm hoặc theo danh mục.

### User Story
* Là một người dùng, tôi muốn ghi lại các khoản chi tiêu/thu nhập hàng ngày với số tiền, ngày tháng, danh mục và ghi chú để theo dõi dòng tiền.
* Là một người dùng, tôi muốn xem danh sách các khoản chi/thu trong tháng này để biết mình đã tiêu/kiếm bao nhiêu tiền.
* Là một người dùng, tôi muốn lọc danh sách giao dịch theo một danh mục cụ thể (ví dụ: chỉ xem tiền "Ăn uống").
* Là một người dùng, tôi muốn sửa hoặc xóa một giao dịch nếu nhập sai thông tin.

### Use Cases & Edge Cases
* **Use Case 1:** Thêm giao dịch thu/chi (cần chọn đúng category).
* **Use Case 2:** Lấy danh sách giao dịch có phân trang, lọc theo khoảng thời gian (tháng/năm) và categoryId.
* **Use Case 3:** Cập nhật thông tin giao dịch (số tiền, ngày, category).
* **Use Case 4:** Xóa giao dịch (Soft delete để bảo toàn tính toàn vẹn dữ liệu cho các báo cáo lịch sử và AI Insights).
* **Edge Case 1:** Người dùng chọn một `categoryId` không tồn tại hoặc không thuộc quyền sở hữu (hoặc không phải default category). -> **Rule:** Validate category trước khi tạo/sửa giao dịch. Ném lỗi 400/404.
* **Edge Case 2:** Người dùng chọn category có type là INCOME để tạo một EXPENSE. -> **Rule:** Chặn. Giao dịch Expense phải dùng category type = EXPENSE.
* **Edge Case 3:** Xóa cứng (Hard delete). -> **Rule:** Không cho phép hard delete để tránh mất dấu vết dữ liệu AI. Sử dụng trường `deletedAt`.

### Bảng Phân Tích Feature

| Feature | Description |
| ------- | ----------- |
| Create Expense / Income | Tạo mới record. Kiểm tra logic category type matching. |
| Get Expenses / Incomes | Lấy danh sách có filter theo `month`, `year`, `categoryId`. Hỗ trợ phân trang (limit, offset). Chỉ lấy record có `deletedAt = null`. |
| Get Expense / Income Detail | Lấy chi tiết 1 record, kèm theo thông tin Category tương ứng. |
| Update Expense / Income | Sửa thông tin. Kiểm tra lại quyền sở hữu và matching của category. |
| Delete Expense / Income | Xóa mềm (Soft delete) bằng cách cập nhật `deletedAt`. |

---

## 2. DATABASE DESIGN

Cấu trúc cho Expense và Income đã sẵn sàng.

### Cấu trúc hiện tại
```prisma
model Expense {
    id         String   @id @default(cuid())
    userId     String
    categoryId String
    amount     Decimal  @db.Decimal(12, 2)
    title      String
    note       String?
    imageUrl   String?  // Dùng cho Phase 4 & 10
    date       DateTime

    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
    deletedAt DateTime? // soft delete

    // Relations
    user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
    category      Category       @relation(fields: [categoryId], references: [id])
    ocrResult     OcrResult?
    imageAnalysis ImageAnalysis?

    @@index([userId, date])
    @@index([userId, categoryId])
    @@map("expenses")
}

// Model Income tương tự...
```

### Phân tích Relationships
* **User (1) - (N) Expense/Income:** Cascade delete (Xóa user -> Xóa giao dịch).
* **Category (1) - (N) Expense/Income:** Giao dịch liên kết chặt chẽ với Category.

**Lưu ý kỹ thuật:** Mặc định Prisma không hỗ trợ soft-delete native trong schema, ta sẽ xử lý logic soft-delete ở tầng Service hoặc dùng Prisma Client Extensions.

---

## 3. API CONTRACT DESIGN

Thiết kế áp dụng chung cho cả `/api/expenses` và `/api/incomes`. (Dưới đây ví dụ cho Expenses).

### 3.1. `POST /api/expenses`
* **Method:** POST
* **Authorization:** USER
* **Request Body:**
```json
{
  "categoryId": "cuid...",
  "amount": 50000,
  "title": "Ăn trưa",
  "note": "Phở gà",
  "date": "2026-06-25T12:00:00Z",
  "imageUrl": "https://..." // Optional, từ phase upload
}
```
* **Response (201 Created):** object Expense.
* **Error:** `400 Bad Request` (Invalid category), `403 Forbidden` (Category mismatch type).

### 3.2. `GET /api/expenses`
* **Method:** GET
* **Authorization:** USER
* **Query Params:**
  * `month` (1-12)
  * `year` (YYYY)
  * `categoryId` (cuid)
  * `page` (default 1)
  * `limit` (default 20)
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": [ /* danh sách expenses */ ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### 3.3. `GET /api/expenses/:id`
* **Response (200 OK):** Chi tiết 1 expense bao gồm `Category` detail.

### 3.4. `PATCH /api/expenses/:id`
* Tương tự POST nhưng cho update partial.

### 3.5. `DELETE /api/expenses/:id`
* **Method:** DELETE
* **Response (200 OK):** Soft deleted successfully.

---

## 4. REQUEST VALIDATION DESIGN (Zod Schemas)

```typescript
import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid(),
    amount: z.number().positive("Số tiền phải lớn hơn 0"),
    title: z.string().min(2, "Tiêu đề quá ngắn").max(255),
    note: z.string().max(1000).optional(),
    date: z.string().datetime("Định dạng ngày không hợp lệ ISO 8601"),
    imageUrl: z.string().url().optional()
  })
});

export const getExpensesQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
    categoryId: z.string().cuid().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  })
});
```

---

## 5. SERVICE LAYER DESIGN

**`ExpenseService` Responsibilities:**

* `create(userId: string, data: CreateExpenseDTO)`:
  * **Validation Rule:** Lookup `Category` by `categoryId`. Nếu `category` không tồn tại hoặc (`category.userId !== userId` AND `category.isDefault === false`) -> throw 404/403.
  * **Business Rule:** Kiểm tra `category.type === 'EXPENSE'`. Nếu sai -> throw 400.
  * *Tương lai Phase 5:* Bắn sự kiện (event) kiểm tra ngân sách (Budget) sau khi tạo Expense thành công.
* `findAll(userId: string, query: GetExpensesQueryDTO)`:
  * Xây dựng Prisma `where` clause: `userId = userId` AND `deletedAt = null`.
  * Nếu có `month` & `year` -> filter theo khoảng ngày (`gte` mùng 1, `lt` mùng 1 tháng sau).
  * Thực hiện count tổng số record để trả về thông tin phân trang.
* `findById(userId: string, id: string)`:
  * Lấy chi tiết, kiểm tra `userId` matching.
* `update(userId: string, id: string, data: UpdateExpenseDTO)`:
  * Kiểm tra Expense tồn tại và thuộc về user, `deletedAt = null`.
  * Nếu đổi `categoryId`, áp dụng lại logic validation Category như hàm `create`.
  * *Tương lai Phase 5:* Bắn sự kiện tính toán lại ngân sách.
* `delete(userId: string, id: string)`:
  * Tìm Expense của user.
  * Thực hiện update `deletedAt = new Date()`.

---

## 6. CONTROLLER DESIGN

**`ExpenseController` / `IncomeController`**

* `create(req, res)`: HTTP 201
* `findAll(req, res)`: HTTP 200, trả về { data, pagination }
* `findById(req, res)`: HTTP 200
* `update(req, res)`: HTTP 200
* `delete(req, res)`: HTTP 200

---

## 7. REPOSITORY / PRISMA DESIGN

* **`findAll` (Có phân trang và Filter):**
  ```typescript
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  const whereCondition = {
    userId,
    deletedAt: null,
    ...(month && year ? { date: { gte: startOfMonth, lt: endOfMonth } } : {}),
    ...(categoryId ? { categoryId } : {})
  };

  const [total, data] = await prisma.$transaction([
    prisma.expense.count({ where: whereCondition }),
    prisma.expense.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { name: true, icon: true, color: true } } },
      orderBy: { date: 'desc' }
    })
  ]);
  ```
* **Tối ưu DB:** Index `@@index([userId, date])` và `@@index([userId, categoryId])` trên model Expense sẽ hoạt động cực kỳ hiệu quả với query này.

---

## 8. SECURITY REVIEW

* **Ownership Checking:** 100% bắt buộc. `userId` luôn được lấy từ token (req.user.id) và chèn vào điều kiện where. Không bao giờ được phép truyền `userId` từ req.body.
* **SQL Injection / NoSQL Injection:** Sử dụng Prisma ORM để auto escape inputs. Zod schema đảm bảo đúng kiểu dữ liệu (Date, Number, CUID).
* **Mass Assignment:** Schema update loại bỏ các trường hệ thống như `userId`, `id`, `createdAt`, `deletedAt`.
* **Phân trang an toàn:** Chặn max limit là 100 để tránh DoS/OOM từ DB nếu hacker gửi `limit=999999`.

---

## 9. TESTING PLAN

### Unit Test Cases (Expense Service)
| Case | Expected Result |
| ---- | -------- |
| Create Expense dùng category của Income | Throw 400 BadRequest Error |
| Create Expense thành công | Trả về data mới tạo |
| Soft Delete Expense | Trường `deletedAt` được cập nhật, trả về Success |
| Lấy dữ liệu Expense với user khác | Trả về 404 (Không tìm thấy) |

### Integration Test Cases
| API | Scenario | Expected |
| --- | -------- | -------- |
| `GET /expenses` | Truyền thiếu param `page`, `limit` | Mặc định sử dụng page 1, limit 20 |
| `GET /expenses` | Query data thuộc tháng 6/2026 | Chỉ trả về giao dịch thuộc tháng 6/2026 |
| `DELETE /expenses/:id` | Xóa Expense thành công | Kiểm tra DB bằng raw query vẫn thấy record nhưng bị ẩn ở api GET |

---

## 10. SWAGGER DESIGN

* **Tags:** `Expenses`, `Incomes`
* Tách biệt 2 group route mặc dù logic tương đồng.
* **Component Schemas:** `ExpenseResponse`, `PaginatedExpenseResponse`.
* Định nghĩa rõ params URL Query cho GET list.

---

## 11. IMPLEMENTATION ORDER

1. **[Easy]** Zod Validation Schemas cho Expense/Income.
2. **[Medium]** Build `ExpenseService` & `IncomeService`. Xử lý tái sử dụng logic (có thể dùng abstract BaseService chung vì logic In/Out khá giống nhau).
3. **[Easy]** Build Controllers.
4. **[Easy]** Routes.
5. **[Medium]** Tích hợp Swagger.
6. **[Medium]** Tests.

---

## 12. DEFINITION OF DONE (DoD)

* [ ] Các endpoint CRUD hoàn tất cho cả Incomes và Expenses.
* [ ] Soft Delete hoạt động đúng.
* [ ] Kiểm tra chặt chẽ category `type` khi thao tác.
* [ ] Phân trang (Pagination) hoạt động mượt mà.
* [ ] Date queries (Filter theo tháng/năm) đúng múi giờ.
* [ ] Sẵn sàng kiến trúc Event/Hook cho Phase 5 (Budget Module) để trigger logic cảnh báo ngân sách.
