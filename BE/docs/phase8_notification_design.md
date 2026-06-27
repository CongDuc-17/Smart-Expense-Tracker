# PHASE 8: NOTIFICATION MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 5 (Budget - tạo notification), Phase 6 (SavingGoal - tạo notification)
> **Enables:** Frontend Bell icon, real-time awareness

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cung cấp hệ thống thông báo nội bộ (in-app notification) để người dùng nắm bắt các sự kiện tài chính quan trọng: vượt ngưỡng ngân sách, đạt mục tiêu tiết kiệm, nhận insight từ AI. Module này đóng vai trò **consumer** của các event từ Phase 5 & 6 và **provider** của dữ liệu hiển thị cho frontend.

### User Story
- Là người dùng, tôi muốn xem danh sách thông báo (cảnh báo ngân sách, chúc mừng tiết kiệm...) ở bell icon trên header.
- Là người dùng, tôi muốn đánh dấu đã đọc một thông báo hoặc tất cả thông báo.
- Là người dùng, tôi muốn thấy badge số lượng thông báo chưa đọc.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | GET danh sách notifications (mới nhất) | Phân trang, filter theo `isRead` |
| UC2 | GET số lượng unread | Trả về số nguyên để hiển thị badge |
| UC3 | PATCH đánh dấu 1 notification đã đọc | Chỉ update notification của chính user |
| UC4 | PATCH đánh dấu tất cả đã đọc | Bulk update |
| UC5 | DELETE notification | Optional — có thể giới hạn chỉ ADMIN |
| EC1 | User đánh dấu notification của người khác | 403 Forbidden |
| EC2 | Notification bị gửi spam liên tục | BudgetCheckService chỉ tạo Notification khi status **thay đổi** (đã thiết kế ở Phase 5) |
| EC3 | Quá nhiều notification cũ (>100) | Auto-cleanup: giữ tối đa 100 notifications mới nhất/user |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Get Notifications | Danh sách notification của user, phân trang, filter unread |
| Get Unread Count | Đếm nhanh số thông báo chưa đọc (dùng cho badge) |
| Mark One as Read | Đánh dấu 1 notification đã đọc |
| Mark All as Read | Bulk update tất cả về `isRead = true` |
| **NotificationService (Internal)** | Service nội bộ để các module khác (Budget, SavingGoal, AI) tạo notification |
| Auto-cleanup (optional) | Cron job xóa notification > 30 ngày hoặc giữ max 100/user |

---

## 2. DATABASE DESIGN

### Cấu trúc hiện tại

```prisma
model Notification {
    id       String  @id @default(cuid())
    userId   String
    title    String
    message  String
    type     String // "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "GOAL_REACHED" | "AI_INSIGHT"
    isRead   Boolean @default(false)
    metadata Json?   // e.g. { budgetId, categoryName, percentage }

    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId, isRead])
    @@map("notifications")
}
```

### Schema Optimization Đề xuất

```prisma
// Chuyển type từ String sang Enum để type-safe
enum NotificationTypeEnum {
    BUDGET_WARNING    // 70% threshold
    BUDGET_EXCEEDED   // 90% threshold
    GOAL_REACHED      // Đạt 100% saving goal
    AI_INSIGHT        // Insight từ Gemini AI
    SYSTEM            // Thông báo hệ thống (update, maintenance)
}

model Notification {
    id        String                  @id @default(cuid())
    userId    String
    title     String
    message   String                  @db.Text  // [MỚI] Hỗ trợ message dài hơn
    type      NotificationTypeEnum    // [THAY ĐỔI] String → Enum
    isRead    Boolean                 @default(false)
    metadata  Json?
    readAt    DateTime?               // [MỚI] Timestamp khi đọc, dùng cho analytics

    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId, isRead])
    @@index([userId, createdAt])   // [MỚI] Cho pagination query orderBy createdAt
    @@map("notifications")
}
```

> **Lý do thêm `readAt`:** Cho phép phase sau (Analytics) tính "thời gian phản ứng trung bình" của user với thông báo. Cho phép GDPR compliance (user request xem lịch sử đọc).

> **Lý do đổi `type` thành Enum:** Type-safety ở TypeScript layer, ngăn chặn string typo, dễ maintain.

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/notifications`

**Query Params:**
- `isRead` (boolean, optional)
- `page` (default 1)
- `limit` (default 20, max 50)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "title": "⚠️ Cảnh báo ngân sách",
      "message": "Chi tiêu Ăn uống đã đạt 70% hạn mức tháng 6/2026",
      "type": "BUDGET_WARNING",
      "isRead": false,
      "metadata": {
        "budgetId": "cuid...",
        "categoryName": "Ăn uống",
        "percentage": 70.5
      },
      "createdAt": "2026-06-25T12:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 },
  "unreadCount": 3
}
```

### 3.2. `GET /api/notifications/unread-count`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": { "count": 3 }
}
```

### 3.3. `PATCH /api/notifications/:id/read`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": { "id": "cuid...", "isRead": true, "readAt": "2026-06-25T12:30:00Z" }
}
```

