"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "./progress-provider";
export function ScoreResult({ activity }: { activity: string }) {
  const { user, profile, saveState, retrySave, bestScores } = useProgress();
  const [posted, setPosted] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const save = saveState?.activity === activity ? saveState : null;
  const best = bestScores.find((a) => a.activity === activity);
  async function post() {
    if (!save || busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Please sign in again.");
      const { error } = await supabase.rpc("post_score", {
        attempt: save.attempt.id,
      });
      if (error) throw error;
      setPosted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not post your score. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="score-save" aria-live="polite">
      {best && (
        <strong>
          Personal best: {Math.round((best.correct / best.total) * 100)}% (
          {best.correct}/{best.total})
        </strong>
      )}
      {!user ? (
        <p>
          Saved on this device. <Link href="/auth">Sign in</Link> to save future
          scores to your account and post them to your teacher.
        </p>
      ) : (
        <>
          <p>
            {save?.status === "saved"
              ? "Score saved to your account. Post it when you’re ready for your teacher to review."
              : save?.status === "error"
                ? save.message
                : "Saving your score…"}
          </p>
          {save?.status === "error" && (
            <button
              className="button button-outline"
              onClick={() => void retrySave()}
            >
              Retry saving
            </button>
          )}
          {save?.status === "saved" &&
            (profile ? (
              <button
                className="button button-accent"
                disabled={busy || posted}
                onClick={() => void post()}
              >
                {posted
                  ? "Posted to your teacher ✓"
                  : busy
                    ? "Posting…"
                    : "Post score"}
              </button>
            ) : (
              <Link className="button button-outline" href="/account">
                Add class details to post
              </Link>
            ))}
          <Link className="quiet-button" href="/progress">
            View my progress
          </Link>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </section>
  );
}
