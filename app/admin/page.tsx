"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { createClient } from "@/lib/supabase/client";
import { ScorePost } from "@/lib/progress";
import { activities } from "@/lib/activities";
type ClassOption = { school_year: string; class_period: number; grade: number };
function ReviewForm({ post, onSave }: { post: ScorePost; onSave: () => void }) {
  const { user } = useProgress();
  const [grade, setGrade] = useState(
      post.score_reviews?.grade?.toString() ?? "",
    ),
    [feedback, setFeedback] = useState(post.score_reviews?.feedback ?? ""),
    [recorded, setRecorded] = useState(post.score_reviews?.recorded ?? false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error();
      const { error } = await supabase
        .from("score_reviews")
        .upsert(
          {
            post_id: post.id,
            grade: grade.trim() === "" ? null : Number(grade),
            feedback,
            recorded,
            reviewer_id: user.id,
          },
          { onConflict: "post_id" },
        );
      if (error) throw error;
      setMessage("Review saved.");
      onSave();
    } catch {
      setMessage(
        "Could not save. Check your administrator access and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="review-form" onSubmit={save}>
      <label>
        Grade (%)
        <input
          aria-label={`Grade for ${post.display_name}`}
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Ungraded"
        />
      </label>
      <label>
        Feedback
        <textarea
          maxLength={2000}
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={recorded}
          onChange={(e) => setRecorded(e.target.checked)}
        />
        Recorded in gradebook
      </label>
      <button className="button button-accent small" disabled={busy}>
        {busy ? "Saving…" : "Save review"}
      </button>
      {message && <span role="status">{message}</span>}
    </form>
  );
}
export default function Admin() {
  const { user, isAdmin, loading, refresh } = useProgress();
  const [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]),
    [classKey, setClassKey] = useState(""),
    [activity, setActivity] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [bestOnly, setBestOnly] = useState(false);
  const [posts, setPosts] = useState<ScorePost[]>([]),
    [fetching, setFetching] = useState(false),
    [page, setPage] = useState(0),
    [hasMore, setHasMore] = useState(false),
    [revision, setRevision] = useState(0),
    [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (!isAdmin) {
        setClasses([]);
        setPosts([]);
        return;
      }
      const supabase = createClient();
      if (!supabase) return;
      void supabase.rpc("admin_classes").then(({ data, error }) => {
        if (!active) return;
        if (error)
          setError(
            "Could not load classes. Check the database setup and refresh.",
          );
        else setClasses(data ?? []);
      });
    };
    load();
    return () => {
      active = false;
    };
  }, [isAdmin, revision]);
  useEffect(() => {
    let active = true;
    const load = () => {
      setPosts([]);
      setExpanded(null);
      setHasMore(false);
      if (!isAdmin || !classKey) return;
      const supabase = createClient();
      if (!supabase) return;
      const c = JSON.parse(classKey) as ClassOption;
      if (from && to && from > to) {
        setError("The start date must be before the end date.");
        setFetching(false);
        return;
      }
      const dateFrom = from ? new Date(`${from}T00:00:00`).toISOString() : null;
      const end = to ? new Date(`${to}T00:00:00`) : null;
      if (end) end.setDate(end.getDate() + 1);
      const dateTo = end?.toISOString() ?? null;
      setFetching(true);
      setError("");
      let query = bestOnly
        ? supabase
            .rpc("class_best_scores", {
              selected_year: c.school_year,
              selected_period: c.class_period,
              selected_grade: c.grade,
              selected_activity: activity,
              date_from: dateFrom,
              date_to: dateTo,
            })
            .select("*,score_reviews(*)")
        : supabase
            .from("score_posts")
            .select("*,score_reviews(*)")
            .eq("school_year", c.school_year)
            .eq("class_period", c.class_period)
            .eq("grade", c.grade);
      if (!bestOnly) {
        if (activity) query = query.eq("activity", activity);
        if (dateFrom) query = query.gte("posted_at", dateFrom);
        if (dateTo) query = query.lt("posted_at", dateTo);
      }
      void query
        .order("posted_at", { ascending: false })
        .order("id")
        .range(page * 25, page * 25 + 25)
        .then(({ data, error }) => {
          if (!active) return;
          setFetching(false);
          if (error) {
            setError(
              "Could not load submissions. Please refresh and try again.",
            );
            return;
          }
          setPosts((data ?? []).slice(0, 25) as ScorePost[]);
          setHasMore((data?.length ?? 0) > 25);
        });
    };
    load();
    return () => {
      active = false;
    };
  }, [isAdmin, classKey, activity, from, to, bestOnly, page, revision]);
  async function unlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPassword("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enable access.");
    } finally {
      setBusy(false);
    }
  }
  function csv() {
    const escape = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const rows = [
      [
        "Student",
        "Grade level",
        "School year",
        "Period",
        "Activity",
        "Correct",
        "Total",
        "Score %",
        "Completed",
        "Posted",
        "Teacher grade",
        "Recorded",
        "Feedback",
      ],
      ...posts.map((p) => [
        p.display_name,
        p.grade,
        p.school_year,
        p.class_period,
        p.activity,
        p.correct,
        p.total,
        ((p.correct / p.total) * 100).toFixed(1),
        p.attempted_at,
        p.posted_at,
        p.score_reviews?.grade,
        p.score_reviews?.recorded ?? false,
        p.score_reviews?.feedback,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.map(escape).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "statwise-scores.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="activity-page wrap">
      <div className="catalog-heading">
        <span className="kicker">Teacher workspace</span>
        <h1>See progress. Guide the next step.</h1>
        <p>Review the scores students choose to share with you.</p>
      </div>
      {loading ? (
        <p>Checking your account…</p>
      ) : !user ? (
        <section className="empty-state">
          <h2>Sign in to continue.</h2>
          <p>Administrator access is linked to your verified account.</p>
          <Link className="button button-accent" href="/auth">
            Sign in
          </Link>
        </section>
      ) : !isAdmin ? (
        <section className="surface narrow">
          <h2>Administrator access</h2>
          <p>
            Enter the special password provided by the site owner. Your regular
            account password is separate.
          </p>
          <form className="profile-form" onSubmit={unlock}>
            <label>
              Administrator password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={256}
                autoComplete="off"
              />
            </label>
            <button className="button button-accent" disabled={busy}>
              {busy ? "Checking…" : "Enable administrator view"}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="surface filter-panel">
            <label>
              1. Select a class
              <select
                value={classKey}
                onChange={(e) => {
                  setClassKey(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">Choose a class</option>
                {classes.map((c) => (
                  <option key={JSON.stringify(c)} value={JSON.stringify(c)}>
                    {c.school_year} · Period {c.class_period} · Grade {c.grade}
                  </option>
                ))}
              </select>
            </label>
            <label>
              2. Select an activity
              <select
                disabled={!classKey}
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All quizzes & games</option>
                {activities
                  .filter((a) => a.category !== "Lesson")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Posted from
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <label>
              Through
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={bestOnly}
                onChange={(e) => {
                  setBestOnly(e.target.checked);
                  setPage(0);
                }}
              />
              Best posted score per student & activity
            </label>
            <div className="account-links">
              <button
                className="button button-outline small"
                onClick={() => setRevision((n) => n + 1)}
                disabled={fetching}
              >
                Refresh
              </button>
              <button
                className="quiet-button"
                onClick={csv}
                disabled={!posts.length || fetching}
              >
                Export this page (CSV)
              </button>
            </div>
          </section>
          <p className="microcopy">
            Dates use your local time zone. Best scores use the selected date
            range; ties favor longer attempts. Original scores are practice
            results, subject to teacher review.
          </p>
          {fetching ? (
            <p role="status">Loading submissions…</p>
          ) : !classKey ? (
            <section className="empty-state">
              <h2>
                {classes.length
                  ? "Choose a class to begin."
                  : "Ready for your first submission."}
              </h2>
              <p>Classes appear here after a student posts a score.</p>
            </section>
          ) : !posts.length ? (
            <section className="empty-state">
              <h2>No scores match these filters.</h2>
              <p>Try another activity or a wider date range.</p>
            </section>
          ) : (
            <div className="submission-list">
              {posts.map((p) => (
                <article className="surface submission" key={p.id}>
                  <div className="submission-summary">
                    <div>
                      <h2>{p.display_name}</h2>
                      <p>{p.activity}</p>
                      <small>
                        Completed {new Date(p.attempted_at).toLocaleString()}
                        <br />
                        Posted {new Date(p.posted_at).toLocaleString()}
                      </small>
                    </div>
                    <div className="submission-score">
                      <strong>
                        {Math.round((p.correct / p.total) * 100)}%
                      </strong>
                      <span>
                        {p.correct}/{p.total}
                      </span>
                    </div>
                    <span className="score-pill">
                      {p.score_reviews?.recorded
                        ? "Recorded"
                        : p.score_reviews
                          ? "Reviewed"
                          : "Needs review"}
                    </span>
                    <button
                      className="button button-outline small"
                      aria-expanded={expanded === p.id}
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                    >
                      {expanded === p.id ? "Close" : "Review"}
                    </button>
                  </div>
                  {expanded === p.id && (
                    <ReviewForm
                      post={p}
                      onSave={() => setRevision((n) => n + 1)}
                    />
                  )}
                </article>
              ))}
            </div>
          )}
          {classKey && (
            <div className="pagination">
              <button
                className="button button-outline small"
                disabled={page === 0 || fetching}
                onClick={() => setPage((n) => n - 1)}
              >
                Previous
              </button>
              <span>Page {page + 1}</span>
              <button
                className="button button-outline small"
                disabled={!hasMore || fetching}
                onClick={() => setPage((n) => n + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </main>
  );
}