### 3.4. `PATCH /api/notifications/read-all`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": { "updatedCount": 3 }
}
```

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const getNotificationsQuerySchema = z.object({
  query: z.object({
    isRead: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid()
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class NotificationService {
  // Public API methods
  findAll(userId, query): Promise<PaginatedNotifications>
  getUnreadCount(userId): Promise<number>
  markAsRead(userId, notificationId): Promise<Notification>
  markAllAsRead(userId): Promise<{ updatedCount: number }>

  // INTERNAL method (dùng bởi BudgetService, SavingGoalService, AIService)
  create(dto: CreateNotificationInternalDTO): Promise<Notification>
}

interface CreateNotificationInternalDTO {
  userId: string;
  title: string;
  message: string;
  type: NotificationTypeEnum;
  metadata?: Record<string, unknown>;
}
```

**Business Rules:**
- `markAsRead()`: Kiểm tra notification thuộc về user (ownership check).
- `create()` là **internal** — không có route HTTP public. Chỉ các Service khác mới gọi được.
- `markAllAsRead()`: Chỉ update `isRead = true` và `readAt = now()` cho tất cả unread notifications của userId.

---

## 6. CONTROLLER DESIGN

**`NotificationController`**

| Method | Handler | Status | Notes |
|--------|---------|--------|-------|
| GET | `getNotifications` | 200 | Bao gồm `unreadCount` trong response |
| GET | `getUnreadCount` | 200 | Lightweight, dùng cho polling badge |
| PATCH | `markAsRead` | 200 | Single notification |
| PATCH | `markAllAsRead` | 200 | Bulk operation |

---

## 7. REPOSITORY / PRISMA DESIGN

**`findAll` với unreadCount:**
```typescript
const [notifications, total, unreadCount] = await prisma.$transaction([
  prisma.notification.findMany({
    where: {
      userId,
      ...(isRead !== undefined ? { isRead } : {})
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.notification.count({
    where: { userId, ...(isRead !== undefined ? { isRead } : {}) }
  }),
  prisma.notification.count({ where: { userId, isRead: false } })
]);
```

**`markAllAsRead` - updateMany:**
```typescript
const result = await prisma.notification.updateMany({
  where: { userId, isRead: false },
  data: { isRead: true, readAt: new Date() }
});
return { updatedCount: result.count };
```

**Index usage:**
- `@@index([userId, isRead])`: Tối ưu cho query filter unread.
- `@@index([userId, createdAt])`: Tối ưu cho pagination orderBy createdAt.

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| Cross-user read | `markAsRead` bắt buộc filter `userId` trong where clause |
| Spam notifications | Tạo notification chỉ ở Service layer, không có public POST endpoint |
| `create()` Internal API | Không expose qua HTTP. Chỉ gọi nội bộ trong cùng process |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| `markAsRead` với notificationId của user khác | Throw 403 |
| `markAllAsRead` | Tất cả unread notifications của user đó được update |
| `getUnreadCount` | Trả về số nguyên chính xác |
| `create()` internal | Tạo notification và lưu metadata JSON đúng |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `GET /notifications` | Filter `isRead=false` | Chỉ trả về unread |
| `PATCH /notifications/read-all` | Có 5 unread | `updatedCount = 5`, GET lại thấy unreadCount = 0 |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Notifications
    description: Quản lý thông báo hệ thống

components:
  schemas:
    NotificationResponse:
      properties:
        id: { type: string }
        title: { type: string }
        message: { type: string }
        type:
          type: string
          enum: [BUDGET_WARNING, BUDGET_EXCEEDED, GOAL_REACHED, AI_INSIGHT, SYSTEM]
        isRead: { type: boolean }
        metadata: { type: object, nullable: true }
        createdAt: { type: string, format: date-time }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Update Schema: `NotificationTypeEnum`, thêm `readAt` | Easy |
| 2 | Migration | Easy |
| 3 | Zod Schemas | Easy |
| 4 | `NotificationService.create()` (Internal) | Easy |
| 5 | CRUD methods cho public API | Medium |
| 6 | Controller + Routes | Easy |
| 7 | Tích hợp với BudgetService (Phase 5) | Medium |
| 8 | Tích hợp với SavingGoalService (Phase 6) | Medium |
| 9 | Swagger | Easy |
| 10 | Tests | Medium |

---

## 12. DEFINITION OF DONE

- [ ] Danh sách, đọc, mark-as-read đều hoạt động
- [ ] Notification được tạo tự động từ Budget và SavingGoal events
- [ ] `markAllAsRead` atomic (dùng `updateMany`)
- [ ] Cross-user access bị chặn hoàn toàn
- [ ] `unreadCount` chính xác trong mọi trường hợp

---

## ⚠️ Anti-Patterns
- **Tạo Notification từ nhiều nơi mà không qua `NotificationService.create()`:** Sẽ khó track, dễ typo type/title. Centralize tất cả qua Service.
- **Polling aggressively từ frontend:** `/unread-count` endpoint nên được frontend poll mỗi 30-60 giây, không phải mỗi 1-2 giây. Cân nhắc WebSocket cho Phase 2.0.

## 🔮 Future Enhancement
Nếu cần real-time notification: Tích hợp **Socket.io** hoặc **Server-Sent Events (SSE)** sau khi hoàn thiện REST APIs. Kiến trúc hiện tại (NotificationService.create internal) dễ dàng emit socket event mà không cần refactor.
