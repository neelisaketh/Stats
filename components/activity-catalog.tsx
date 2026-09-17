"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Gamepad2, PenLine } from "lucide-react";
import { activities, sections } from "@/lib/activities";
import { useProgress } from "./progress-provider";
export function ActivityCatalog({
  section,
}: {
  section: keyof typeof sections;
}) {
  const { bestScores, completed } = useProgress();
  return (
    <main className="activity-page wrap">
      <div className="catalog-heading">
        <span className="kicker">
          AP Statistics /{" "}
          {section === "normal" ? "Normal distributions" : section}
        </span>
        <h1>{sections[section].title}</h1>
        <p>{sections[section].description}</p>
      </div>
      <div className="catalog-grid">
        {activities
          .filter((a) => a.sections.includes(section))
          .map((a) => {
            const best = bestScores.find((b) => b.activity === a.id);
            const Icon =
              a.category === "Lesson"
                ? BookOpen
                : a.category === "Game"
                  ? Gamepad2
                  : PenLine;
            return (
              <Link href={a.href} key={a.id} className="catalog-card">
                <span className="catalog-icon">
                  <Icon size={24} />
                </span>
                <span className="kicker">{a.category}</span>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <span className="catalog-detail">{a.detail}</span>
                <div className="catalog-footer">
                  <span>
                    {best
                      ? `Best: ${Math.round((best.correct / best.total) * 100)}%`
                      : a.category === "Lesson" &&
                          completed.includes("normal-curves")
                        ? "Completed ✓"
                        : "Start learning"}
                  </span>
                  <ArrowRight size={19} />
                </div>
              </Link>
            );
          })}
      </div>
      <p className="catalog-note">
        Your next step is up to you. All activities are available without
        signing in.
      </p>
    </main>
  );
}
