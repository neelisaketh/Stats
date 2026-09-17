"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
type Mode = "signin" | "signup" | "reset" | "link";
export function AuthForm({
  callbackError = false,
}: {
  callbackError?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(
      callbackError
        ? "That link is invalid or expired. Request a new sign-in or reset link below."
        : "",
    );
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase)
        throw new Error(
          "Accounts are not connected yet. You can still explore all activities as a guest.",
        );
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const { data: admin } = await supabase
          .from("administrators")
          .select("user_id")
          .maybeSingle();
        router.push(admin ? "/admin" : "/account");
        router.refresh();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${getSiteUrl()}auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/account");
          router.refresh();
        } else
          setMessage(
            "Check your email to confirm your account. Then add your grade, school year, and class period.",
          );
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${getSiteUrl()}auth/callback?next=/auth/reset-password`,
        });
        if (error) throw error;
        setMessage(
          "If this email has an account, you’ll receive a password reset link. Open it in this browser.",
        );
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${getSiteUrl()}auth/callback` },
        });
        if (error) throw error;
        setMessage(
          "Check your email for a sign-in link. Open it in this browser.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    signin: "Welcome back.",
    signup: "Start your learning journey.",
    reset: "Reset your password.",
    link: "Sign in with a link.",
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="back-link" href="/">
          ← Back to Statwise
        </Link>
        <span className="kicker">Your learning, saved</span>
        <h1>{titles[mode]}</h1>
        <p className="auth-copy">
          Save your best scores and share your progress with your teacher.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {(mode === "signin" || mode === "signup") && (
            <>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={mode === "signup" ? 8 : 1}
                maxLength={128}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && (
                <p className="microcopy">
                  At least 8 characters. Next, you’ll enter your class details.
                </p>
              )}
            </>
          )}
          <button
            className="button button-accent"
            disabled={busy || !isSupabaseConfigured}
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Send sign-in link"}
          </button>
        </form>
        {message && (
          <p className="status-message" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-options">
          {(
            [
              ["signin", "Sign in"],
              ["signup", "Create account"],
              ["reset", "Forgot password?"],
              ["link", "Use an email link"],
            ] as const
          )
            .filter(([m]) => m !== mode)
            .map(([m, label]) => (
              <button
                disabled={busy}
                key={m}
                className="quiet-button"
                onClick={() => {
                  setMode(m);
                  setMessage("");
                  setError("");
                  setPassword("");
                }}
              >
                {label}
              </button>
            ))}
        </div>
        <Link className="back-link" href="/learn">
          Continue as a guest →
        </Link>
        {!isSupabaseConfigured && (
          <p className="setup-note">
            Accounts are not connected yet. Guest activities are available.
          </p>
        )}
      </section>
      <aside className="auth-aside">
        <span className="kicker">Small steps. Clear understanding.</span>
        <h2>
          Make progress
          <br />
          one idea at a time.
        </h2>
        <p>
          Learn the concepts. Practice with feedback.
          <br />
          See how far you’ve come.
        </p>
      </aside>
    </main>
  );
}
