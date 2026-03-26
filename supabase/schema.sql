-- TDS: Trader Discipline System — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text,
  account_balance numeric default 0,
  risk_percent numeric default 1,
  max_daily_trades integer default 5,
  created_at timestamptz default now()
);

-- TRADES
create table trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  pair text not null,
  direction text check (direction in ('BUY','SELL')) not null,
  entry numeric,
  stop_loss numeric,
  take_profit numeric,
  result text check (result in ('win','loss','breakeven')) not null,
  pnl numeric default 0,
  actual_rr numeric,
  planned_rr numeric,
  lot_size numeric,
  strategy text,
  is_revenge boolean default false,
  is_strategy_break boolean default false,
  is_overtrading boolean default false,
  mood integer check (mood between 1 and 5),
  notes text,
  screenshot_url text,
  ai_feedback text,
  discipline_score integer default 100,
  created_at timestamptz default now()
);

-- DAILY STATS (materialized per day)
create table daily_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  total_trades integer default 0,
  wins integer default 0,
  losses integer default 0,
  total_pnl numeric default 0,
  revenge_count integer default 0,
  strategy_breaks integer default 0,
  discipline_score integer default 100,
  unique(user_id, date)
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table trades enable row level security;
alter table daily_stats enable row level security;

-- Policies: users only see their own data
create policy "Users see own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own trades" on trades for all using (auth.uid() = user_id);
create policy "Users see own daily stats" on daily_stats for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', false);
create policy "Users manage own screenshots" on storage.objects for all using (auth.uid()::text = (storage.foldername(name))[1]);
