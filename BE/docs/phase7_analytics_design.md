# PHASE 7: DASHBOARD & ANALYTICS MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 2 (Category), Phase 3 (Expense/Income), Phase 5 (Budget), Phase 6 (SavingGoal)
> **Enables:** Phase 9 (Export Report), Phase 10C (AI Insights)

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cung cấp các API tổng hợp dữ liệu tài chính dưới nhiều dạng visualizable (biểu đồ, heatmap, summary cards) phục vụ dashboard. Đây là phase **read-heavy** — không thay đổi dữ liệu, chỉ aggregate và transform. Hiệu năng là ưu tiên hàng đầu.

### User Story
- Là người dùng, tôi muốn nhìn ngay vào Dashboard để biết tháng này thu bao nhiêu, chi bao nhiêu, còn lại bao nhiêu.
- Là người dùng, tôi muốn thấy biểu đồ Pie chart cho biết tôi chi nhiều nhất vào danh mục nào.
- Là người dùng, tôi muốn thấy biểu đồ Bar chart so sánh Thu vs Chi trong 12 tháng của năm.
- Là người dùng, tôi muốn thấy Heatmap màu sắc cho biết ngày nào tôi chi tiêu nhiều nhất.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Summary tháng: tổng thu, tổng chi, số dư | Tính từ Expense (non-deleted) và Income |
| UC2 | Phân tích chi tiêu theo danh mục (Pie chart) | Group by categoryId, tính SUM và % |
| UC3 | Xu hướng thu/chi 12 tháng (Bar chart) | Group by month, cho từng năm |
| UC4 | Heatmap chi tiêu theo ngày trong năm | Group by date, tính SUM mỗi ngày |
| EC1 | Tháng/năm không có dữ liệu | Trả về array rỗng hoặc giá trị 0, không throw error |
| EC2 | User mới chưa có expense | Trả về zeros, không crash |
| EC3 | Performance khi có nhiều năm dữ liệu | Cần index phù hợp, cân nhắc caching |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Monthly Summary | Tổng thu, tổng chi, số dư, savings rate cho 1 tháng/năm |
| Category Breakdown | Chi tiêu theo category kèm % và icon/color (Pie chart data) |
| Monthly Trend | Thu vs Chi theo từng tháng trong năm (Bar chart data) |
| Daily Heatmap | Tổng chi tiêu theo từng ngày trong năm (Calendar heatmap data) |
| **Top Spenders** | Top 5 khoản chi lớn nhất tháng (Extra insight) |

---

## 2. DATABASE DESIGN

### Không cần bảng mới

Analytics thuần túy là aggregate query trên các bảng hiện có. Tuy nhiên, nếu ứng dụng scale lớn, có thể cần **Materialized View** hoặc **Summary Tables**, nhưng với scope hiện tại là không cần thiết.

### Schema Optimization Cần Thiết

Để analytics query chạy nhanh, cần review và bổ sung indexes:

```prisma
model Expense {
    // Existing indexes:
    @@index([userId, date])        // ✅ Dùng cho Monthly Summary, Heatmap
    @@index([userId, categoryId])  // ✅ Dùng cho Category Breakdown

    // THÊM INDEX MỚI:
    // Cho groupBy year analytics:
    @@index([userId, date, categoryId]) // Composite index cho analytics queries
}

model Income {
    @@index([userId, date])        // ✅ Có rồi
}
```

### Relationships cho Analytics
```
Analytics queries span:
- User → Expense (với soft-delete filter: deletedAt IS NULL)
- User → Income (với soft-delete filter: deletedAt IS NULL)
- Expense → Category (JOIN để lấy name, color, icon)
- User → Budget (để tính % so với ngân sách)
```

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/analytics/summary`

**Query Params:** `month` (1-12, required), `year` (YYYY, required)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "month": 6,
    "year": 2026,
    "totalIncome": "15000000",
    "totalExpense": "8500000",
    "netBalance": "6500000",
    "savingsRate": 43.33,
    "expenseCount": 24,
    "incomeCount": 2,
    "comparedToLastMonth": {
      "expenseDiff": 5.2,
      "incomeDiff": 0.0
    }
  }
}
```

### 3.2. `GET /api/analytics/by-category`

