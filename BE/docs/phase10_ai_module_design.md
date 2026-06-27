# PHASE 10: AI MODULE — API DEVELOPMENT WORKFLOW

> **Sub-phases:** 10A (OCR Receipt), 10B (Image Classification), 10C (AI Insights)
> **Dependencies:** Phase 3 (Expense), Phase 4 (File Upload), Phase 7 (Analytics data)
> **Tech:** Google Gemini Vision API, Cloudinary

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Tích hợp AI để giảm tối đa thao tác nhập liệu thủ công:
- **10A - OCR:** Chụp ảnh hóa đơn → AI đọc ra `merchantName`, `totalAmount`, `date` → User xác nhận rồi tạo Expense.
- **10B - Classification:** Upload ảnh (phở, taxi, siêu thị) → AI gợi ý Category → User confirm.
- **10C - Insights:** AI phân tích tổng thể dữ liệu chi tiêu → Trả về lời khuyên dạng text.

### User Stories
- Là người dùng, tôi muốn chụp hóa đơn, hệ thống tự điền thông tin để tôi chỉ cần bấm "Xác nhận".
- Là người dùng, khi upload ảnh tô phở, hệ thống tự gợi ý category "Ăn uống".
- Là người dùng, cuối tháng tôi muốn AI phân tích xem tôi có xu hướng chi tiêu bất thường gì không.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Scan receipt → Extract data | Gọi Gemini với prompt OCR |
| UC2 | User verify/chỉnh sửa OCR result | Update `isVerified = true` sau khi user confirm |
| UC3 | Upload ảnh expense → Gợi ý category | Async classify sau upload |
| UC4 | User xác nhận category gợi ý | Frontend bắt event; không cần endpoint riêng |
| UC5 | Lấy AI Insights tháng | Cache kết quả 24h để tiết kiệm API call |
| EC1 | Ảnh mờ, không đọc được | `status = FAILED`, `confidenceScore` thấp, user nhập tay |
| EC2 | Gemini API timeout | Retry 1 lần, sau đó set `status = FAILED`, không block user |
| EC3 | Ảnh không phải hóa đơn (selfie...) | Gemini trả về confidence thấp, thông báo user |
| EC4 | Gọi AI nhiều lần với cùng ảnh | Check hash ảnh, return cached result (tiết kiệm cost) |
| EC5 | Gemini API quota exceeded | Fallback gracefully với message rõ ràng |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| **10A** Scan Receipt | POST ảnh → Gemini OCR → Lưu `OcrResult` → Trả về extracted data |
| **10A** Get OCR Result | GET OcrResult theo expenseId |
| **10A** Verify OCR | PATCH — User xác nhận/chỉnh sửa data và apply vào Expense |
| **10B** Image Classify | Tích hợp vào luồng POST Expense — background classify sau khi upload |
| **10B** Get Image Analysis | GET ImageAnalysis theo expenseId |
| **10C** AI Insights | GET insights theo tháng/năm — cache 24h |

---

## 2. DATABASE DESIGN

### Cấu trúc hiện tại (Đã đủ)

```prisma
model OcrResult {
    id              String                    @id @default(cuid())
    expenseId       String                    @unique
    merchantName    String?
    totalAmount     Decimal?                  @db.Decimal(12, 2)
    transactionDate DateTime?
    extractedText   String                    @db.Text
    confidenceScore Float?
    isVerified      Boolean                   @default(false)
    status          ImageProcessingStatusEnum @default(PENDING)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

    @@map("ocr_results")
}

model ImageAnalysis {
    id                String                    @id @default(cuid())
    expenseId         String                    @unique
    suggestedCategory String?
    tags              String[]
    confidenceScore   Float?
    rawResponse       Json?
    status            ImageProcessingStatusEnum @default(PENDING)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

    @@map("image_analyses")
}
```

### Schema Optimization Đề xuất

