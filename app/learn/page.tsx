import type { Metadata } from "next";
import { ArrowRight, BookOpen, Clock3, Target } from "lucide-react";
import { CourseRoadmap } from "@/components/course-roadmap";
import { totalLessonCount } from "@/lib/course";

export const metadata: Metadata = {
  title: "AP Statistics Course | Statlab",
  description: "Eight focused units covering the full AP Statistics course.",
};

export default function LearnPage() {
  return (
    <main>
      <section className="course-hero page-shell">
        <div>
          <span className="kicker kicker-light">AP Statistics · Complete course</span>
          <h1>Learn the idea.<br />Then use it.</h1>
          <p>Eight focused units move from describing data to statistical inference. Each one includes a worked example, a common trap, and a checkpoint.</p>
        </div>
        <div className="course-stats">
          <div><BookOpen size={20} /><strong>{totalLessonCount}</strong><span>short lessons</span></div>
          <div><Clock3 size={20} /><strong>7.5 hr</strong><span>total study time</span></div>
          <div><Target size={20} /><strong>8</strong><span>unit checkpoints</span></div>
        </div>
      </section>

      <section className="page-shell course-list-section">
        <div className="section-heading">
          <div><span className="kicker">Course map</span><h2>Eight units, one connected story</h2></div>
          <p>Start at Unit 1 or jump directly to the topic you need today.</p>
        </div>
        <CourseRoadmap />
        <a className="reference-promo" href="/reference">
          <div><span>Not sure which procedure to use?</span><strong>Open the inference test guide.</strong></div>
          <ArrowRight size={20} />
        </a>
      </section>
    </main>
  );
}