**Query Params:** `month`, `year`, `type` (EXPENSE|INCOME, default EXPENSE)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "category": {
        "id": "cuid...",
        "name": "Ăn uống",
        "icon": "food",
        "color": "#FF5733"
      },
      "totalAmount": "4200000",
      "transactionCount": 15,
      "percentage": 49.4
    }
  ]
}
```

### 3.3. `GET /api/analytics/monthly-trend`

**Query Params:** `year` (required)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    { "month": 1, "totalIncome": "15000000", "totalExpense": "9000000", "netBalance": "6000000" },
    { "month": 2, "totalIncome": "15000000", "totalExpense": "7500000", "netBalance": "7500000" },
    // ... 12 months total
  ]
}
```

> **Note:** Phải trả đủ 12 tháng, tháng không có dữ liệu thì giá trị = 0.

### 3.4. `GET /api/analytics/heatmap`

**Query Params:** `year` (required)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    { "date": "2026-01-01", "amount": "0" },
    { "date": "2026-01-02", "amount": "150000" },
    // ... 365/366 days total
  ]
}
```

### 3.5. `GET /api/analytics/top-expenses` *(Bonus)*

**Query Params:** `month`, `year`, `limit` (default 5)

**Response (200 OK):** Top N khoản chi lớn nhất với đầy đủ thông tin.

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const summaryQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
  })
});

export const byCategoryQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
    type: z.nativeEnum(TransactionTypeEnum).optional().default('EXPENSE')
  })
});

export const trendQuerySchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2020).max(2100),
  })
});

export const heatmapQuerySchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2020).max(2100),
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class AnalyticsService {
  getMonthlySummary(userId, month, year): Promise<MonthlySummary>
  getCategoryBreakdown(userId, month, year, type): Promise<CategoryBreakdown[]>
  getMonthlyTrend(userId, year): Promise<MonthlyTrend[]>
  getDailyHeatmap(userId, year): Promise<DailyHeatmap[]>
  getTopExpenses(userId, month, year, limit): Promise<Expense[]>
}
```

**`getMonthlySummary()` Business Logic:**
```
1. Aggregate SUM expenses cho tháng/năm (deletedAt null)
2. Aggregate SUM incomes cho tháng/năm (deletedAt null)
3. Tính netBalance = income - expense
4. Tính savingsRate = (netBalance / income) * 100 [nếu income > 0]
5. (Optional) Lấy dữ liệu tháng trước và tính % diff
6. Trả về enriched summary object
```

**`getMonthlyTrend()` Logic:**
```
1. Aggregate expenses GROUP BY month trong year
2. Aggregate incomes GROUP BY month trong year
3. Merge 2 kết quả vào array 12 phần tử [month 1..12]
4. Fill 0 cho các tháng không có data
```

**`getDailyHeatmap()` Logic:**
```
1. Aggregate expenses GROUP BY date (ngày, không phải datetime) trong year
2. Fill 0 cho ngày không có data
3. Return array tất cả ngày trong năm (365/366 items)
```

---

## 6. CONTROLLER DESIGN

**`AnalyticsController`**

| Method | Handler | Status |
|--------|---------|--------|
| GET | `getMonthlySummary` | 200 |
| GET | `getCategoryBreakdown` | 200 |
| GET | `getMonthlyTrend` | 200 |
| GET | `getDailyHeatmap` | 200 |
| GET | `getTopExpenses` | 200 |

---

## 7. REPOSITORY / PRISMA DESIGN

**`getMonthlySummary` - Dùng `$transaction` để parallel query:**
```typescript
const [expenseResult, incomeResult, expenseCount, incomeCount] = await prisma.$transaction([
  prisma.expense.aggregate({
    where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
    _sum: { amount: true }
  }),
  prisma.income.aggregate({
    where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } },
    _sum: { amount: true }
  }),
  prisma.expense.count({ where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } } }),
  prisma.income.count({ where: { userId, deletedAt: null, date: { gte: startOfMonth, lt: endOfMonth } } }),
]);
```

**`getCategoryBreakdown` - Dùng `groupBy`:**
```typescript
const grouped = await prisma.expense.groupBy({
  by: ['categoryId'],
  where: { userId, deletedAt: null, date: { gte: start, lt: end } },
  _sum: { amount: true },
  _count: { id: true },
  orderBy: { _sum: { amount: 'desc' } }
});

// Sau đó JOIN với Category data:
const categories = await prisma.category.findMany({
  where: { id: { in: grouped.map(g => g.categoryId) } }
});
```

