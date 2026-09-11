-- Statlab progress storage
-- Run this entire file in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  score smallint check (score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx
  on public.lesson_progress (user_id);

alter table public.lesson_progress enable row level security;

revoke all on table public.lesson_progress from anon;
grant select, insert, update, delete on table public.lesson_progress to authenticated;

drop policy if exists "Users can read their own progress" on public.lesson_progress;
create policy "Users can read their own progress"
  on public.lesson_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own progress" on public.lesson_progress;
create policy "Users can insert their own progress"
  on public.lesson_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.lesson_progress;
create policy "Users can update their own progress"
  on public.lesson_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own progress" on public.lesson_progress;
create policy "Users can delete their own progress"
  on public.lesson_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

-- Run once in Supabase SQL Editor, or apply with the Supabase CLI.
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
