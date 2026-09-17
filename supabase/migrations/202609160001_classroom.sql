-- Apply after schema.sql on existing projects. Safe to rerun.
begin;
-- Sessions can include all 1,000 questions.
alter table public.practice_attempts drop constraint if exists practice_attempts_total_check;
alter table public.practice_attempts add constraint practice_attempts_total_check check (total between 1 and 1000);
create table if not exists public.student_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (length(trim(display_name)) between 1 and 80),
 grade smallint not null check (grade between 6 and 12),
 school_year text not null check (school_year ~ '^[0-9]{4}-[0-9]{4}$' and right(school_year,4)::int = left(school_year,4)::int + 1),
 class_period smallint not null check (class_period between 1 and 12)
);
create table if not exists public.administrators (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.administrators enable row level security;
revoke all on public.administrators from anon, authenticated;
grant select on public.administrators to authenticated;
drop policy if exists "Read own admin role" on public.administrators;
create policy "Read own admin role" on public.administrators for select to authenticated using (user_id = (select auth.uid()));
create or replace function public.is_administrator() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.administrators where user_id = (select auth.uid()));
$$;
revoke all on function public.is_administrator() from public, anon;
grant execute on function public.is_administrator() to authenticated;
alter table public.student_profiles enable row level security;
revoke all on public.student_profiles from anon, authenticated;
grant select, insert, update on public.student_profiles to authenticated;
drop policy if exists "Read own profile" on public.student_profiles;
create policy "Read own profile" on public.student_profiles for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Create own profile" on public.student_profiles;
create policy "Create own profile" on public.student_profiles for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Edit own profile" on public.student_profiles;
create policy "Edit own profile" on public.student_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create table if not exists public.score_posts (
 id uuid primary key default gen_random_uuid(),
 attempt_id uuid not null unique references public.practice_attempts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 activity text not null, correct int not null, total int not null,
 display_name text not null, grade smallint not null, school_year text not null, class_period smallint not null,
 attempted_at timestamptz not null, posted_at timestamptz not null default now()
);
create index if not exists score_posts_class_idx on public.score_posts(school_year, class_period, activity, posted_at desc);
alter table public.score_posts enable row level security;
revoke all on public.score_posts from anon, authenticated;
grant select on public.score_posts to authenticated;
drop policy if exists "Read posted scores" on public.score_posts;
create policy "Read posted scores" on public.score_posts for select to authenticated using (user_id = (select auth.uid()) or (select public.is_administrator()));
-- Snapshot an owned attempt and profile on the database; callers cannot supply a score or timestamp.
create or replace function public.post_score(attempt uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare a public.practice_attempts; p public.student_profiles; result uuid;
begin
 select * into a from public.practice_attempts where id = attempt and user_id = auth.uid();
 if not found then raise exception 'Attempt not found'; end if;
 select * into p from public.student_profiles where user_id = auth.uid();
 if not found then raise exception 'Complete your class profile before posting a score'; end if;
 insert into public.score_posts(attempt_id,user_id,activity,correct,total,display_name,grade,school_year,class_period,attempted_at)
 values(a.id,a.user_id,a.activity,a.correct,a.total,p.display_name,p.grade,p.school_year,p.class_period,a.created_at)
 on conflict(attempt_id) do nothing;
 select id into result from public.score_posts where attempt_id = a.id;
 return result;
end;
$$;
revoke all on function public.post_score(uuid) from public, anon;
grant execute on function public.post_score(uuid) to authenticated;
create table if not exists public.score_reviews (
 post_id uuid primary key references public.score_posts(id) on delete cascade,
 grade numeric check (grade between 0 and 100),
 feedback text not null default '' check (length(feedback) <= 2000),
 recorded boolean not null default false,
 reviewer_id uuid not null references auth.users(id),
 reviewed_at timestamptz not null default now()
);
alter table public.score_reviews enable row level security;
revoke all on public.score_reviews from anon, authenticated;
grant select, insert, update on public.score_reviews to authenticated;
drop policy if exists "Read relevant reviews" on public.score_reviews;
create policy "Read relevant reviews" on public.score_reviews for select to authenticated using (exists(select 1 from public.score_posts p where p.id = post_id));
drop policy if exists "Admin create reviews" on public.score_reviews;
create policy "Admin create reviews" on public.score_reviews for insert to authenticated with check ((select public.is_administrator()) and reviewer_id = (select auth.uid()));
drop policy if exists "Admin edit reviews" on public.score_reviews;
create policy "Admin edit reviews" on public.score_reviews for update to authenticated using ((select public.is_administrator())) with check ((select public.is_administrator()) and reviewer_id = (select auth.uid()));
create or replace function public.stamp_review() returns trigger language plpgsql set search_path = '' as $$
begin new.reviewed_at = now(); new.reviewer_id = auth.uid(); return new; end;
$$;
drop trigger if exists stamp_review on public.score_reviews;
create trigger stamp_review before insert or update on public.score_reviews for each row execute function public.stamp_review();
create or replace function public.my_best_scores() returns setof public.practice_attempts language sql stable security invoker set search_path = '' as $$
 select distinct on (activity) * from public.practice_attempts where user_id = (select auth.uid()) order by activity, correct::numeric/total desc, total desc, created_at desc;
$$;
revoke all on function public.my_best_scores() from public, anon;
grant execute on function public.my_best_scores() to authenticated;
-- Persistent atomic rate limit, callable only by the server's service role.
create table if not exists public.admin_access_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(), attempts int not null default 0
);
alter table public.admin_access_attempts enable row level security;
revoke all on public.admin_access_attempts from anon, authenticated;
create or replace function public.reserve_admin_access(target_user uuid) returns boolean language plpgsql security definer set search_path = '' as $$
declare n int;
begin
 insert into public.admin_access_attempts(user_id,attempts) values(target_user,1)
 on conflict(user_id) do update set
 attempts = case when public.admin_access_attempts.started_at < now() - interval '15 minutes' then 1 else public.admin_access_attempts.attempts + 1 end,
 started_at = case when public.admin_access_attempts.started_at < now() - interval '15 minutes' then now() else public.admin_access_attempts.started_at end
 returning attempts into n;
 return n <= 5;
