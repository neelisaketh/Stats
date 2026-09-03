"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase has not been connected yet. Add the environment variables in the setup guide.");
      return;
    }

    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${getSiteUrl()}auth/callback` },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="back-link" href="/"><ArrowLeft size={16} /> Back to Statlab</Link>
        <div className="auth-icon"><Mail size={23} /></div>
        <span className="kicker">Keep your place</span>
        <h1>{status === "sent" ? "Check your inbox" : "Sign in with email"}</h1>
        {status === "sent" ? (
          <div className="sent-message">
            <p>We sent a secure sign-in link to <strong>{email}</strong>.</p>
            <p>You can close this tab after opening the link.</p>
            <button className="text-button" type="button" onClick={() => setStatus("idle")}>Use a different email</button>
          </div>
        ) : (
          <>
            <p className="auth-copy">No password to remember. We’ll email you a one-time link and sync your course progress.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" />
              <button className="button button-accent" type="submit" disabled={status === "sending" || !email}>
                {status === "sending" ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
            {status === "error" && <p className="form-error" role="alert">{message}</p>}
            {!isSupabaseConfigured && <p className="setup-note">Guest progress still works locally. Connect Supabase when you’re ready to add accounts.</p>}
          </>
        )}
      </section>
      <aside className="auth-aside">
        <div className="mini-distribution" aria-hidden="true">
          {[25, 48, 72, 96, 74, 50, 28].map((height, index) => <span key={index} style={{ height }} />)}
        </div>
        <blockquote>“The goal is not to memorize a test. It’s to recognize the structure hiding inside the question.”</blockquote>
      </aside>
    </main>
  );
}
