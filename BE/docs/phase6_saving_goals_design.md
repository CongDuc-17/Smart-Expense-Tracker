# PHASE 6: SAVING GOALS MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 1 (Auth), Phase 3 (Data context)
> **Enables:** Phase 8 (Notification - Goal Reached)

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cho phép người dùng đặt các mục tiêu tiết kiệm cụ thể (ví dụ: "Mua Macbook 30 triệu") và theo dõi tiến độ tích lũy. Hệ thống tự động đánh dấu hoàn thành và gửi thông báo chúc mừng khi đạt mục tiêu.

### User Story
- Là người dùng, tôi muốn đặt mục tiêu tiết kiệm với tên gọi, số tiền cần đạt và deadline.
- Là người dùng, tôi muốn "nạp tiền" vào mục tiêu tiết kiệm để theo dõi tiến độ.
- Là người dùng, tôi muốn nhận thông báo khi đạt 100% mục tiêu.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Tạo saving goal mới | `savedAmount = 0`, `isCompleted = false` mặc định |
| UC2 | Xem danh sách goals (active / completed) | Filter theo `isCompleted` |
| UC3 | Nạp tiền vào goal (deposit) | `savedAmount += depositAmount`. Check completion. |
| UC4 | Sửa goal (tiêu đề, targetAmount, deadline) | Chỉ sửa được goal chưa hoàn thành |
| UC5 | Xóa goal | Cho phép xóa cả goal đã hoàn thành |
| EC1 | Deposit số tiền âm hoặc bằng 0 | 400 Bad Request |
| EC2 | `savedAmount` vượt `targetAmount` | Cho phép (over-save), tự động đánh dấu `isCompleted = true` |
| EC3 | Deposit vào goal đã completed | Vẫn cho phép (thêm dự phòng) |
| EC4 | `targetAmount` thay đổi sau khi đã deposit | Tính lại `isCompleted` dựa trên `savedAmount` mới |
| EC5 | Deadline trong quá khứ | Cảnh báo (warning) nhưng vẫn cho tạo |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Create Saving Goal | Tạo goal với title, targetAmount, deadline (optional), note (optional) |
| Get Saving Goals | Danh sách goals của user, có thể filter `isCompleted=true/false`. Trả về `progressPercentage`. |
| Get Saving Goal Detail | Chi tiết 1 goal |
| Update Saving Goal | Sửa title, targetAmount, deadline, note. Tính lại `isCompleted` nếu `targetAmount` thay đổi. |
| Delete Saving Goal | Xóa goal |
| **Deposit** | `PATCH /saving-goals/:id/deposit` — Cộng tiền vào `savedAmount`, kiểm tra completion |

---

## 2. DATABASE DESIGN

### Cấu trúc hiện tại

```prisma
model SavingGoal {
    id           String    @id @default(cuid())
    userId       String
    title        String
    targetAmount Decimal   @db.Decimal(12, 2)
    savedAmount  Decimal   @default(0) @db.Decimal(12, 2)
    deadline     DateTime?
    isCompleted  Boolean   @default(false)
    note         String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])
    @@map("saving_goals")
}
```

### Schema Optimization Đề xuất

```prisma
model SavingGoal {
    // ... existing fields

    // THÊM: Lịch sử các lần deposit để có thể hiển thị timeline
    deposits SavingDeposit[] // [MỚI - Relation]

    @@map("saving_goals")
}

// THÊM TABLE MỚI: Lịch sử nạp tiền
model SavingDeposit {
    id            String      @id @default(cuid())
    savingGoalId  String
    amount        Decimal     @db.Decimal(12, 2)
    note          String?     // "Lương tháng 6", "Tiền thưởng"
    depositedAt   DateTime    @default(now())

    savingGoal    SavingGoal  @relation(fields: [savingGoalId], references: [id], onDelete: Cascade)

    @@index([savingGoalId])
    @@map("saving_deposits")
}
```

