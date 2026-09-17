"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile, schoolYear } from "@/lib/progress";
import { useProgress } from "./progress-provider";
export function ProfileForm({ profile }: { profile: Profile | null }) {
  const { user, refresh } = useProgress();
  const [name, setName] = useState(
    profile?.display_name ?? String(user?.user_metadata.display_name ?? ""),
  );
  const [grade, setGrade] = useState(profile?.grade ?? 11),
    [year, setYear] = useState(profile?.school_year ?? schoolYear()),
    [period, setPeriod] = useState(profile?.class_period ?? 1);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Sign in again.");
      const { error } = await supabase
        .from("student_profiles")
        .upsert({
          user_id: user.id,
          display_name: name.trim(),
          grade,
          school_year: year,
          class_period: period,
        });
      if (error) throw error;
      await refresh();
      setMessage("Class details saved.");
    } catch {
      setMessage(
        "Could not save class details. Check the fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="profile-form" onSubmit={submit}>
      <label>
        Full name
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <div className="field-grid">
        <label>
          Grade level
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          School year
          <input
            required
            pattern="[0-9]{4}-[0-9]{4}"
            title="Consecutive years, such as 2026-2027"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <label>
          Class period
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="microcopy">
        Your teacher sees these details only when you post a score. Changes
        apply to future posts.
      </p>
      <button disabled={busy || !name.trim()} className="button button-accent">
        {busy ? "Saving…" : "Save class details"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
