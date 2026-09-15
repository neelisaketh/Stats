create table if not exists public.question_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  correct boolean not null default false,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, question_id)
);
alter table public.question_progress enable row level security;
revoke all on table public.question_progress from anon;
grant select, insert, update on table public.question_progress to authenticated;
drop policy if exists "Read own question progress" on public.question_progress;
create policy "Read own question progress" on public.question_progress for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own question progress" on public.question_progress;
create policy "Insert own question progress" on public.question_progress for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own question progress" on public.question_progress;
create policy "Update own question progress" on public.question_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