> **Lý do thêm `SavingDeposit`:** Nếu chỉ lưu `savedAmount` tổng, người dùng không thể xem lịch sử từng lần nạp tiền. Với `SavingDeposit` table riêng, Phase 7 (Analytics) có thể vẽ được biểu đồ tiến trình tiết kiệm theo thời gian, và Phase 9 (Export) có thể xuất lịch sử đầy đủ. `savedAmount` trên `SavingGoal` vẫn giữ vai trò cached total.

### Relationships
```
User 1-N SavingGoal
SavingGoal 1-N SavingDeposit
SavingGoal 1-1 Notification (khi isCompleted = true lần đầu)
```

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/saving-goals`

**Query Params:** `isCompleted` (boolean, optional)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cuid...",
      "title": "Mua Macbook",
      "targetAmount": "30000000",
      "savedAmount": "12000000",
      "progressPercentage": 40.0,
      "remainingAmount": "18000000",
      "deadline": "2026-12-31T00:00:00Z",
      "isCompleted": false,
      "note": null
    }
  ]
}
```

### 3.2. `POST /api/saving-goals`

**Request:**
```json
{
  "title": "Mua Macbook",
  "targetAmount": 30000000,
  "deadline": "2026-12-31T00:00:00Z",
  "note": "Để học lập trình"
}
```
**Response (201 Created):** SavingGoal object

### 3.3. `GET /api/saving-goals/:id`

**Response (200 OK):** SavingGoal + `deposits[]` history

### 3.4. `PATCH /api/saving-goals/:id`

**Request (Partial):** title, targetAmount, deadline, note

### 3.5. `DELETE /api/saving-goals/:id`

**Response (200 OK):** Success message

### 3.6. `PATCH /api/saving-goals/:id/deposit` ⭐ **Endpoint đặc biệt**

**Request:**
```json
{
  "amount": 1000000,
  "note": "Tiết kiệm lương tháng 6"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "savingGoal": {
      "id": "cuid...",
      "savedAmount": "13000000",
      "progressPercentage": 43.3,
      "isCompleted": false
    },
    "deposit": {
      "id": "cuid...",
      "amount": "1000000",
      "note": "Tiết kiệm lương tháng 6",
      "depositedAt": "2026-06-25T..."
    }
  }
}
```

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const createSavingGoalSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100),
    targetAmount: z.number().positive("Target amount phải lớn hơn 0").max(10_000_000_000),
    deadline: z.string().datetime().optional().nullable(),
    note: z.string().max(500).optional()
  })
});

export const depositSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    amount: z.number().positive("Số tiền nạp phải lớn hơn 0").max(10_000_000_000),
    note: z.string().max(200).optional()
  })
});

export const updateSavingGoalSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    title: z.string().min(2).max(100).optional(),
    targetAmount: z.number().positive().optional(),
    deadline: z.string().datetime().nullable().optional(),
    note: z.string().max(500).nullable().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật"
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class SavingGoalService {
  create(userId, dto): Promise<SavingGoal>
  findAll(userId, isCompleted?): Promise<SavingGoalWithProgress[]>
  findById(userId, id): Promise<SavingGoalWithDeposits>
  update(userId, id, dto): Promise<SavingGoal>
  delete(userId, id): Promise<void>
  deposit(userId, id, amount, note?): Promise<DepositResult>
}
```

**`deposit()` Logic (Critical Path):**
```
1. Tìm SavingGoal theo id + userId → 404 nếu không có
2. Dùng Prisma Transaction:
   a. INSERT SavingDeposit (amount, note, savingGoalId)
   b. UPDATE SavingGoal SET savedAmount = savedAmount + amount
3. Kiểm tra: IF savedAmount >= targetAmount AND isCompleted === false:
   a. UPDATE isCompleted = true
   b. Gọi NotificationService.create({ type: 'GOAL_REACHED', ... })
