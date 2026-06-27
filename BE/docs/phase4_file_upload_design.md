# PHASE 4: FILE UPLOAD MODULE — API DEVELOPMENT WORKFLOW

> **Dependencies:** Phase 1 (Auth), Phase 3 (Expense - imageUrl field)
> **Enables:** Phase 10 (AI Vision, OCR)

---

## 1. BUSINESS ANALYSIS

### Mục tiêu nghiệp vụ
Cung cấp cơ sở hạ tầng upload file tập trung (centralized), an toàn, có thể tái sử dụng trên toàn hệ thống (avatar user, ảnh hóa đơn expense, ảnh để scan OCR). Kết quả upload là Public URL từ Cloudinary để gán vào các model tương ứng.

### User Story
- Là một người dùng, khi thêm chi tiêu tôi muốn đính kèm ảnh hóa đơn để lưu bằng chứng và để AI xử lý sau.
- Là một người dùng, tôi muốn thay đổi ảnh đại diện (avatar) của mình.
- Là hệ thống, tôi muốn có một service upload dùng chung để không bị lặp code giữa nhiều module.

### Use Cases & Edge Cases

| # | Case | Rule |
|---|------|------|
| UC1 | Upload ảnh hóa đơn cho Expense | Trả về URL, client gán vào `imageUrl` khi tạo/update Expense |
| UC2 | Upload avatar User | Trả về URL, client gán vào `avatar` field của User |
| EC1 | Upload file không phải image (exe, pdf...) | Chặn 400 — chỉ chấp nhận jpg/jpeg/png/webp |
| EC2 | File kích thước > 5MB | Chặn 400 — kèm error message rõ ràng |
| EC3 | Upload nhiều lần liên tục (rate abuse) | Rate limit 10 requests/phút/user |
| EC4 | File trống (0 byte) | Chặn 400 |
| EC5 | Malicious file mime-type spoofing | Validate MIME type từ magic bytes, không chỉ từ extension |

### Bảng Phân Tích Feature

| Feature | Description |
|---------|-------------|
| Upload Image | Nhận file từ client qua `multipart/form-data`, validate nghiêm ngặt, upload lên Cloudinary, trả về public URL |
| Delete Image | Xóa ảnh trên Cloudinary bằng `publicId` khi expense/avatar bị update hoặc xóa. Tránh "orphan files" trên cloud |
| Avatar Upload | Sub-case của Upload Image với folder riêng `avatars/`, tự động crop/resize về 200x200 |

---

## 2. DATABASE DESIGN

### Không cần bảng mới

Upload service là **stateless** — không lưu metadata file vào DB riêng. URL ảnh sẽ được lưu trực tiếp vào field `imageUrl` của `Expense` hoặc `avatar` của `User`.

### Schema Optimization Đề xuất (Thêm field)

```prisma
// Thêm field publicId để có thể xóa ảnh cũ trên Cloudinary khi update
model Expense {
    // ... existing fields ...
    imageUrl      String?  // URL công khai từ Cloudinary
    imagePublicId String?  // Cloudinary public_id để xóa ảnh sau này
    @@map("expenses")
}

model User {
    // ... existing fields ...
    avatar         String?  // URL avatar
    avatarPublicId String?  // Cloudinary public_id để xóa ảnh cũ khi update
    @@map("users")
}
```

> **Lý do:** Nếu không lưu `publicId`, khi user update/xóa ảnh thì file cũ sẽ tồn tại mãi trên Cloudinary gây tốn chi phí lưu trữ (orphan files).

---

## 3. API CONTRACT DESIGN

### 3.1. `POST /api/upload/image`

**Method:** POST  
**Authorization:** USER  
**Content-Type:** `multipart/form-data`

**Request:**
```
FormData:
  - file: <binary image file>
  - context: "expense" | "avatar"   (optional, để set folder Cloudinary)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/xxx/image/upload/v123/expenses/abc.jpg",
    "publicId": "expenses/abc",
    "width": 1024,
    "height": 768,
    "format": "jpg",
    "bytes": 204800
  }
}
```

**Error Responses:**
- `400 Bad Request`: File không hợp lệ (type, size, empty)
- `401 Unauthorized`: Chưa xác thực
- `413 Payload Too Large`: File vượt 5MB (xử lý ở middleware level)
- `500 Internal Server Error`: Lỗi kết nối Cloudinary

---

## 4. REQUEST VALIDATION DESIGN (Zod Schemas)

```typescript
// validate tại middleware TRƯỚC khi upload
export const uploadContextSchema = z.object({
  query: z.object({
    context: z.enum(['expense', 'avatar']).optional().default('expense')
  })
});

// Validate file trong multer middleware:
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Chỉ chấp nhận file ảnh JPG, PNG, WebP', 400), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // Dùng memory, KHÔNG lưu disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
```

> **Lý do dùng `memoryStorage()`:** Không lưu file tạm ra disk server. Buffer thẳng từ RAM → stream lên Cloudinary, an toàn hơn, sạch hơn.

---

## 5. SERVICE LAYER DESIGN

**`UploadService` Responsibilities:**

```typescript
class UploadService {
  // Upload file buffer lên Cloudinary
  uploadImage(buffer: Buffer, context: 'expense' | 'avatar'): Promise<UploadResult>

  // Xóa ảnh cũ trên Cloudinary khi update
  deleteImage(publicId: string): Promise<void>

  // Upload avatar với resize/crop
  uploadAvatar(buffer: Buffer, userId: string): Promise<UploadResult>
}
```

