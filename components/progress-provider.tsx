"use client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { Attempt, bestAttempts, Profile } from "@/lib/progress";

type SaveState = {
  activity: string;
  status: "saving" | "saved" | "local" | "error";
  attempt: Attempt;
  message?: string;
} | null;
type ProgressContextValue = {
  completed: string[];
  seenQuestions: string[];
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  bestScores: Attempt[];
  recentAttempts: Attempt[];
  error: string;
  saveState: SaveState;
  refresh: () => Promise<void>;
  retrySave: () => Promise<void>;
  completeUnit: (slug: string) => Promise<void>;
  recordQuestion: (questionId: string, correct: boolean) => Promise<void>;
  recordActivity: (
    activity: string,
    correct: number,
    total: number,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};
const Context = createContext<ProgressContextValue | null>(null);
function read<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return Array.isArray(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Cloud saving remains available if device storage is full. */
  }
}
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]),
    [seenQuestions, setSeenQuestions] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null),
    [isAdmin, setIsAdmin] = useState(false);
  const [bestScores, setBestScores] = useState<Attempt[]>([]),
    [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState(""),
    [saveState, setSaveState] = useState<SaveState>(null);
  const identity = useRef<string | null>(null),
    generation = useRef(0),
    pendingSave = useRef<Attempt | null>(null);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    const supabase = createClient();
    const current = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (request !== generation.current) return;
    const changed = identity.current !== (current?.id ?? null);
    identity.current = current?.id ?? null;
    setUser(current);
    setError("");
    if (changed) {
      setCompleted([]);
      setSeenQuestions([]);
      setProfile(null);
      setIsAdmin(false);
      setBestScores([]);
      setRecentAttempts([]);
      setSaveState(null);
      pendingSave.current = null;
    }
    if (!supabase || !current) {
      setCompleted(read("statlab-completed-units", []));
      setSeenQuestions(read("statwise-seen-questions", []));
      const attempts = read<Attempt[]>("statwise-guest-attempts", []);
      setRecentAttempts(attempts.slice(0, 50));
      setBestScores(bestAttempts(attempts));
      setLoading(false);
      return;
    }
    const responses = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", current.id)
        .eq("completed", true),
      supabase
        .from("question_progress")
        .select("question_id")
        .eq("user_id", current.id)
        .limit(1000),
      supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", current.id)
        .maybeSingle(),
      supabase
        .from("administrators")
        .select("user_id")
        .eq("user_id", current.id)
        .maybeSingle(),
      supabase.rpc("my_best_scores"),
      supabase
        .from("practice_attempts")
        .select("*")
        .eq("user_id", current.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (request !== generation.current || identity.current !== current.id)
      return;
    const [lessons, questions, profileResult, admin, best, attempts] =
      responses;
    setCompleted(lessons.data?.map((r) => r.lesson_id) ?? []);
    setSeenQuestions(questions.data?.map((r) => r.question_id) ?? []);
    setProfile(profileResult.data);
    setIsAdmin(Boolean(admin.data));
    setBestScores(best.data ?? []);
    setRecentAttempts(attempts.data ?? []);
    if (responses.some((r) => r.error))
      setError(
        "Some account data could not load. Please retry; if this continues, contact your teacher.",
      );
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    const run = () =>
      void refresh().catch(() => {
        if (active) {
          setError("Could not connect. Please try again.");
          setLoading(false);
        }
      });
    run();
    const supabase = createClient();
    const listener = supabase?.auth.onAuthStateChange((event, session) => {
      // Clear the previous account immediately; defer queries outside the auth callback.
      if ((session?.user.id ?? null) !== identity.current) {
        ++generation.current;
        identity.current = session?.user.id ?? null;
        setUser(session?.user ?? null);
        setProfile(null);
        setIsAdmin(false);
        setCompleted([]);
        setSeenQuestions([]);
        setBestScores([]);
        setRecentAttempts([]);
        setSaveState(null);
        pendingSave.current = null;
        setLoading(true);
      }
      if (event === "PASSWORD_RECOVERY") router.replace("/auth/reset-password");
      else
        window.setTimeout(() => {
          if (active) run();
        }, 0);
    });
    return () => {
      active = false;
      listener?.data.subscription.unsubscribe();
    };
  }, [refresh, router]);
  const completeUnit = async (slug: string) => {
    const next = Array.from(new Set([...completed, slug]));
    setCompleted(next);
    const supabase = createClient();
    if (!user || !supabase) write("statlab-completed-units", next);
    else {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: slug,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" },
        );
      if (error)
        setError(
          "Lesson progress could not sync. Please mark the lesson complete again.",
        );
    }
  };
  const recordQuestion = async (questionId: string, correct: boolean) => {
    setSeenQuestions((old) => {
      const next = Array.from(new Set([...old, questionId]));
      if (!user) write("statwise-seen-questions", next);
      return next;
    });
    const supabase = createClient();
    if (supabase && user) {
      const { error } = await supabase
        .from("question_progress")
        .upsert(
          {
            user_id: user.id,
            question_id: questionId,
            correct,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "user_id,question_id" },
        );
      if (error)
        setError(
          "Question progress could not sync. Your session can continue.",
        );
    }
  };
  const saveAttempt = async (attempt: Attempt) => {
    const owner = attempt.user_id;
    if (owner !== identity.current) return;
    setSaveState({ activity: attempt.activity, status: "saving", attempt });
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Not connected");
      // Reuse the UUID when retrying a request whose response may have been lost.
      const { created_at: _timestamp, ...payload } = attempt;
      void _timestamp;
      const { data, error } = await supabase
        .from("practice_attempts")
        .insert(payload)
        .select()
        .single();
      let saved = data;
      if (error?.code === "23505") {
        const result = await supabase
          .from("practice_attempts")
          .select("*")
          .eq("id", attempt.id)
          .single();
        if (result.error) throw result.error;
        saved = result.data;
      } else if (error) throw error;
      if (identity.current !== owner) return;
      pendingSave.current = null;
      setSaveState({
        activity: attempt.activity,
        status: "saved",
        attempt: saved,
      });
      setBestScores((old) => bestAttempts([saved, ...old]));
      setRecentAttempts((old) =>
        [saved, ...old.filter((a) => a.id !== saved.id)].slice(0, 50),
      );
    } catch {
      if (identity.current === owner)
        setSaveState({
          activity: attempt.activity,
          status: "error",
          attempt,
          message:
            "Your score has not synced yet. Retry before leaving this page.",
        });
    }
  };
  const recordActivity = async (
    activity: string,
    correct: number,
    total: number,
  ) => {
    if (
      !Number.isInteger(total) ||
      total < 1 ||
      total > 1000 ||
      !Number.isInteger(correct) ||
      correct < 0 ||
      correct > total
    )
      return;
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      activity,
      correct,
      total,
      created_at: new Date().toISOString(),
      ...(user ? { user_id: user.id } : {}),
    };
    if (!user) {
      const rows = [attempt, ...read<Attempt[]>("statwise-guest-attempts", [])];
      write("statwise-guest-attempts", rows);
      setBestScores(bestAttempts(rows));
      setRecentAttempts(rows.slice(0, 50));
      setSaveState({ activity, status: "local", attempt });
      return;
    }
    pendingSave.current = attempt;
    await saveAttempt(attempt);
  };
  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError("Could not sign out. Please retry.");
        return;
      }
    }
    await refresh();
  };
  return (
    <Context.Provider
      value={{
        completed,
        seenQuestions,
        user,
        loading,
        profile,
        isAdmin,
        bestScores,
        recentAttempts,
        error,
        saveState,
        refresh,
        completeUnit,
        recordQuestion,
        recordActivity,
        signOut,
        retrySave: async () => {
          if (pendingSave.current) await saveAttempt(pendingSave.current);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("ProgressProvider is required");
  return value;
}