```prisma
// THÊM TABLE: Cache AI Insights để tránh gọi API lặp lại
model AiInsight {
    id          String   @id @default(cuid())
    userId      String
    month       Int
    year        Int
    content     String   @db.Text    // Markdown text từ Gemini
    inputHash   String               // Hash của input data để validate cache validity
    model       String   @default("gemini-2.0-flash")  // Tracking model version
    generatedAt DateTime @default(now())
    expiresAt   DateTime             // TTL: generatedAt + 24h

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([userId, month, year])  // 1 insight per user per month
    @@index([userId, month, year])
    @@map("ai_insights")
}

// THÊM field vào OcrResult
model OcrResult {
    // ... existing fields
    rawResponse Json?       // [MỚI] Raw Gemini response để debug
    retryCount  Int @default(0)  // [MỚI] Số lần retry
    errorMessage String?    // [MỚI] Error message nếu failed
    @@map("ocr_results")
}

// THÊM field vào ImageAnalysis
model ImageAnalysis {
    // ... existing fields
    suggestedCategoryId String?   // [MỚI] FK thay vì chỉ lưu name string
    retryCount  Int @default(0)
    errorMessage String?
    @@map("image_analyses")
}
```

> **Lý do thêm `AiInsight` table:** Cache response AI giúp tiết kiệm đáng kể chi phí API (Gemini có pricing theo token). Mỗi tháng chỉ cần generate 1 lần và cache 24h.
>
> **Lý do thêm `suggestedCategoryId` vào ImageAnalysis:** Nếu chỉ lưu `suggestedCategory` dạng String, khi Category bị rename thì data AI sẽ không khớp. FK đảm bảo tính nhất quán và frontend có thể dùng `id` để highlight đúng option.

---

## 3. API CONTRACT DESIGN

### 10A — OCR

#### `POST /api/ai/scan-receipt`

**Content-Type:** `multipart/form-data`

**Request:**
```
FormData:
  - file: <image binary>
  - expenseId: string (optional — nếu scan trước khi tạo expense)
```

**Response (202 Accepted):**
```json
{
  "status": "success",
  "data": {
    "ocrResultId": "cuid...",
    "status": "PROCESSING",
    "message": "Đang xử lý ảnh hóa đơn"
  }
}
```

> **Lý do 202 thay vì 200:** Gemini API call có thể mất 2-5 giây. Trả về 202 ngay lập tức, client poll `GET /ai/ocr-result/:expenseId` để lấy kết quả.

#### `GET /api/ai/ocr-result/:expenseId`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "cuid...",
    "status": "COMPLETED",
    "merchantName": "Phở Bà Dậu",
    "totalAmount": "55000",
    "transactionDate": "2026-06-25T00:00:00Z",
    "extractedText": "HÓA ĐƠN THANH TOÁN\nPhở Bà Dậu...",
    "confidenceScore": 0.92,
    "isVerified": false
  }
}
```

#### `PATCH /api/ai/ocr-result/:id/verify`

**Request:**
```json
{
  "merchantName": "Phở Bà Dậu (chỉnh lại)",
  "totalAmount": 55000,
  "transactionDate": "2026-06-25T00:00:00Z",
  "applyToExpenseId": "cuid..."
}
```

**Response (200 OK):** Updated OcrResult + updated Expense

### 10B — Image Classification

#### `GET /api/ai/image-analysis/:expenseId`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "status": "COMPLETED",
    "suggestedCategory": { "id": "cuid...", "name": "Ăn uống", "icon": "food" },
    "tags": ["food", "noodle", "vietnamese", "pho"],
    "confidenceScore": 0.89
  }
}
```

### 10C — AI Insights

#### `GET /api/ai/insights`

**Query Params:** `month`, `year`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "content": "## Phân tích chi tiêu tháng 6/2026\n\nBạn đã chi **8.500.000 VNĐ** trong tháng này...",
    "generatedAt": "2026-06-25T10:00:00Z",
    "expiresAt": "2026-06-26T10:00:00Z",
    "isCached": true
  }
}
```

---

## 4. REQUEST VALIDATION DESIGN

```typescript
export const verifyOcrSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    merchantName: z.string().min(1).max(200).optional(),
    totalAmount: z.number().positive().optional(),
    transactionDate: z.string().datetime().optional(),
    applyToExpenseId: z.string().cuid().optional()
  })
});

export const aiInsightsQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
  })
});
```

---

## 5. SERVICE LAYER DESIGN

```typescript
class OcrService {
  scanReceipt(userId, imageBuffer, expenseId?): Promise<OcrResult>
  getOcrResult(userId, expenseId): Promise<OcrResult>
  verifyOcr(userId, ocrResultId, data): Promise<{ ocrResult, expense }>
  // private:
  private callGeminiOcr(imageBuffer): Promise<GeminiOcrResponse>
  private parseGeminiResponse(rawResponse): ParsedOcrData
}