**Business Rules tại Service:**
- `uploadImage()`: Tự động set `folder` trên Cloudinary theo `context` (`expenses/` hoặc `avatars/`).
- `uploadImage()` cho avatar: Apply transformation `width: 200, height: 200, crop: 'fill'` để normalize kích thước.
- `deleteImage()`: Gọi `cloudinary.uploader.destroy(publicId)`. Nên xử lý **fire-and-forget** (không throw nếu xóa fail) để tránh ảnh hưởng flow chính.

---

## 6. CONTROLLER DESIGN

**`UploadController`**

- `uploadImage(req, res, next)`:
  - Input: `req.file` (từ Multer middleware), `req.query.context`.
  - Output: HTTP 200, `{ url, publicId, ... }`.

---

## 7. REPOSITORY / PRISMA DESIGN

Không có Prisma query trong module này. `UploadService` chỉ giao tiếp với Cloudinary SDK.

**Cloudinary Config:**
```typescript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});
```

---

## 8. SECURITY REVIEW

| Rủi ro | Giải pháp |
|--------|-----------|
| MIME Type Spoofing | Validate `file.mimetype` từ Multer (kiểm tra header, không phải extension) + có thể dùng `file-type` library để verify magic bytes |
| File quá lớn (DoS) | `multer limits.fileSize = 5MB`. Express sẽ reject trước khi xử lý |
| Path Traversal | Dùng `memoryStorage()` — không đụng đến filesystem |
| Malicious Content | File ảnh được re-encode bởi Cloudinary SDK, loại bỏ payload nhúng trong metadata |
| Orphan Files | Bắt buộc lưu `publicId` cùng URL để cleanup sau này |
| Rate Limiting | 10 uploads / phút / user — áp dụng `express-rate-limit` trên route upload |

---

## 9. TESTING PLAN

### Unit Test Cases

| Case | Expected |
|------|----------|
| Upload file JPEG hợp lệ | Trả về UploadResult với url và publicId |
| Upload file PDF | Throw AppError 400 |
| Upload file > 5MB | Multer reject, return 413 |
| Upload file 0 byte | Throw AppError 400 |
| Cloudinary unavailable | Throw AppError 500 với message rõ ràng |

### Integration Test Cases

| API | Scenario | Expected |
|-----|----------|----------|
| `POST /upload/image` | Gửi JPEG hợp lệ | 200 OK + JSON với url |
| `POST /upload/image` | Gửi PNG > 5MB | 413 Payload Too Large |
| `POST /upload/image` | Không đính kèm file | 400 Bad Request |
| `POST /upload/image` | Không có Bearer token | 401 Unauthorized |

### E2E Cases

| Flow | Description |
|------|-------------|
| Upload & Use in Expense | Upload ảnh → lấy URL → Tạo Expense với URL đó → GET Expense kiểm tra URL có đúng không |

---

## 10. SWAGGER DESIGN

```yaml
tags:
  - name: Upload
    description: File upload endpoints

paths:
  /api/upload/image:
    post:
      tags: [Upload]
      summary: Upload ảnh lên Cloudinary
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                context:
                  type: string
                  enum: [expense, avatar]
      responses:
        200:
          description: Upload thành công
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UploadResponse'
```

---

## 11. IMPLEMENTATION ORDER

| # | Task | Difficulty |
|---|------|------------|
| 1 | Cài đặt `multer`, `cloudinary` package | Easy |
| 2 | Config Cloudinary service (`config/cloudinary.ts`) | Easy |
| 3 | Build `UploadService` với uploadImage, deleteImage | Medium |
| 4 | Build `UploadController` | Easy |
| 5 | Build `upload.route.ts` với Multer middleware | Medium |
| 6 | **Update Prisma Schema:** thêm `imagePublicId` vào Expense, `avatarPublicId` vào User | Easy |
| 7 | **Migrate DB** | Easy |
| 8 | Tích hợp cleanup `deleteImage()` vào `ExpenseService.update()` và `ExpenseService.delete()` | Medium |
| 9 | Cập nhật Swagger | Medium |
| 10 | Unit Tests + Integration Tests | Hard |

---

## 12. DEFINITION OF DONE

- [ ] Upload file ảnh thành công, nhận về URL và publicId từ Cloudinary
- [ ] File không hợp lệ (type, size) bị reject với error message rõ ràng
- [ ] Ảnh cũ trên Cloudinary bị xóa khi Expense update/delete
- [ ] Không có orphan files trên Cloudinary sau khi test
- [ ] Rate limiting hoạt động đúng (10 req/phút)
- [ ] Swagger docs hiển thị đầy đủ `multipart/form-data` schema

---

## ⚠️ Anti-Patterns Cần Tránh
- **Lưu file tạm ra disk server:** Nguy cơ đầy disk, khó scale. Dùng `memoryStorage()`.
- **Return URL mà không trả kèm `publicId`:** Sẽ không thể xóa ảnh cũ sau này.
- **Gắn cứng URL Cloudinary:** Nếu đổi CDN thì phải sửa toàn DB. (Acceptable cho scope hiện tại nhưng cần document lại).

## 🔮 Technical Debt
- Không có virus scan thực sự. Cloudinary có một số bảo vệ cơ bản nhưng không thay thế được antivirus. Nếu scale lên, cần tích hợp ClamAV hoặc dịch vụ tương tự.
- `memoryStorage` sẽ gây vấn đề nếu có nhiều request upload lớn đồng thời → tốn RAM. Ở production lớn nên dùng streaming trực tiếp lên Cloudinary.
