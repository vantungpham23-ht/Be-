-- ============================================
-- THÊM CỘT appointment_time VÀO BẢNG appointments
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- Thêm cột appointment_time vào bảng appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_time TIMESTAMPTZ;

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);

-- Kiểm tra kết quả
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'appointment_time';

