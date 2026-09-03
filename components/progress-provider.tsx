"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProgressContextValue = {
  completed: string[];
  user: User | null;
  loading: boolean;
  completeUnit: (slug: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);
const STORAGE_KEY = "statlab-completed-units";

function readLocalProgress() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const loadProgress = async () => {
      const local = readLocalProgress();
      setCompleted(local);

      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        const { data: rows } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("completed", true);
        const cloud = rows?.map((row) => row.lesson_id as string) ?? [];
        const merged = Array.from(new Set([...local, ...cloud]));
        setCompleted(merged);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      setLoading(false);
    };

    void loadProgress();
    if (!supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const completeUnit = useCallback(
    async (slug: string) => {
      const next = Array.from(new Set([...completed, slug]));
      setCompleted(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      const supabase = createClient();
      if (supabase && user) {
        await supabase.from("lesson_progress").upsert(
          {
            user_id: user.id,
            lesson_id: slug,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" },
        );
      }
    },
    [completed, user],
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ completed, user, loading, completeUnit, signOut }),
    [completed, user, loading, completeUnit, signOut],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}
