-- ============================================
-- SUPABASE SETUP SCRIPT - BE LUXURY SALON
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- BƯỚC 1: XÓA CẤU TRÚC CŨ (NẾU TỒN TẠI)
-- ============================================
-- Xóa trigger cũ (nếu có)
DROP TRIGGER IF EXISTS on_appointment_created ON appointments CASCADE;

-- Xóa function trigger cũ (nếu có)
DROP FUNCTION IF EXISTS notify_new_appointment() CASCADE;

-- Xóa bảng cũ (nếu có) - CHỈ CHẠY NẾU MUỐN XÓA HẾT DỮ LIỆU CŨ
-- DROP TABLE IF EXISTS appointments CASCADE;


-- BƯỚC 2: TẠO BẢNG `appointments` CHUẨN
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo index để query nhanh hơn (optional)
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email);


-- BƯỚC 3: CẤU HÌNH ROW LEVEL SECURITY (RLS)
-- ============================================
-- Bật RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Allow public insert appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated insert appointments" ON appointments;

-- Tạo policy cho phép INSERT từ client (anon + authenticated roles)
CREATE POLICY "Allow public insert appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- (Optional) Tạo policy cho phép SELECT (nếu bạn muốn client đọc được dữ liệu)
-- CREATE POLICY "Allow public select appointments"
-- ON public.appointments
-- FOR SELECT
-- TO anon, authenticated
-- USING (true);


-- BƯỚC 4: KIỂM TRA KẾT QUẢ
-- ============================================
-- Kiểm tra bảng đã tạo
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Kiểm tra RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'appointments';

-- Kiểm tra RLS đã bật chưa
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'appointments';


-- ============================================
-- HOÀN TẤT!
-- ============================================
-- Bảng `appointments` đã sẵn sàng để nhận dữ liệu từ frontend.
-- Frontend sẽ insert vào bảng này, sau đó gọi Edge Function để gửi email.

