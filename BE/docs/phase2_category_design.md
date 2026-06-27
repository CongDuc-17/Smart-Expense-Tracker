# PHASE 2: CATEGORY MODULE - API DEVELOPMENT WORKFLOW

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Quản lý danh mục thu/chi (Categories) để phân loại các giao dịch tài chính. Hệ thống cần cung cấp các danh mục mặc định (system-defined) cho tất cả người dùng và cho phép người dùng tự tạo các danh mục cá nhân hóa (user-defined).

### User Story
* Là một người dùng, tôi muốn xem danh sách các danh mục (mặc định và do tôi tạo) để có thể chọn khi thêm giao dịch mới.
* Là một người dùng, tôi muốn tạo thêm danh mục mới với tên, màu sắc và icon tùy chọn để phù hợp với nhu cầu cá nhân.
* Là một người dùng, tôi muốn sửa hoặc xóa các danh mục do chính tôi tạo ra khi không còn nhu cầu sử dụng.

### Use Cases & Edge Cases
* **Use Case 1:** Lấy danh sách danh mục (có thể filter theo `type` là INCOME hoặc EXPENSE).
* **Use Case 2:** Tạo danh mục mới cho người dùng.
* **Use Case 3:** Sửa thông tin danh mục cá nhân (icon, color, name).
* **Use Case 4:** Xóa danh mục cá nhân.
* **Edge Case 1:** Người dùng cố gắng sửa/xóa danh mục mặc định của hệ thống (`isDefault = true`). -> **Rule:** Chặn (Throw 403 Forbidden).
* **Edge Case 2:** Xóa một danh mục đang được sử dụng bởi `Expense`, `Income` hoặc `Budget`. -> **Rule:** Chặn xóa (Throw 409 Conflict) và yêu cầu người dùng chuyển giao dịch sang danh mục khác trước khi xóa. (Tránh lỗi Foreign Key constraint).
* **Edge Case 3:** Người dùng tạo danh mục trùng tên với một danh mục đã có (mặc định hoặc của chính họ) cùng loại (INCOME/EXPENSE). -> **Rule:** Chặn (Throw 409 Conflict - Prisma schema đã có `@@unique([name, type, userId])`).

### Bảng Phân Tích Feature

| Feature | Description |
| ------- | ----------- |
| Get Categories | Lấy danh sách categories bao gồm danh mục `isDefault = true` và danh mục có `userId` bằng với user hiện tại. Hỗ trợ lọc theo `type`. |
| Create Category | Tạo danh mục mới với `userId` được gán tự động từ JWT token, `isDefault = false`. |
| Update Category | Cập nhật thông tin danh mục. Chỉ áp dụng cho danh mục có `userId` khớp với user hiện hành và `isDefault = false`. |
| Delete Category | Xóa danh mục. Chỉ xóa được khi chưa có giao dịch nào liên kết và phải là chủ sở hữu danh mục đó. |
| Seed Categories | Chạy script tạo các danh mục mặc định (Ăn uống, Di chuyển, Lương, v.v...) cho hệ thống. |

---

## 2. DATABASE DESIGN

Dựa vào file `schema.prisma` hiện tại, cấu trúc Database cho `Category` đã được định nghĩa rất tốt. Không cần thêm bảng mới nhưng cần review lại cấu trúc hiện tại.

### Cấu trúc hiện tại (Đã tối ưu)
```prisma
model Category {
    id        String              @id @default(cuid())
    name      String
    userId    String?             // Nullable cho default categories
    type      TransactionTypeEnum // INCOME hoặc EXPENSE
    icon      String              // e.g. "food", "transport", "salary"
    color     String              // e.g. "#FF6B6B"
    isDefault Boolean             @default(false) 

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    // Relations
    expenses Expense[]
    incomes  Income[]
    budgets  Budget[]

    @@unique([name, type, userId])
    @@index([userId])
    @@index([type])
    @@map("categories")
}
```

### Phân tích Relationships
* **User (1) - (N) Category:** Mỗi user có thể tạo nhiều categories.
* **Category (1) - (N) Expense:** Một danh mục chứa nhiều khoản chi. FK `categoryId` trong `Expense` không có `onDelete: Cascade`, điều này rất tốt để bảo vệ dữ liệu, chống xóa nhầm danh mục đang có giao dịch.
* **Category (1) - (N) Income:** Tương tự Expense.
* **Category (1) - (N) Budget:** Tương tự Expense.

**Lưu ý kỹ thuật:** Không cần sửa đổi schema ở Phase này. Cấu trúc đã thoả mãn đầy đủ logic nghiệp vụ.

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/categories`
* **Method:** GET
* **Authorization:** USER
* **Query Parameters:** `type` (optional, enum: INCOME, EXPENSE)
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "name": "Ăn uống",
      "type": "EXPENSE",
      "icon": "fast-food",
      "color": "#FF5733",
      "isDefault": true
    }
  ]
}
```

