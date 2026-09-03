"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { courseUnits } from "@/lib/course";
import { useProgress } from "./progress-provider";

export function CourseRoadmap({ compact = false }: { compact?: boolean }) {
  const { completed } = useProgress();
  const units = compact ? courseUnits.slice(0, 4) : courseUnits;

  return (
    <div className="roadmap-grid">
      {units.map((unit) => {
        const done = completed.includes(unit.slug);
        return (
          <Link
            key={unit.slug}
            href={`/learn/${unit.slug}`}
            className="unit-card"
            style={{ "--unit-color": unit.color } as React.CSSProperties}
          >
            <span className="unit-number">{done ? <Check size={15} /> : String(unit.unit).padStart(2, "0")}</span>
            <div>
              <span className="unit-eyebrow">{unit.eyebrow}</span>
              <h3>{unit.title}</h3>
              <p>{unit.description}</p>
            </div>
            <ArrowUpRight className="unit-arrow" size={20} />
          </Link>
        );
      })}
    </div>
  );
}