4. Return { savingGoal (updated), deposit }
```

**Tính `progressPercentage` tại Service layer:**
```typescript
progressPercentage = Math.min((savedAmount / targetAmount) * 100, 100)
```
*(Dùng `Math.min` để không vượt quá 100% trong UI)*

---

## 6. CONTROLLER DESIGN

**`SavingGoalController`**

| Method | Handler | Status |
|--------|---------|--------|
| GET list | `getSavingGoals` | 200 |
| POST | `createSavingGoal` | 201 |
| GET detail | `getSavingGoalById` | 200 |
| PATCH | `updateSavingGoal` | 200 |
| DELETE | `deleteSavingGoal` | 200 |
| PATCH deposit | `deposit` | 200 |

---

## 7. REPOSITORY / PRISMA DESIGN

**`deposit()` - Prisma Transaction:**
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Tạo deposit record
  const deposit = await tx.savingDeposit.create({
    data: { savingGoalId: id, amount, note }
  });

  // 2. Update savedAmount (dùng increment để atomic, tránh race condition)
  const updatedGoal = await tx.savingGoal.update({
    where: { id },
    data: {
      savedAmount: { increment: amount }
    }
  });

  return { deposit, updatedGoal };
});
```

> **Lý do dùng `{ increment: amount }`:** Tránh race condition nếu user deposit 2 lần đồng thời. `increment` là atomic operation ở DB level.

**Index cần:** `@@index([savingGoalId])` trên `SavingDeposit` (đã include trong schema proposal).

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| Ownership | Mọi query đều filter `userId` từ token |
| Negative deposit (withdraw) | Zod validate `amount > 0`. Không implement withdraw (out of scope) |
| `isCompleted` manipulation | Client không được set `isCompleted` trực tiếp. Chỉ tự động từ system |
| Concurrent deposits | Dùng `increment` Prisma — atomic DB operation |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| Deposit làm đạt 100% | `isCompleted = true`, Notification được tạo |
| Deposit vào goal đã completed | `savedAmount` tăng, không tạo Notification thêm |
| Update `targetAmount` xuống thấp hơn `savedAmount` | Tự động đánh dấu `isCompleted = true` |
| Deposit âm | Throw 400 |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `POST /saving-goals` | Tạo goal hợp lệ | 201 OK |
| `PATCH /:id/deposit` | Deposit đủ tiền mua Macbook | Goal `isCompleted = true` |
| `GET /:id` | Lấy detail | Bao gồm deposits history |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Saving Goals
    description: Quản lý mục tiêu tiết kiệm

components:
  schemas:
    SavingGoalResponse:
      properties:
        id: { type: string }
        title: { type: string }
        targetAmount: { type: string }
        savedAmount: { type: string }
        progressPercentage: { type: number }
        remainingAmount: { type: string }
        deadline: { type: string, format: date-time, nullable: true }
        isCompleted: { type: boolean }
    
    DepositRequest:
      required: [amount]
      properties:
        amount: { type: number, minimum: 1 }
        note: { type: string }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Update Schema: thêm `SavingDeposit` model | Easy |
| 2 | Migration | Easy |
| 3 | Zod Schemas | Easy |
| 4 | `SavingGoalService` CRUD | Medium |
| 5 | `SavingGoalService.deposit()` với Prisma Transaction | Hard |
| 6 | Tích hợp NotificationService khi goal completed | Medium |
| 7 | Controller + Routes | Easy |
| 8 | Swagger | Medium |
| 9 | Unit + Integration Tests | Hard |

---

## 12. DEFINITION OF DONE

- [ ] CRUD SavingGoal hoạt động
- [ ] Deposit atomic (không bị race condition)
- [ ] `isCompleted` tự động khi đạt target
- [ ] Notification được gửi đúng lúc
- [ ] Deposit history được lưu và trả về trong detail API
- [ ] `progressPercentage` luôn từ 0 đến 100

---

## ⚠️ Anti-Patterns
- **Không lưu history deposit:** Thiếu audit trail, không thể phục hồi nếu có bug.
- **Tính `savedAmount` bằng SUM mỗi lần GET:** Dùng cached total + deposit history.

## 🔮 Enables Phase 7
`SavingDeposit` table cho phép Phase 7 (Analytics) vẽ biểu đồ "Tiến trình tiết kiệm theo thời gian" — không cần thêm schema sau này.