### 3.2. `POST /api/categories`
* **Method:** POST
* **Authorization:** USER
* **Request Body:**
```json
{
  "name": "Trà sữa",
  "type": "EXPENSE",
  "icon": "cup",
  "color": "#00FF00"
}
```
* **Response (201 Created):** category vừa tạo.
* **Error Responses:**
  * `400 Bad Request`: Validation error.
  * `409 Conflict`: Tên category đã tồn tại cho loại giao dịch này.

### 3.3. `PATCH /api/categories/:id`
* **Method:** PATCH
* **Authorization:** USER
* **Request Body (Partial):**
```json
{
  "name": "Trà sữa (Ngon)",
  "icon": "cup-outline",
  "color": "#00AA00"
}
```
* **Response (200 OK):** category sau khi update.
* **Error Responses:**
  * `403 Forbidden`: Cố gắng update danh mục mặc định hoặc danh mục của người khác.
  * `404 Not Found`: Không tìm thấy category.

### 3.4. `DELETE /api/categories/:id`
* **Method:** DELETE
* **Authorization:** USER
* **Response (200 OK):** `{"status": "success", "message": "Category deleted successfully"}`
* **Error Responses:**
  * `403 Forbidden`: Cố gắng xóa danh mục mặc định hoặc của người khác.
  * `409 Conflict`: Danh mục đang được sử dụng ở Expense/Income/Budget.

---

## 4. REQUEST VALIDATION DESIGN (Zod Schemas)

```typescript
import { z } from 'zod';
import { TransactionTypeEnum } from '@prisma/client';

export const getCategoriesQuerySchema = z.object({
  type: z.nativeEnum(TransactionTypeEnum).optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(50),
    type: z.nativeEnum(TransactionTypeEnum),
    icon: z.string().min(1, "Icon là bắt buộc"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu phải là định dạng Hex (vd: #FF0000)"),
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().cuid("ID không hợp lệ"),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  })
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().cuid("ID không hợp lệ"),
  })
});
```

---

## 5. SERVICE LAYER DESIGN

**`CategoryService` Responsibilities:**

* `findAll(userId: string, type?: TransactionTypeEnum)`:
  * Lấy tất cả danh mục thỏa mãn: `userId = userId` HOẶC `isDefault = true`.
  * Nếu có `type` filter, thêm điều kiện `type = type`.
* `create(userId: string, data: CreateCategoryDTO)`:
  * Kiểm tra trùng lặp dựa vào logic `unique([name, type, userId])`. Prisma sẽ ném lỗi `P2002` nếu trùng. Service cần bắt lỗi này và throw Custom Conflict Exception.
  * Gọi repository để tạo category với `isDefault = false`.
* `update(userId: string, categoryId: string, data: UpdateCategoryDTO)`:
  * Tìm category theo `categoryId`. Nếu không có -> 404.
  * **Business Rule:** Kiểm tra `category.userId === userId` và `category.isDefault === false`. Nếu không thỏa mãn -> throw 403 Forbidden.
  * Thực hiện update.
* `delete(userId: string, categoryId: string)`:
  * Tìm category theo `categoryId`. -> 404 nếu không có.
  * **Business Rule:** Kiểm tra quyền sở hữu và `isDefault` -> throw 403.
  * **Business Rule:** Kiểm tra xem category có đang gắn với bất kỳ Expense/Income/Budget nào không (thông qua count). Nếu `count > 0` -> throw 409 Conflict.
  * Thực hiện xóa.

---

## 6. CONTROLLER DESIGN

**`CategoryController`**

* `getCategories(req, res, next)`:
  * Input: `req.user.id`, `req.query.type`.
  * Output: HTTP 200, danh sách categories.
* `createCategory(req, res, next)`:
  * Input: `req.user.id`, `req.body`.
  * Output: HTTP 201, category mới tạo.
* `updateCategory(req, res, next)`:
  * Input: `req.user.id`, `req.params.id`, `req.body`.
  * Output: HTTP 200, category đã sửa.
* `deleteCategory(req, res, next)`:
  * Input: `req.user.id`, `req.params.id`.
  * Output: HTTP 200, message success.

---

## 7. REPOSITORY / PRISMA DESIGN

Các Prisma Query tối ưu cần thực hiện trong `CategoryRepository` hoặc trực tiếp tại `CategoryService`:

* **`findMany`** (Lấy danh sách):
  ```typescript
  prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: userId }
      ],
      type: type // nếu có
    },
    orderBy: { name: 'asc' }
  });
  ```
* **`findUnique`** (Lấy chi tiết để kiểm tra quyền):
  ```typescript
  prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { expenses: true, incomes: true, budgets: true }
      }
    }
  });
  ```
  *Lý do dùng `_count`: Để biết ngay danh mục có đang được sử dụng hay không chỉ với 1 query duy nhất, phục vụ cho logic DELETE.*
* **`create`**, **`update`**, **`delete`**: Sử dụng query chuẩn của Prisma.

**Indexes:** Schema đã có `@@index([userId])` và `@@index([type])`. Các query trên sẽ chạy rất mượt nhờ các index này. Không cần tạo thêm.

---

## 8. SECURITY REVIEW