end;
$$;
revoke all on function public.reserve_admin_access(uuid) from public, anon, authenticated;
grant execute on function public.reserve_admin_access(uuid) to service_role;
grant all on public.administrators, public.admin_access_attempts to service_role;

create or replace function public.admin_classes()
returns table(school_year text, class_period smallint, grade smallint)
language sql stable security invoker set search_path = '' as $$
 select distinct school_year, class_period, grade from public.score_posts where (select public.is_administrator()) order by school_year desc, class_period, grade;
$$;
revoke all on function public.admin_classes() from public, anon;
grant execute on function public.admin_classes() to authenticated;
create or replace function public.class_best_scores(selected_year text, selected_period int, selected_grade int, selected_activity text, date_from timestamptz, date_to timestamptz)
returns setof public.score_posts language sql stable security invoker set search_path = '' as $$
 select distinct on (user_id,activity) * from public.score_posts
 where (select public.is_administrator()) and school_year = selected_year and class_period = selected_period and grade = selected_grade
 and (selected_activity = '' or activity = selected_activity)
 and (date_from is null or posted_at >= date_from) and (date_to is null or posted_at < date_to)
 order by user_id, activity, correct::numeric/total desc, total desc, posted_at desc;
$$;
revoke all on function public.class_best_scores(text,int,int,text,timestamptz,timestamptz) from public, anon;
grant execute on function public.class_best_scores(text,int,int,text,timestamptz,timestamptz) to authenticated;
-- The database owns timestamps; browser clients may only insert score fields.
revoke insert on public.practice_attempts from authenticated;
grant insert(id,user_id,activity,correct,total) on public.practice_attempts to authenticated;

commit;
