"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { createClient } from "@/lib/supabase/client";
import { Attempt, ScorePost } from "@/lib/progress";
export default function ProgressPage() {
  const {
    user,
    loading,
    profile,
    bestScores,
    recentAttempts,
    completed,
    error,
    refresh,
  } = useProgress();
  const [posts, setPosts] = useState<ScorePost[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const load = () => {
      setPosts([]);
      if (!user) return;
      const ids = [
        ...new Set([...bestScores, ...recentAttempts].map((a) => a.id)),
      ];
      if (!ids.length) return;
      const supabase = createClient();
      if (!supabase) return;
      void supabase
        .from("score_posts")
        .select("*,score_reviews(*)")
        .in("attempt_id", ids)
        .then(({ data, error }) => {
          if (!active) return;
          if (error)
            setMessage("Could not load submission status. Try refreshing.");
          else setPosts((data ?? []) as ScorePost[]);
        });
    };
    load();
    return () => {
      active = false;
    };
  }, [user, bestScores, recentAttempts, revision]);
  async function post(id: string) {
    setBusy(id);
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error();
      const { error } = await supabase.rpc("post_score", { attempt: id });
      if (error) throw error;
      setMessage("Score posted to your teacher.");
      setRevision((n) => n + 1);
    } catch {
      setMessage(
        "Could not post your score. Check your class details and try again.",
      );
    } finally {
      setBusy(null);
    }
  }
  const action = (a: Attempt) => {
    const posted = posts.find((p) => p.attempt_id === a.id);
    return posted ? (
      <span className="posted-label">
        Posted ✓
        {posted.score_reviews && (
          <span className="review-note">
            {posted.score_reviews.grade !== null
              ? `Grade: ${posted.score_reviews.grade}% · `
              : ""}
            {posted.score_reviews.recorded ? "Recorded · " : ""}
            {posted.score_reviews.feedback || "Reviewed"}
          </span>
        )}
      </span>
    ) : user ? (
      profile ? (
        <button
          className="button button-outline small"
          disabled={busy !== null}
          onClick={() => void post(a.id)}
        >
          {busy === a.id ? "Posting…" : "Post score"}
        </button>
      ) : (
        <Link href="/account" className="quiet-button">
          Add class details
        </Link>
      )
    ) : (
      <span>On this device</span>
    );
  };
  return (
    <main className="activity-page wrap">
      <div className="catalog-heading">
        <span className="kicker">My progress</span>
        <h1>Keep building on your best.</h1>
        <p>
          {user
            ? "Scores save automatically. Only scores you post are shared with your teacher."
            : "Guest scores stay on this device. Sign in to save future scores across devices."}
        </p>
      </div>
      {loading ? (
        <p role="status">Loading progress…</p>
      ) : (
        <>
          {error && (
            <p className="form-error" role="alert">
              {error}{" "}
              <button onClick={() => void refresh()} className="quiet-button">
                Retry
              </button>
            </p>
          )}
          {!user && (
            <Link className="button button-accent" href="/auth">
              Sign in to save progress
            </Link>
          )}
          <div className="section-title-row progress-title">
            <h2>Personal bests</h2>
            <span>{completed.length} lessons completed</span>
          </div>
          <div className="catalog-grid">
            {bestScores.map((a) => (
              <section className="catalog-card" key={a.id}>
                <span className="kicker">Personal best</span>
                <h2>{a.activity}</h2>
                <strong className="large-score">
                  {Math.round((a.correct / a.total) * 100)}%
                </strong>
                <p>
                  {a.correct}/{a.total} ·{" "}
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
                {action(a)}
              </section>
            ))}
          </div>
          {!bestScores.length && (
            <section className="empty-state">
              <h2>Your first score starts here.</h2>
              <p>Complete a quiz or game to see your best score.</p>
              <Link className="button button-accent" href="/practice">
                Choose an activity
              </Link>
            </section>
          )}
          <div className="section-title-row progress-title">
            <h2>Recent attempts</h2>
            <span>Latest 50 · All-time bests above</span>
          </div>
          {message && (
            <p role="status" className="status-message">
              {message}
            </p>
          )}
          {recentAttempts.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Score</th>
                    <th>Completed</th>
                    <th>Teacher review</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.activity}</td>
                      <td>
                        {Math.round((a.correct / a.total) * 100)}%{" "}
                        <small>
                          ({a.correct}/{a.total})
                        </small>
                      </td>
                      <td>{new Date(a.created_at).toLocaleString()}</td>
                      <td>{action(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
