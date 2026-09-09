# Statlab

Statlab is a visual AP Statistics learning site built with Next.js, Supabase, and Vercel. It includes:

- eight AP Statistics units with objectives, worked examples, common mistakes, and checkpoints;
- four interactive models: Normal probability, sampling means, confidence interval coverage, and coin-flip convergence;
- a 40-term vocabulary arcade with randomized ten-question rounds;
- five-step inference practice for all nine AP test families plus one-way ANOVA;
- authenticated practice scores stored in Supabase;
- an inference-procedure reference guide;
- guest progress saved in the browser; and
- passwordless email sign-in with progress synced through Supabase.

The site works without Supabase while you design or test it. Once the three environment variables are added, accounts and cloud progress turn on automatically.

## Stack

- Next.js 16 App Router and TypeScript
- React 19
- Tailwind CSS 4 plus the custom design system in `app/globals.css`
- Supabase Auth, Postgres, and Row Level Security
- Vercel hosting

## 1. Run the site locally

Install [Node.js 20.9 or later](https://nextjs.org/docs/app/getting-started/installation), then run:

```bash
git clone https://github.com/neelisaketh/Stats.git
cd Stats
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Until real Supabase values are added, the site remains fully usable in guest mode and saves completed units in `localStorage`.

## 2. Create the Supabase backend

1. Go to [database.new](https://database.new) and create a Supabase project.
2. Wait for the database to finish provisioning.
3. In the Supabase dashboard, open **SQL Editor** and create a new query.
4. Copy all of [`supabase/schema.sql`](supabase/schema.sql) into the editor and press **Run**.

That SQL creates `lesson_progress`, enables Row Level Security, removes anonymous access, and adds policies that only allow a signed-in user to read or change rows whose `user_id` matches their account.

### Add the Supabase keys locally

In Supabase, open your project and press **Connect**. Copy the Project URL and Publishable key into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the publishable key, not a `service_role` or secret key. The publishable key is intentionally exposed to the browser; Row Level Security protects the data.

Restart `npm run dev` after changing `.env.local`.

### Configure passwordless sign-in

In Supabase, open **Authentication → URL Configuration** and set:

- **Site URL:** `http://localhost:3000` while testing locally
- **Redirect URLs:** `http://localhost:3000/**`

Email authentication and magic links are enabled by default on hosted Supabase projects. The sign-in page calls `signInWithOtp`, and `/auth/callback` exchanges the returned code for a cookie-backed session.

## 3. Deploy from GitHub to Vercel

First make sure the finished code is pushed to the `main` branch of `neelisaketh/Stats`.

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. Choose **Add New → Project**.
3. Find `neelisaketh/Stats` and press **Import**. If it is missing, grant the Vercel GitHub app access to that repository.
4. Leave **Framework Preset** as **Next.js**, **Root Directory** as `./`, and the build settings at their detected defaults.
5. In **Environment Variables**, add all three values below. Apply each to Production, Preview, and Development:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key |
   | `NEXT_PUBLIC_SITE_URL` | Your production URL, such as `https://stats-yourname.vercel.app` |

6. Press **Deploy**.

Vercel will run `npm run build`. After a successful deployment, every push to `main` creates a new production deployment; pushes to other branches create previews.

## 4. Point Supabase Auth at Vercel

After Vercel gives you the final production URL, return to **Supabase → Authentication → URL Configuration**:

1. Change **Site URL** to the exact production URL, for example `https://stats-yourname.vercel.app`.
2. Keep `http://localhost:3000/**` in **Redirect URLs**.
3. Add the production callback allow-list entry: `https://stats-yourname.vercel.app/**`.
4. To use magic links on Vercel preview deployments, also add `https://*-YOUR_VERCEL_ACCOUNT_SLUG.vercel.app/**`.

Then verify the complete flow:

1. Open `/auth` on the deployed site.
2. Enter your email and open the magic link.
3. Complete any course unit.
4. In Supabase, open **Table Editor → lesson_progress** and confirm that a row was created.
5. Sign out, sign back in on another browser, and confirm the completion checkmark syncs.

## 5. Development checks

```bash
npm run lint
npm run build
```

Run both before merging major changes. Never commit `.env.local`; the repository ignores all environment files except the safe placeholder `.env.example`.

## Project map

```text
app/
  auth/                 Passwordless login and callback
  lab/                  Interactive Normal model
  learn/                Course map and dynamic unit pages
  reference/            Inference procedure guide
components/             Shared interactive UI
lib/course.ts           Unit content and checkpoint data
lib/supabase/           Browser/server clients and session refresh
supabase/schema.sql     Database table, grants, and RLS policies
proxy.ts                Refreshes Supabase auth cookies
```

## Edit course content

All eight units live in `lib/course.ts`. Each unit has a slug, title, summary, objectives, worked example, warning, and checkpoint. Add a new object to `courseUnits` to create a new route automatically.

## Troubleshooting

- **The site says Supabase is not connected:** confirm both `NEXT_PUBLIC_SUPABASE_*` variables exist, then restart locally or redeploy on Vercel.
- **The magic link returns to the wrong place:** check `NEXT_PUBLIC_SITE_URL`, the Supabase Site URL, and the Redirect URL allow list. Environment-variable changes only affect new Vercel deployments.
- **Progress works locally but does not sync:** confirm `supabase/schema.sql` ran successfully and that you are signed in.
- **A database request returns 401/403:** inspect the current user in **Supabase → Authentication → Users**, then verify that RLS policies still compare `auth.uid()` with `user_id`.
- **A Vercel preview cannot sign in:** add the official Supabase Vercel wildcard for your account slug under Redirect URLs.

## Official references

- [Supabase: use Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase: server-side Auth clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase: redirect URLs for Vercel](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel: deploy GitHub projects](https://vercel.com/docs/git/vercel-for-github)
- [Vercel: environment variables](https://vercel.com/docs/environment-variables)

## New practice center

- `/practice`: choose a procedure or complete a mixed round. Covers one- and two-proportion z, one- and two-sample t, paired t, chi-square GOF/independence/homogeneity, regression slope t, and ANOVA (extension). Each problem checks procedure selection, null hypothesis, conditions, statistic, and decision with contextual feedback. P-values are supplied at the decision step; this is a guided trainer, not a general-purpose calculator. Numeric answers accept absolute error up to 0.015.
- `/games`: 10-question vocabulary rounds sampled without replacement from 40 terms, plus a five-pair matching game. Matching boards are unsaved warm-ups.
- `/animations`: four adjustable models with pause, reset, and manual batches. Simulations cap at 2,000 observations to bound browser work; only the latest 30 confidence intervals are drawn. Sampling uses an Exponential(1) population; the interval model uses a Normal population with known sigma. These assumptions are explicit in the UI.

**Existing Supabase projects:** run `supabase/migrations/202609090001_practice_attempts.sql` in the SQL Editor. New projects can run the full `supabase/schema.sql`. Scores are private per user through RLS and are self-reported practice results, not secure grades. Guests can play without configuration; guest round scores remain on the current screen and are not cloud-saved. Cloud write failures display a message.

The Vercel and Supabase setup above remains applicable. No service-role key is needed. Deploying code does not apply database migrations automatically.