**`getMonthlyTrend` - Raw SQL hoặc groupBy:**
```typescript
// Prisma groupBy không support groupBy date functions
// Dùng $queryRaw để extract month từ date field
const result = await prisma.$queryRaw`
  SELECT 
    EXTRACT(MONTH FROM date) as month,
    SUM(amount) as total
  FROM expenses
  WHERE user_id = ${userId}
    AND EXTRACT(YEAR FROM date) = ${year}
    AND deleted_at IS NULL
  GROUP BY EXTRACT(MONTH FROM date)
  ORDER BY month
`;
```

**`getDailyHeatmap` - Raw SQL:**
```typescript
const result = await prisma.$queryRaw`
  SELECT 
    DATE(date) as day,
    SUM(amount) as total
  FROM expenses
  WHERE user_id = ${userId}
    AND EXTRACT(YEAR FROM date) = ${year}
    AND deleted_at IS NULL
  GROUP BY DATE(date)
  ORDER BY day
`;
```

> **Lý do dùng `$queryRaw`:** Prisma ORM không hỗ trợ native date function extraction trong `groupBy`. Raw SQL là bắt buộc cho time-series analytics queries. Cần sanitize input (userId, year) cẩn thận khi dùng raw SQL.

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| SQL Injection trong $queryRaw | Dùng Prisma tagged template literal `$queryRaw\`\`` với parameterized values — **KHÔNG** string concat |
| Data leakage | Bắt buộc filter `userId` trong tất cả queries |
| Performance (Expensive queries) | Cache response với Redis (optional), hoặc dùng stale-while-revalidate pattern |
| Rate limiting | 30 requests/phút cho analytics (read-heavy nhưng expensive) |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| Summary khi không có expense | `totalExpense = 0`, `savingsRate = 100` nếu có income |
| Summary khi income = 0 | `savingsRate = 0` (không chia cho 0) |
| Trend: 12 tháng đủ cả tháng không có data | Array đủ 12 phần tử, tháng không có data = 0 |
| Heatmap: 365 ngày | Array đủ 365 ngày |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `GET /analytics/summary` | Tháng chưa có data | 200 OK với zeros |
| `GET /analytics/by-category` | User có expense ở 3 categories | 3 items với % cộng lại = 100% |
| `GET /analytics/monthly-trend` | Year 2026 | 12 objects month 1-12 |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Analytics
    description: Dashboard và phân tích dữ liệu tài chính

components:
  schemas:
    MonthlySummary:
      properties:
        month: { type: integer }
        year: { type: integer }
        totalIncome: { type: string }
        totalExpense: { type: string }
        netBalance: { type: string }
        savingsRate: { type: number }

    CategoryBreakdownItem:
      properties:
        category:
          $ref: '#/components/schemas/CategorySummary'
        totalAmount: { type: string }
        percentage: { type: number }
        transactionCount: { type: integer }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Zod Schemas (đơn giản, read-only) | Easy |
| 2 | `AnalyticsService.getMonthlySummary()` | Medium |
| 3 | `AnalyticsService.getCategoryBreakdown()` | Medium |
| 4 | `AnalyticsService.getMonthlyTrend()` với $queryRaw | Hard |
| 5 | `AnalyticsService.getDailyHeatmap()` với $queryRaw | Hard |
| 6 | Controller + Routes | Easy |
| 7 | Swagger | Medium |
| 8 | Unit Tests (mock Prisma queries) | Hard |
| 9 | Integration Tests với seed data | Hard |

---

## 12. DEFINITION OF DONE

- [ ] 4 analytics endpoints hoạt động đúng
- [ ] Monthly trend trả về đủ 12 tháng (fill zero cho tháng trống)
- [ ] Heatmap trả về đủ 365/366 ngày
- [ ] Không có SQL Injection trong raw queries
- [ ] `savingsRate` không bị divide-by-zero
- [ ] Sẵn sàng cung cấp data cho Phase 9 (Export) và Phase 10C (AI Insights)

---

## ⚠️ Anti-Patterns Cần Tránh
- **N+1 Query trong Category Breakdown:** Không loop để lấy category detail từng cái một. Dùng `IN` query batch.
- **String interpolation trong $queryRaw:** Luôn dùng parameterized query.
- **Tính analytics ở frontend:** Gánh nặng cho client, dễ sai số khi pagination. Tất cả aggregate phải ở backend.

## 🔮 Technical Debt & Caching Strategy
- Phase 7 queries rất expensive với dữ liệu lớn. Sau Phase 10 (AI), cần implement Redis cache với TTL 5-10 phút cho analytics endpoints vì data không thay đổi real-time.
- Nếu cần scale, xem xét dùng **PostgreSQL Materialized Views** cho daily aggregates.