class ImageClassificationService {
  classify(expenseId, imageUrl): Promise<ImageAnalysis>
  getAnalysis(userId, expenseId): Promise<ImageAnalysis>
  // private:
  private callGeminiClassify(imageUrl): Promise<GeminiClassifyResponse>
  private mapCategoryFromAI(suggestedName): Promise<Category | null>
}

class AiInsightService {
  getInsights(userId, month, year): Promise<AiInsight>
  // private:
  private generateInsight(userId, month, year): Promise<string>
  private buildInsightPrompt(data: ReportData): string
  private isCacheValid(insight: AiInsight): boolean
}
```

**Gemini OCR Prompt Template:**
```
Analyze this receipt image and extract the following information in JSON format:
{
  "merchantName": "store name or null",
  "totalAmount": numeric_value_or_null,
  "transactionDate": "ISO 8601 date or null",
  "extractedText": "full raw text from image",
  "confidence": 0.0_to_1.0
}
Return ONLY valid JSON. If data cannot be extracted, set field to null.
```

**`AiInsightService.buildInsightPrompt()` - Anonymized Data:**
```
⚠️ QUAN TRỌNG: Không gửi tên thật, địa chỉ, số điện thoại của user lên AI.
Chỉ gửi data tổng hợp (aggregate numbers + category names).

Prompt Template:
"Bạn là chuyên gia tài chính cá nhân. Phân tích dữ liệu chi tiêu sau:
- Tổng thu: {totalIncome} VNĐ
- Tổng chi: {totalExpense} VNĐ  
- Chi tiêu theo danh mục: {categoryBreakdown}
- So với tháng trước: {comparison}
Đưa ra 3-5 nhận xét và lời khuyên cụ thể bằng tiếng Việt, dạng Markdown."
```

**Image Classification Flow (10B) - Background Processing:**
```
1. User POST /api/expenses với imageUrl
2. ExpenseService tạo expense (synchronous)
3. Sau khi expense được tạo xong → setImmediate/EventEmitter trigger background:
   imageClassificationService.classify(expense.id, expense.imageUrl)
4. Background job: Gọi Gemini → Parse result → Upsert ImageAnalysis
5. User có thể GET /ai/image-analysis/:expenseId bất cứ lúc nào (polling)
```

---

## 6. CONTROLLER DESIGN

**`AiController`**

| Method | Handler | Status | Notes |
|--------|---------|--------|-------|
| POST | `scanReceipt` | 202 | Async processing |
| GET | `getOcrResult` | 200 | Poll for result |
| PATCH | `verifyOcr` | 200 | Apply to expense |
| GET | `getImageAnalysis` | 200 | Poll for result |
| GET | `getInsights` | 200 | Check cache first |

---

## 7. REPOSITORY / PRISMA DESIGN

**`AiInsightService.getInsights()` - Cache-first logic:**
```typescript
// 1. Check cache
const cached = await prisma.aiInsight.findUnique({
  where: { userId_month_year: { userId, month, year } }
});

if (cached && cached.expiresAt > new Date()) {
  return { ...cached, isCached: true };
}

// 2. Generate fresh
const reportData = await reportService.gatherReportData(userId, month, year);
const content = await geminiService.generateInsight(reportData);

// 3. Upsert cache
const insight = await prisma.aiInsight.upsert({
  where: { userId_month_year: { userId, month, year } },
  create: { userId, month, year, content, expiresAt: addHours(new Date(), 24) },
  update: { content, expiresAt: addHours(new Date(), 24), generatedAt: new Date() }
});

