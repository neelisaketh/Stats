"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/components/progress-provider";
export default function ResetPassword() {
  const { user, loading } = useProgress();
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("The passwords don’t match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Accounts are unavailable.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setPassword("");
      setConfirm("");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not update your password.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="activity-page wrap narrow">
      <section className="surface">
        <h1 className="page-title">Choose a new password.</h1>
        {loading ? (
          <p>Checking your reset link…</p>
        ) : done ? (
          <>
            <p role="status">Your password has been updated.</p>
            <Link className="button button-accent" href="/account">
              Continue to your account
            </Link>
          </>
        ) : !user ? (
          <>
            <p>Open a fresh reset link from your email to continue.</p>
            <Link className="button button-accent" href="/auth">
              Request a reset link
            </Link>
          </>
        ) : (
          <form className="profile-form" onSubmit={submit}>
            <label>
              New password
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            <button className="button button-accent" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
