-- Run once in Supabase SQL Editor, or apply with the Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.practice_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 activity text not null check (length(activity) between 1 and 100),
 correct integer not null check (correct >= 0),
 total integer not null check (total between 1 and 100),
 created_at timestamptz not null default now(),
 check (correct <= total)
);
create index if not exists practice_attempts_user_created_idx on public.practice_attempts(user_id, created_at desc);
alter table public.practice_attempts enable row level security;
revoke all on public.practice_attempts from anon, authenticated;
grant select, insert on public.practice_attempts to authenticated;
drop policy if exists "Read own attempts" on public.practice_attempts;
create policy "Read own attempts" on public.practice_attempts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own attempts" on public.practice_attempts;
create policy "Insert own attempts" on public.practice_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