* **Authentication:** Tất cả các route đều yêu cầu JWT Token hợp lệ (authGuard).
* **Authorization / Ownership checking:** 
  * Bắt buộc kiểm tra `userId` của bản ghi với `req.user.id` trước khi thao tác `PATCH` hoặc `DELETE`.
  * Không cho phép thao tác trên các bản ghi có `isDefault = true`.
* **Mass assignment:** Endpoint update chỉ được map với schema Zod gồm `name`, `color`, `icon`. Loại bỏ triệt để các trường nhạy cảm như `isDefault` hay `userId` khỏi body request để tránh lỗ hổng Mass Assignment.
* **Rate Limiting:** Áp dụng rate limit cho `POST /api/categories` để tránh user tạo spam quá nhiều categories rác làm nặng DB (VD: 10 request / phút).

---

## 9. TESTING PLAN

### Unit Test Cases (Category Service)
| Case | Expected Result |
| ---- | -------- |
| Create category với valid data | Trả về Category Object |
| Create category trùng tên cùng type | Throw 409 Conflict Error |
| Update category của user khác | Throw 403 Forbidden Error |
| Update category mặc định | Throw 403 Forbidden Error |
| Delete category đang có Expense | Throw 409 Conflict Error |

### Integration Test Cases
| API | Scenario | Expected |
| --- | -------- | -------- |
| `GET /categories` | User lấy danh sách category | Trả về 200 OK + mảng category (chứa cả default và của user đó, ko có của user khác) |
| `POST /categories`| Request body thiếu trường `color` | Trả về 400 Bad Request (Zod Error) |
| `PATCH /categories/:id`| Cập nhật màu sắc thành công | Trả về 200 OK + Category object có màu mới |

### E2E Cases
| Flow | Description |
| ---- | ----------- |
| User CRUD Category | Đăng nhập -> Tạo category -> Gọi list kiểm tra -> Sửa category -> Xóa category -> Lấy list đảm bảo đã xóa. |

---

## 10. SWAGGER DESIGN

* **Tags:** `Categories`
* **Schemas:**
  * `CategoryResponse`: id, name, type, icon, color, isDefault
  * `CreateCategoryRequest`: name, type, icon, color
  * `UpdateCategoryRequest`: name, icon, color
* **Paths:**
  * `/api/categories` (GET, POST)
  * `/api/categories/{id}` (PATCH, DELETE)
  * Đính kèm `Bearer Auth` vào tất cả các endpoints này.

---

## 11. IMPLEMENTATION ORDER

Thứ tự code thực tế (Ước lượng tổng thời gian: 4-6 giờ):

1. **[Easy]** Zod Validation Schemas cho Category.
2. **[Medium]** Implement `CategoryService` với các logic validation nghiệp vụ (kiểm tra quyền, kiểm tra _count relations).
3. **[Easy]** Implement `CategoryController` (map request vào Service, xử lý response).
4. **[Easy]** Đăng ký Route (`category.route.ts`) và gắn Middleware Auth, Zod Validation.
5. **[Medium]** Viết script Seed `seed-categories.ts` để tạo các danh mục mặc định.
6. **[Medium]** Cập nhật Swagger docs cho endpoints.
7. **[Hard]** Viết Unit Tests & Integration Tests.

---

## 12. DEFINITION OF DONE (DoD)

Phase 2 được xem là hoàn thành khi:
* [ ] Các API GET, POST, PATCH, DELETE hoạt động chính xác theo test cases.
* [ ] Các trường hợp Edge Cases (cập nhật default, xóa category đang dùng) đã bị block đúng HTTP Status.
* [ ] Validation request bằng Zod bao phủ 100% các endpoint.
* [ ] Swagger/OpenAPI hiển thị đầy đủ thông tin, schema và test thành công từ Swagger UI.
* [ ] Unit/Integration tests pass. Test coverage cho `CategoryService` đạt tối thiểu 80%.
* [ ] Tuân thủ chặt chẽ nguyên tắc: Controller chỉ nhận request/response, mọi logic nghiệp vụ (Ownership, Conflict) nằm tại Service layer.

---

### MỞ RỘNG & LƯU Ý KỸ THUẬT CHO CÁC PHASE SAU

* **Anti-pattern cần tránh:** Xử lý logic check quyền hoặc kiểm tra database ngay tại Controller. Điều này khiến code khó tái sử dụng và khó viết Unit Test.
* **Technical Debt phát sinh:** Nếu trong tương lai có quá nhiều "default categories", query lấy `isDefault: true` có thể trả về danh sách dài, tuy nhiên với ứng dụng cá nhân thì điều này ít khi xảy ra.
* **Tối ưu cho Phase sau (Phase 3 & 5):** Khi thiết kế `Expense` và `Budget`, việc sử dụng `_count` ở API `findUnique` category là rất quan trọng để đảm bảo tính toàn vẹn dữ liệu. Nếu hệ thống cho phép "Soft Delete" category, cần phải có cờ `isDeleted` trong bảng Category (nhưng thiết kế hiện tại dùng Hard Delete + Ràng buộc quan hệ là tốt nhất cho dữ liệu phân loại). Chú ý không được xóa cứng (hard delete) các Expense ở Phase 3.
