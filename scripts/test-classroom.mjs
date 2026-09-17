import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const student = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222",
  teacher = "33333333-3333-4333-8333-333333333333";
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema public,auth to anon,authenticated,service_role;
grant execute on function auth.uid() to anon,authenticated,service_role;
insert into auth.users values('${student}'),('${other}'),('${teacher}');`);
const schema = (
  await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8")
).replace("create extension if not exists pgcrypto;", "");
await db.exec(schema);
const migration = await readFile(
  new URL("../supabase/migrations/202609160001_classroom.sql", import.meta.url),
  "utf8",
);
await db.exec(migration); // Upgrade/re-run must work as well as fresh installation.
async function as(id, role = "authenticated") {
  await db.exec(
    `reset role; set role ${role}; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
async function rows(sql) {
  return (await db.query(sql)).rows;
}
async function denied(sql) {
  await assert.rejects(db.exec(sql));
}
await as(student);
await db.exec(
  `insert into public.student_profiles values('${student}','Student One',12,'2026-2027',4);`,
);
await denied(
  `insert into public.student_profiles values('${other}','Spoofed',12,'2026-2027',4)`,
);
await denied(`insert into public.administrators(user_id) values('${student}')`);
await denied(`select public.reserve_admin_access('${student}')`);
await denied(
  `update public.student_profiles set school_year='2026-2028' where user_id='${student}'`,
);
await denied(
  `insert into public.practice_attempts(user_id,activity,correct,total,created_at) values('${student}','Inference Test Lab',1,1,'2000-01-01')`,
);
await denied(
  `insert into public.practice_attempts(user_id,activity,correct,total) values('${other}','Inference Test Lab',1,1)`,
);
const [a] = await rows(
  `insert into public.practice_attempts(user_id,activity,correct,total) values('${student}','Inference Test Lab',800,1000) returning *`,
);
const [b] = await rows(
  `insert into public.practice_attempts(user_id,activity,correct,total) values('${student}','Inference Test Lab',7,10) returning *`,
);
assert.equal((await rows("select * from public.my_best_scores()"))[0].id, a.id);
await denied(
  `update public.practice_attempts set correct=1000 where id='${a.id}'`,
);
const [{ id: postId }] = await rows(
  `select public.post_score('${a.id}') as id`,
);
assert.equal(
  (await rows(`select public.post_score('${a.id}') as id`))[0].id,
  postId,
);
await rows(`select public.post_score('${b.id}')`);
assert.equal((await rows("select * from public.score_posts")).length, 2);
await db.exec(
  `update public.student_profiles set class_period=5 where user_id='${student}'`,
);
assert.equal(
  (
    await rows(
      `select class_period from public.score_posts where id='${postId}'`,
    )
  )[0].class_period,
  4,
);
await denied(
  `insert into public.score_reviews(post_id,grade,reviewer_id) values('${postId}',100,'${student}')`,
);
await denied(`update public.score_posts set correct=1000 where id='${postId}'`);
await as(other);
assert.equal((await rows("select * from public.practice_attempts")).length, 0);
assert.equal((await rows("select * from public.score_posts")).length, 0);
assert.equal((await rows("select * from public.student_profiles")).length, 0);
assert.equal((await rows("select * from public.admin_classes()")).length, 0);
await denied(`select public.post_score('${a.id}')`);
const [noProfile] = await rows(
  `insert into public.practice_attempts(user_id,activity,correct,total) values('${other}','Normal Curve Quiz',9,10) returning *`,
);
await denied(`select public.post_score('${noProfile.id}')`);
await as(teacher, "service_role");
for (let n = 1; n <= 6; n++)
  assert.equal(
    (
      await rows(`select public.reserve_admin_access('${teacher}') as allowed`)
    )[0].allowed,
    n <= 5,
  );
await db.exec(
  `insert into public.administrators(user_id) values('${teacher}')`,
);
await as(teacher);
assert.equal(
  (await rows("select public.is_administrator() as admin"))[0].admin,
  true,
);
assert.equal((await rows("select * from public.practice_attempts")).length, 0); // No access to private unposted attempts.
assert.equal((await rows("select * from public.score_posts")).length, 2);
assert.equal(
  (await rows("select * from public.admin_classes()"))[0].class_period,
  4,
);
assert.equal(
  (
    await rows(
      `select * from public.class_best_scores('2026-2027',4,12,'Inference Test Lab',null,null)`,
    )
  )[0].id,
  postId,
);
assert.equal(
  (
    await rows(
      `select * from public.class_best_scores('2026-2027',5,12,'',null,null)`,
    )
  ).length,
  0,
);
assert.equal(
  (
    await rows(
      `select * from public.class_best_scores('2026-2027',4,12,'','2000-01-01','2001-01-01')`,
    )
  ).length,
  0,
);
await db.exec(
  `insert into public.score_reviews(post_id,grade,feedback,recorded,reviewer_id) values('${postId}',92,'Good progress',true,'${teacher}')`,
);
await denied(
  `update public.score_reviews set grade=101 where post_id='${postId}'`,
);
await as(student);
assert.equal((await rows("select * from public.score_reviews"))[0].grade, "92");
await db.exec(
  `update public.score_reviews set grade=100 where post_id='${postId}'`,
);
assert.equal((await rows("select * from public.score_reviews"))[0].grade, "92");
await as(other);
assert.equal((await rows("select * from public.score_reviews")).length, 0);
await as("", "anon");
await denied("select * from public.score_posts");
await denied("select public.my_best_scores()");
await denied(`select public.post_score('${a.id}')`);
await db.close();
console.log(
  "PASS: migration, ownership, private scores, best scores, posts, class snapshots, teacher review, dates, timestamps, and rate limiting",
);
