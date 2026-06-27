# PHASE 9: EXPORT REPORT MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 3 (Expense/Income), Phase 7 (Analytics)
> **Enables:** User self-service report generation

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cho phép người dùng xuất toàn bộ dữ liệu tài chính của một tháng/năm ra file PDF hoặc Excel để lưu trữ, in ấn hoặc báo cáo. Report bao gồm summary overview, chi tiết từng giao dịch và breakdown theo danh mục.

### User Story
- Là người dùng, tôi muốn xuất báo cáo tháng 6/2026 ra file PDF để nộp cho kế toán gia đình.
- Là người dùng, tôi muốn xuất file Excel để tự phân tích thêm bằng công cụ riêng.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Export PDF tháng/năm | Dùng pdfmake hoặc puppeteer generate PDF từ HTML template |
| UC2 | Export Excel tháng/năm | Dùng exceljs tạo workbook có nhiều sheets |
| EC1 | Tháng/năm không có dữ liệu | Vẫn xuất file hợp lệ với nội dung "Không có giao dịch" |
| EC2 | Format không hợp lệ (không phải pdf/excel) | 400 Bad Request |
| EC3 | File quá lớn (user có hàng nghìn giao dịch) | Streaming response, không buffer toàn bộ trong RAM |
| EC4 | Concurrent export requests | Giới hạn 2 exports/phút/user |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Export PDF | Tạo file PDF với: Header (tên user, tháng/năm), Summary cards, Bảng chi tiết, Category breakdown |
| Export Excel | Tạo file Excel với: Sheet 1 (Summary), Sheet 2 (Chi tiêu detail), Sheet 3 (Thu nhập detail), Sheet 4 (Category breakdown) |

---

## 2. DATABASE DESIGN

Không cần bảng mới. Module này chỉ **read** dữ liệu từ Expense, Income, Category, Budget tables.

---

## 3. API CONTRACT DESIGN

### 3.1. `GET /api/reports/export`

**Method:** GET  
**Authorization:** USER

**Query Params:**
- `month` (1-12, required)
- `year` (YYYY, required)
- `format` (enum: `pdf` | `excel`, required)

**Response (200 OK):**
- `Content-Type: application/pdf` hoặc `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="report-2026-06.pdf"`
- Body: Binary file stream

**Error Responses:**
- `400`: Format không hợp lệ hoặc missing params
- `401`: Unauthorized
- `429`: Rate limit exceeded
- `500`: Server error khi generate file

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const exportReportQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
    format: z.enum(['pdf', 'excel']),
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class ReportService {
  exportMonthlyReport(userId, month, year, format): Promise<Buffer | Readable>

  // Private helpers:
  private gatherReportData(userId, month, year): Promise<ReportData>
  private generatePDF(data: ReportData): Promise<Buffer>
  private generateExcel(data: ReportData): Promise<Buffer>
}

interface ReportData {
  user: { name: string; email: string }
  period: { month: number; year: number }
  summary: { totalIncome: Decimal; totalExpense: Decimal; netBalance: Decimal }
  expenses: ExpenseWithCategory[]
  incomes: IncomeWithCategory[]
  categoryBreakdown: CategoryBreakdownItem[]
  budgets: BudgetWithStats[]
}
```

**`gatherReportData()` Business Logic:**
```
1. Parallel fetch (dùng Promise.all):
   - User info
   - Monthly summary (từ AnalyticsService hoặc direct query)
   - All expenses trong tháng (không paginate, lấy tất cả)
   - All incomes trong tháng
   - Category breakdown
   - Budgets của tháng
2. Transform data sang format thích hợp cho template
```

**`generateExcel()` Structure:**
```
Sheet 1 - "Tổng quan":
  - Tháng/Năm, Tên User
  - Total Income, Total Expense, Net Balance

Sheet 2 - "Chi tiêu":
  - Columns: STT | Ngày | Tiêu đề | Danh mục | Ghi chú | Số tiền

Sheet 3 - "Thu nhập":
  - Tương tự Sheet 2

Sheet 4 - "Theo danh mục":
  - Columns: Danh mục | Số giao dịch | Tổng tiền | % so với tổng
