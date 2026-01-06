# 📋 CHECKLIST SETUP BE LUXURY SALON - SUPABASE + RESEND

## ✅ BƯỚC 1: SETUP DATABASE TRÊN SUPABASE

### 1.1. Chạy SQL Script
- [ ] Mở Supabase Dashboard → SQL Editor
- [ ] Copy toàn bộ nội dung file `supabase-setup.sql`
- [ ] Paste vào SQL Editor và chạy (RUN)
- [ ] Kiểm tra kết quả: Bảng `appointments` đã được tạo với các cột đúng
- [ ] Kiểm tra RLS: Policy "Allow public insert appointments" đã được tạo

### 1.2. Verify Database Setup
- [ ] Vào Table Editor → `appointments`
- [ ] Xem các cột: `id`, `name`, `phone`, `email`, `service`, `message`, `created_at`
- [ ] Tất cả đều hiển thị đúng

---

## ✅ BƯỚC 2: SETUP RESEND EMAIL SERVICE

### 2.1. Tạo Resend Account & API Key
- [ ] Đăng ký/đăng nhập tại https://resend.com
- [ ] Vào Dashboard → API Keys
- [ ] Tạo API Key mới → Copy key (dạng `re_xxxxxxxxxxxxx`)

### 2.2. Set Resend API Key vào Supabase
- [ ] Mở terminal, vào thư mục project:
  ```bash
  cd /Users/aidenpham/Downloads/Be
  ```
- [ ] Link Supabase project (nếu chưa link):
  ```bash
  supabase link --project-ref lsugimcalldofgkpzhxo
  ```
- [ ] Set Resend API key:
  ```bash
  supabase secrets set RESEND_API_KEY=re_YOUR_KEY_HERE
  ```
  (Thay `re_YOUR_KEY_HERE` bằng key thật của bạn)

---

## ✅ BƯỚC 3: DEPLOY EDGE FUNCTION

### 3.1. Kiểm tra File Function
- [ ] File `supabase/functions/send-appointment-email/index.ts` đã tồn tại
- [ ] Email nhận thông báo đã được set: `behairbarber@gmail.com` (dòng 4 trong file)

### 3.2. Deploy Function
- [ ] Trong terminal (đang ở thư mục `/Users/aidenpham/Downloads/Be`):
  ```bash
  supabase functions deploy send-appointment-email
  ```
- [ ] Đợi deploy thành công (không có lỗi)
- [ ] Vào Supabase Dashboard → Edge Functions → `send-appointment-email`
- [ ] Kiểm tra function đã có trong danh sách

---

## ✅ BƯỚC 4: KIỂM TRA CODE FRONTEND

### 4.1. Kiểm tra `index.html`
- [ ] File có dòng load Supabase client:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```
- [ ] File có link đến `script.js`:
  ```html
  <script src="script.js"></script>
  ```

### 4.2. Kiểm tra `script.js`
- [ ] Supabase URL đúng: `https://lsugimcalldofgkpzhxo.supabase.co`
- [ ] Supabase anon key đúng
- [ ] Code có phần insert vào `appointments`
- [ ] Code có phần gọi `supabaseClient.functions.invoke("send-appointment-email", ...)`

---

## ✅ BƯỚC 5: TEST TOÀN BỘ HỆ THỐNG

### 5.1. Test Form Submission
- [ ] Mở website trong browser
- [ ] Điền form đặt lịch với dữ liệu test:
  - Name: Test User
  - Phone: 0123456789
  - Email: test@example.com
  - Service: Test Service
  - Message: Test message
- [ ] Click Submit

### 5.2. Verify Database
- [ ] Vào Supabase → Table Editor → `appointments`
- [ ] Kiểm tra có dòng mới với dữ liệu vừa submit
- [ ] Cột `created_at` có timestamp đúng

### 5.3. Verify Edge Function
- [ ] Vào Supabase → Edge Functions → `send-appointment-email` → Logs
- [ ] Kiểm tra có log invocation mới
- [ ] Log không có error (nếu có error, xem chi tiết)

### 5.4. Verify Email
- [ ] Kiểm tra inbox `behairbarber@gmail.com`
- [ ] Kiểm tra cả Spam/Promotions folder
- [ ] Email có subject: `🎯 Đặt lịch mới từ Test User`
- [ ] Email có đầy đủ thông tin: name, phone, email, service, message

---

## 🐛 TROUBLESHOOTING

### Nếu form báo lỗi RLS:
- Chạy lại SQL: `ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;` (tạm thời)
- Hoặc kiểm tra policy đã tạo đúng chưa

### Nếu Edge Function không có log:
- Kiểm tra function đã deploy chưa
- Kiểm tra console browser có error không
- Kiểm tra Resend API key đã set chưa

### Nếu không nhận được email:
- Kiểm tra Resend API key đúng chưa
- Kiểm tra email `behairbarber@gmail.com` đúng chưa
- Kiểm tra Spam folder
- Xem log của Edge Function để biết lỗi cụ thể

---

## 📝 NOTES

- **Database**: Dữ liệu được lưu vào bảng `appointments`
- **Email**: Được gửi qua Resend API từ Edge Function
- **Flow**: Form submit → Insert DB → Call Edge Function → Send Email
- **Security**: RLS đã được cấu hình để cho phép insert từ client

---

## ✅ HOÀN TẤT

Khi tất cả các bước trên đều ✅, hệ thống đã sẵn sàng!

