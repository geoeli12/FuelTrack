-- Fuel Log Supabase schema (minimal)
-- Run in Supabase SQL editor.

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.fuel_readings (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete restrict,
  driver_name text,
  before_image text,
  after_image text,
  before_reading numeric,
  after_reading numeric,
  gallons_used numeric,
  date date not null,
  time text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_fuel_readings_date on public.fuel_readings(date);

create table if not exists public.fuel_refills (
  id uuid primary key default gen_random_uuid(),
  gallons_added numeric not null,
  date date not null,
  cost numeric,
  notes text,
  running_total_after numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_fuel_refills_date on public.fuel_refills(date);

-- Single-row tank state (you can keep one row and update it)
create table if not exists public.fuel_tank (
  id uuid primary key default gen_random_uuid(),
  current_gallons numeric not null,
  last_updated timestamptz,
  created_at timestamptz not null default now()
);