```

---

## 6. CONTROLLER DESIGN

**`ReportController`**

- `exportReport(req, res, next)`:
  - Validate query params
  - Gọi `ReportService.exportMonthlyReport()`
  - Set response headers (Content-Type, Content-Disposition)
  - Pipe file buffer vào response

```typescript
async exportReport(req: Request, res: Response, next: NextFunction) {
  const { month, year, format } = req.query;

  const buffer = await this.reportService.exportMonthlyReport(
    req.user.id, month, year, format
  );

  const filename = `bao-cao-${year}-${month.toString().padStart(2,'0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

  res.setHeader('Content-Type', format === 'pdf'
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}
```

---

## 7. REPOSITORY / PRISMA DESIGN

**`gatherReportData` - Export ALL records (no pagination):**
```typescript
// CẢNH BÁO: Không paginate vì report cần tất cả dữ liệu
// Nhưng cần timeout protection
const expenses = await prisma.expense.findMany({
  where: {
    userId,
    deletedAt: null,
    date: { gte: startOfMonth, lt: endOfMonth }
  },
  include: {
    category: { select: { name: true, icon: true, color: true } }
  },
  orderBy: { date: 'asc' },
  take: 1000 // Hard limit để tránh OOM, có thể alert nếu > 1000
});
```

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| Rate limiting | 2 exports/phút/user (report generation tốn CPU) |
| Large data OOM | Hard limit 1000 records/export, stream buffer thay vì load toàn bộ vào RAM |
| File name injection | Sanitize filename, không dùng user input trực tiếp làm filename |
| PII trong file | Chỉ export data của chính user, không bao gồm thông tin nhạy cảm khác |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| `generateExcel` với data rỗng | Xuất file Excel hợp lệ với header nhưng không có rows |
| `generatePDF` | Trả về Buffer với magic bytes `%PDF` |
| Format không hợp lệ | Throw 400 |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `GET /reports/export?format=pdf` | User có 5 expenses tháng 6 | Response 200 với binary PDF content |
| `GET /reports/export?format=excel` | Tháng không có data | 200 OK với file Excel rỗng hợp lệ |
| Rate limit | Gọi 3 lần trong 1 phút | Lần 3 trả về 429 |

---

## 10. SWAGGER DESIGN

```yaml
paths:
  /api/reports/export:
    get:
      tags: [Reports]
      summary: Xuất báo cáo tài chính tháng
      security:
        - bearerAuth: []
      parameters:
        - name: month
          in: query
          required: true
          schema: { type: integer, minimum: 1, maximum: 12 }
        - name: year
          in: query
          required: true
          schema: { type: integer }
        - name: format
          in: query
          required: true
          schema: { type: string, enum: [pdf, excel] }
      responses:
        200:
          description: File báo cáo
          content:
            application/pdf:
              schema: { type: string, format: binary }
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
              schema: { type: string, format: binary }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Install `exceljs`, `pdfmake` (hoặc `puppeteer`) | Easy |
| 2 | Zod Schema | Easy |
| 3 | `ReportService.gatherReportData()` | Medium |
| 4 | `ReportService.generateExcel()` | Hard |
| 5 | `ReportService.generatePDF()` | Hard |
| 6 | Controller + Route + File response headers | Medium |
| 7 | Rate limiting config | Easy |
| 8 | Swagger | Medium |
| 9 | Integration Tests | Hard |

---

## 12. DEFINITION OF DONE

- [ ] Xuất PDF thành công với đầy đủ nội dung
- [ ] Xuất Excel với 4 sheets đầy đủ
- [ ] Tháng không có data vẫn xuất file hợp lệ (không crash)
- [ ] Rate limiting hoạt động (không spam export)
- [ ] Response headers đúng để browser auto-download

---

## ⚠️ Anti-Patterns
- **Buffer toàn bộ PDF/Excel vào RAM trước khi trả response:** Với file lớn sẽ gây OOM. Dùng streaming nếu có thể.
- **Dùng `puppeteer` cho PDF production:** Puppeteer rất heavy (Chromium), cần memory lớn. Ưu tiên `pdfmake` hoặc `pdf-lib` cho server nhẹ hơn.

## 🔮 Technical Debt
- Nếu user có > 1000 giao dịch/tháng, cần implement asynchronous job (background job queue) để generate report, sau đó gửi link download qua email/notification. Kiến trúc hiện tại không scale cho edge case này.