return { ...insight, isCached: false };
```

**OcrResult status update flow:**
```typescript
// Sau khi Gemini trả kết quả (async):
await prisma.ocrResult.update({
  where: { id: ocrResultId },
  data: {
    status: 'COMPLETED',
    merchantName: parsed.merchantName,
    totalAmount: parsed.totalAmount,
    transactionDate: parsed.transactionDate,
    extractedText: parsed.extractedText,
    confidenceScore: parsed.confidence,
    rawResponse: rawGeminiResponse
  }
});
```

---

## 8. SECURITY REVIEW

| Vấn đề | Giải pháp |
|--------|-----------|
| PII trong AI prompt | **KHÔNG** gửi tên, địa chỉ, số điện thoại user lên Gemini. Chỉ gửi aggregate data |
| Image content moderation | Cloudinary có built-in moderation. Validate mime type trước khi gửi AI |
| Gemini API key exposure | Lưu trong env, không bao giờ log |
| Cost control | Rate limit: 5 OCR scans/giờ/user. Monitor daily API spend |
| Malicious OCR prompts trong ảnh | Prompt injection: Hóa đơn giả chứa "Ignore previous instructions...". Mitigate bằng cách validate output JSON schema nghiêm ngặt |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| `parseGeminiResponse` với valid JSON | Parse đúng sang `ParsedOcrData` |
| `parseGeminiResponse` với malformed JSON | Return null values, không throw |
| `isCacheValid` khi cache chưa expire | Return true |
| `isCacheValid` khi cache expired | Return false, trigger regenerate |
| `buildInsightPrompt` | Không chứa PII (test với user có email/tên thật) |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `POST /ai/scan-receipt` | Upload JPEG hợp lệ | 202 + ocrResultId |
| `GET /ai/ocr-result/:id` | Sau khi processing complete | 200 với merchantName, amount |
| `GET /ai/insights` | Lần 1 - chưa có cache | 200, `isCached: false` |
| `GET /ai/insights` | Lần 2 trong 24h | 200, `isCached: true` |

### E2E Cases

| Flow | Description |
|------|-------------|
| Full OCR Flow | Upload receipt → Poll result → Verify data → Expense được cập nhật |
| Full Classification Flow | POST expense với imageUrl → Poll image analysis → Thấy suggested category |
| AI Insights Flow | Có đủ data tháng → GET insights → Nhận Markdown content |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: AI
    description: AI-powered features (OCR, Classification, Insights)

components:
  schemas:
    OcrResultResponse:
      properties:
        status:
          type: string
          enum: [PENDING, PROCESSING, COMPLETED, FAILED]
        merchantName: { type: string, nullable: true }
        totalAmount: { type: string, nullable: true }
        confidenceScore: { type: number, minimum: 0, maximum: 1 }
        isVerified: { type: boolean }

    AiInsightResponse:
      properties:
        content: { type: string, description: "Markdown text" }
        generatedAt: { type: string, format: date-time }
        isCached: { type: boolean }
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Update Schema: `AiInsight`, fields mới cho OcrResult & ImageAnalysis | Medium |
| 2 | Migration | Easy |
| 3 | Gemini SDK setup & config | Easy |
| 4 | `OcrService.callGeminiOcr()` + `parseGeminiResponse()` | Hard |
| 5 | `OcrService` CRUD + status flow | Medium |
| 6 | `ImageClassificationService` + background integration với ExpenseService | Hard |
| 7 | `AiInsightService` với cache-first logic | Hard |
| 8 | `AiController` + Routes | Medium |
| 9 | Zod Schemas | Easy |
| 10 | Swagger | Medium |
| 11 | Unit Tests (mock Gemini SDK) | Hard |
| 12 | Integration Tests | Hard |

---

## 12. DEFINITION OF DONE

- [ ] OCR scan receipt → kết quả đúng cho ảnh hóa đơn rõ ràng
- [ ] Status tracking đúng (PENDING → PROCESSING → COMPLETED/FAILED)
- [ ] Image classification chạy background, không block POST /expenses
- [ ] AI Insights có cache, không gọi Gemini API 2 lần trong 24h
- [ ] PII không bao giờ được gửi lên Gemini API
- [ ] Rate limiting hoạt động cho AI endpoints
- [ ] Graceful failure khi Gemini unavailable (không crash app)

---

## ⚠️ Anti-Patterns Cần Tránh
- **Gọi Gemini synchronously trong request cycle:** User phải chờ 3-5s. Dùng background processing với EventEmitter hoặc job queue (Bull/BullMQ).
- **Không validate Gemini JSON output:** Gemini có thể trả về text không phải JSON. Luôn wrap trong try-catch và validate schema.
- **Gửi PII lên AI:** Vi phạm privacy. Chỉ gửi aggregated, anonymized data.
- **Hard-code Gemini model name:** Đặt trong env var để dễ upgrade model.

## 🔮 Technical Debt
- Phase 10 cần một **async job queue** (Bull/BullMQ + Redis) để xử lý background AI tasks properly. Nếu dùng `setImmediate()` đơn giản, sẽ mất jobs khi server restart. Đây là technical debt cần trả khi lên production.
- Cần implement **cost monitoring** cho Gemini API — log số tokens used mỗi request vào database hoặc monitoring system.
