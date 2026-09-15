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
