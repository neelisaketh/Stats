import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Lightbulb, TriangleAlert } from "lucide-react";
import { Checkpoint } from "@/components/checkpoint";
import { CompleteButton } from "@/components/complete-button";
import { courseUnits, getUnit } from "@/lib/course";

export function generateStaticParams() {
  return courseUnits.map((unit) => ({ slug: unit.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const unit = getUnit((await params).slug);
  if (!unit) return {};
  return { title: `${unit.title} | Statlab`, description: unit.description };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const unit = getUnit((await params).slug);
  if (!unit) notFound();
  const nextUnit = courseUnits[unit.unit];

  return (
    <main>
      <article>
        <header className="unit-hero page-shell" style={{ "--unit-color": unit.color } as React.CSSProperties}>
          <Link className="back-link back-link-light" href="/learn"><ArrowLeft size={16} /> All units</Link>
          <div className="unit-hero-grid">
            <div>
              <span className="unit-index">Unit {String(unit.unit).padStart(2, "0")}</span>
              <span className="kicker kicker-light">{unit.eyebrow}</span>
              <h1>{unit.title}</h1>
              <p>{unit.description}</p>
              <span className="unit-duration"><Clock3 size={16} /> {unit.time}</span>
            </div>
            <div className="formula-card">
              <span>{unit.formulaLabel}</span>
              <strong>{unit.formula}</strong>
            </div>
          </div>
        </header>

        <div className="lesson-shell page-shell">
          <aside className="lesson-outline">
            <span>In this unit</span>
            <ol>{unit.lessons.map((lesson, index) => <li key={lesson}><b>{index + 1}</b>{lesson}</li>)}</ol>
          </aside>

          <div className="lesson-content">
            <section className="objectives">
              <span className="kicker">The big idea</span>
              <h2>What you need to know</h2>
              <ul>{unit.objectives.map((objective) => <li key={objective}><span><Lightbulb size={17} /></span>{objective}</li>)}</ul>
            </section>

            <section className="worked-example">
              <span className="kicker">Worked example</span>
              <h2>{unit.example.prompt}</h2>
              <div className="example-steps">
                {unit.example.steps.map((step, index) => (
                  <div key={step.label}><span>{index + 1}</span><div><strong>{step.label}</strong><p>{step.text}</p></div></div>
                ))}
              </div>
              <div className="conclusion"><span>Conclusion</span><p>{unit.example.conclusion}</p></div>
            </section>

            <aside className="common-trap">
              <TriangleAlert size={22} />
              <div><strong>Common trap</strong><p>{unit.trap}</p></div>
            </aside>

            <Checkpoint data={unit.checkpoint} />
            <CompleteButton slug={unit.slug} nextSlug={nextUnit?.slug} />
          </div>
        </div>
      </article>
    </main>
  );
}
