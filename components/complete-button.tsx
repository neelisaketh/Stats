"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useProgress } from "./progress-provider";

export function CompleteButton({ slug, nextSlug }: { slug: string; nextSlug?: string }) {
  const { completed, completeUnit, user } = useProgress();
  const done = completed.includes(slug);

  return (
    <div className="complete-panel">
      <div>
        <span className="kicker">Your progress</span>
        <h2>{done ? "Unit complete" : "Finish this unit"}</h2>
        <p>{user ? "Your result is synced to your account." : "Progress is saved on this device. Sign in to sync it everywhere."}</p>
      </div>
      {done ? (
        nextSlug ? <Link className="button button-light" href={`/learn/${nextSlug}`}>Next unit <ArrowRight size={17} /></Link> : <Link className="button button-light" href="/reference">Open test guide <ArrowRight size={17} /></Link>
      ) : (
        <button className="button button-light" type="button" onClick={() => void completeUnit(slug)}><Check size={17} /> Mark complete</button>
      )}
    </div>
  );
}
