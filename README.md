# Statlab — inference practice

A quiz-only AP Statistics website built with Next.js, ready for the existing Vercel project. The previous lessons, games, labs, and reference pages now redirect to the quiz builder.

## Features

- Exactly 1,000 original, deterministic, numerically varied questions in `lib/question-bank.json` (not 1,000 separately hand-written scenarios).
- Nine inference families: one/two-proportion z, one/two-sample t, paired t, chi-square goodness-of-fit/independence/homogeneity, and regression slope t.
- Goodness-of-fit and slope are labeled legacy AP topics following the fall 2026 curriculum revisions: https://apcentral.collegeboard.org/courses/ap-statistics/future-revisions
- 279 procedure-identification, 168 confidence-interval, 279 p-value, and 274 significance-decision problems.
- Select any tests and compatible skills. CI filtering excludes chi-square questions.
- Fixed rounds from 1 to the matching bank size, or question-by-question sessions that can finish anytime. Sampling without replacement; a new session reshuffles the bank.
- Feedback, explanations, accuracy, and review of every submitted answer. Unanswered questions are reported separately.
- Calculator-style numeric input: four decimal places, absolute tolerance 0.00015. Proportions use decimals, not percentages. Independent means use Welch degrees of freedom.
- Quiz sessions live in memory and reset on reload. No sign-in or Supabase migration is required for quizzes. Existing Supabase infrastructure is retained for compatibility; new quiz scores are not cloud-saved.

## Run locally (Windows PowerShell)

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. For a production build, run `npm.cmd run build`.

## Deployment

Push to the branch connected to the existing Vercel project. Vercel can build with `npm run build`. The quiz requires no environment variables. Existing Supabase auth routes remain optional and separate from quiz practice.

## Regenerate the question bank

The checked-in JSON is used directly; Python is not needed to run or deploy the website. To regenerate it, install Python's SciPy package and run `python scripts/generate-bank.py` from this directory. The script uses seeded data and SciPy Normal, Student t, and chi-square distributions; no normal approximations are substituted for t tails. Tests use null/pooled standard errors; intervals use sample/unpooled standard errors. Chi-square contingency tests omit continuity correction.
