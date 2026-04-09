-- ============================================================
-- PARKING MANAGEMENT SYSTEM — FULL SUPABASE SCHEMA
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================================

-- 1) DROP old tables (if they exist) to start fresh
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS parking CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pricing CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- 2) CREATE NEW TABLES (with inheritance)
-- ============================================================

-- PARENT TABLE: users (base class)
-- Attributes: user_email_id, password, role
-- Methods (app-side): login(), logout()
CREATE TABLE users (
  user_email_id TEXT PRIMARY KEY,
  password TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff'))
);

-- CHILD TABLE: admin (inherits from users)
-- Methods (app-side): viewReport(), updatePrice(), addStaff()
CREATE TABLE admin (
  -- No extra columns needed; inherits user_email_id, password, role from users
) INHERITS (users);

-- Add primary key constraint to admin table
ALTER TABLE admin ADD PRIMARY KEY (user_email_id);
-- Enforce role = 'admin'
ALTER TABLE admin ADD CONSTRAINT admin_role_check CHECK (role = 'admin');

-- CHILD TABLE: staff (inherits from users)
-- Methods (app-side): vehicleEntry(), processExit()
CREATE TABLE staff (
  -- No extra columns needed; inherits user_email_id, password, role from users
) INHERITS (users);

-- Add primary key constraint to staff table
ALTER TABLE staff ADD PRIMARY KEY (user_email_id);
-- Enforce role = 'staff'
ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role = 'staff');

-- ============================================================
-- vehicles: tracks parked vehicles
-- Attributes: vehicleNo, vehicleType, entryTime, exitTime
-- Methods (app-side): calculateTime()
CREATE TABLE vehicles (
  "vehicleNo" TEXT PRIMARY KEY,
  "vehicleType" TEXT NOT NULL,
  "entryTime" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "exitTime" TIMESTAMPTZ
);

-- tickets: billing records
-- Attributes: ticketID, entryTime, exitTime, amount
-- Methods (app-side): generateBill()
CREATE TABLE tickets (
  "ticketID" TEXT PRIMARY KEY,
  "entryTime" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "exitTime" TIMESTAMPTZ,
  amount NUMERIC DEFAULT 0,
  "vehicleNo" TEXT REFERENCES vehicles("vehicleNo")
);

-- parking: single-row slot counter
-- Attributes: totalSlots, avaSlots
-- Methods (app-side): assignSlots(), freeSlots()
CREATE TABLE parking (
  id INT PRIMARY KEY DEFAULT 1,
  "totalSlots" INT NOT NULL DEFAULT 40,
  "avaSlots" INT NOT NULL DEFAULT 40
);

-- payments: payment records
-- Attributes: payID, amount, method
-- Methods (app-side): processPay()
CREATE TABLE payments (
  "payID" TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'Cash',
  "ticketID" TEXT REFERENCES tickets("ticketID")
);

-- pricing: per-vehicle-type pricing (for Admin.updatePrice)
CREATE TABLE pricing (
  "vehicleType" TEXT PRIMARY KEY,
  "hourlyRate" NUMERIC NOT NULL DEFAULT 20
);

-- ============================================================
-- 3) INSERT DEFAULT DATA
-- ============================================================

-- Insert default parking row (single row for slot counting)
INSERT INTO parking (id, "totalSlots", "avaSlots")
VALUES (1, 40, 40);

-- Insert default pricing per vehicle type
INSERT INTO pricing ("vehicleType", "hourlyRate") VALUES
  ('Car', 20),
  ('Bike', 10),
  ('EV', 25),
  ('Handicap', 15);

-- Insert the admin into the ADMIN child table (NOT the parent users table)
-- This email must match the one you use in Supabase Auth
INSERT INTO admin (user_email_id, password, role)
VALUES ('241033013@juitsolan.in', '', 'admin');

-- Insert static staff data into the STAFF child table
-- NOTE: Each staff member must ALSO have a Supabase Auth account
-- with the same email. Create them in Supabase Dashboard > Auth > Add User.
INSERT INTO staff (user_email_id, password, role) VALUES
  ('staff1@juitsolan.in', '', 'staff'),
  ('staff2@juitsolan.in', '', 'staff'),
  ('staff3@juitsolan.in', '', 'staff');

-- ============================================================
-- 4) ENABLE ROW LEVEL SECURITY + POLICIES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write all tables
CREATE POLICY "Allow all for authenticated" ON users
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON admin
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON staff
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON tickets
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON parking
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON payments
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON pricing
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 5) AUTO-CREATE STAFF PROFILE ON SIGNUP
-- When a new user signs up via Supabase Auth, automatically
-- insert them into the STAFF table (not parent users table).
-- Admin.addStaff() also inserts into the staff table explicitly.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.staff (user_email_id, password, role)
  VALUES (new.email, '', 'staff')
  ON CONFLICT (user_email_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
