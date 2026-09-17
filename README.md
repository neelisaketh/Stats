# Statwise

A modern AP Statistics learning site built with Next.js, Supabase, and Vercel.

## Included

- Khan Academy-inspired home and navigation system
- Inference Test Lab with 10 procedure families and exactly 100 original questions per family
- Two-stage quiz flow: identify the procedure, then solve selected calculations
- Test statistic, p-value, confidence interval, and alpha-decision practice
- Integrated TI-84-style command results
- Normal curve quiz with z-score, percentile, area, and draggable-bound questions
- Statistical notation concentration game
- Interactive Plinko and normal curve lesson
- Guest progress in local storage; optional Supabase email sign-in and cloud progress

The problem bank is original and deterministic. Each problem includes a realistic study setup, population parameter, design, condition checks, numerical work, and contextual interpretation. The structure is modeled on the [College Board released FRQ archive](https://apcentral.collegeboard.org/courses/ap-statistics/exam/past-exam-questions) and [AP Statistics Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-statistics-course-and-exam-description.pdf); it does not reproduce copyrighted exam questions. One-way ANOVA is clearly marked as a course extension beyond the core AP Statistics exam.

## Run locally

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and enter the project URL and publishable key.
4. In Supabase Authentication URL Configuration, add `http://localhost:3000/auth/callback` and the production Vercel callback URL.

Sign-in is optional. Without environment variables, every activity works and progress remains on the current device.

## Vercel

Import `neelisaketh/Stats` into Vercel, use the Next.js preset, and add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (the production `https://...vercel.app` URL)

Every push to `main` will deploy automatically after the Vercel project is linked.

## Verification

```powershell
npm.cmd run lint
npm.cmd run build
```

## Classroom update — existing installations

1. Run `supabase/migrations/202609160001_classroom.sql` in the Supabase SQL Editor. For a new project, run the complete `supabase/schema.sql` instead. The migration preserves existing attempts and lesson progress.
2. Add **server-only** Vercel environment variables:
   - `SUPABASE_SECRET_KEY`: your Supabase secret key (a legacy service-role key also works). Do not use a publishable key here.
   - `ADMIN_ACCESS_PASSWORD`: choose the special teacher enrollment password privately in Vercel. Do not put it in source code or prefix it with `NEXT_PUBLIC_`.
3. Keep `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` configured. Redeploy after changing variables.
4. Enable email/password authentication in Supabase. Allow these redirect URLs for both localhost and your production domain:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/reset-password`
   - `https://YOUR-DOMAIN/auth/callback`
   - `https://YOUR-DOMAIN/auth/callback?next=/auth/reset-password`
   Keep the default confirmation/recovery templates using `{{ .ConfirmationURL }}`. Open email links in the browser that requested them (PKCE).
5. Sign in with a verified account, visit `/admin`, and enter the special administrator password. This enrolls the account as an administrator; later sign-ins automatically open its dashboard.

Administrator enrollment fails closed if either server variable or the migration is missing. The server checks the signed-in user and password; it rate-limits attempts to five per account per 15 minutes. The browser cannot grant itself a role. To revoke access, delete that user's row from `public.administrators` in the Supabase Dashboard. Changing the special password prevents future enrollments with the old password; it does not revoke existing administrators.

### Student and teacher flows

- `/learn`, `/practice`, `/normal`, and `/games` are activity catalogs. Add future activities in `lib/activities.ts` and give them their own route.
- Email/password and optional email-link sign-in lead students to `/account` to confirm their name, grade level, school year, and class period. These details remain editable and are required before posting.
- Completed rounds save automatically. Personal bests use the highest percentage, breaking ties by the number of questions. All-time bests and the latest 50 attempts appear at `/progress`.
- Concentration scores use `8 pairs / number of moves`; a perfect eight-move game scores 100%. Older saved concentration scores retain the previous scoring formula, so they should be treated as legacy results.
- Scores remain private until the student selects **Post score**. Students can post the latest result or a saved best/recent score. Reposting the same attempt is idempotent.
- Posts snapshot the student's class and database timestamps. Later profile edits cannot move old posts to a different class. Teachers see posted scores only, not private attempts or unrelated account details.
- In `/admin`, choose the class (school year + period + grade), then the activity and optional posted-date range. Review all submissions or each student's best posted score. Assign a grade, leave feedback, and mark the result as recorded in the gradebook. Export the visible page to CSV.
- Original quiz/game results are browser-computed practice scores, **not proctored or tamper-proof exam grades**. Teacher grades are separately stored and permission-protected.
- Guest history stays on the device and is intentionally not imported into a signed-in user's account on shared computers. Account data reloads on sign-in and clears on sign-out. Saving errors have a retry button instead of a false success message.
- Password recovery uses [Supabase's recovery flow](https://supabase.com/docs/guides/auth/passwords) and `/auth/reset-password`; existing email-link users can also use this to set a password.

### Checks

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run test:classroom
```

The classroom test uses an isolated PostgreSQL-compatible PGlite database. It tests fresh schema and migration re-runs, ownership, role escalation denial, immutable posts and timestamps, private attempts, best-score selection, class/date filters, review permissions, and administrator rate limiting. It never touches the production database. Real email delivery and production redirects require the Supabase/Vercel setup above.
