import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, Sigma, Sparkles } from "lucide-react";
import { CourseRoadmap } from "@/components/course-roadmap";
import { NormalLab } from "@/components/normal-lab";

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <span className="hero-label"><Sparkles size={15} /> AP Statistics, made visual</span>
            <h1>Don’t memorize<br /><em>the pattern.</em><br />See it.</h1>
            <p>Short lessons, worked examples, and interactive models that connect formulas to what the data is actually doing.</p>
            <div className="hero-actions">
              <Link className="button button-accent" href="/learn/exploring-data">Start Unit 1 <ArrowRight size={17} /></Link>
              <Link className="text-link-light" href="/learn">View course map <span>↗</span></Link>
            </div>
          </div>

          <div className="hero-visual" aria-label="Sampling distribution illustration">
            <div className="visual-note note-one"><span>n ↑</span><b>SE ↓</b></div>
            <div className="visual-note note-two"><span>center</span><b>μ</b></div>
            <svg viewBox="0 0 640 460" role="img" aria-label="Three increasingly narrow sampling distributions">
              <line x1="30" y1="405" x2="610" y2="405" className="hero-axis" />
              <path d="M45 405 C92 404 112 330 170 330 C228 330 250 404 300 405" className="hero-curve curve-a" />
              <path d="M178 405 C238 404 248 210 320 210 C392 210 402 404 462 405" className="hero-curve curve-b" />
              <path d="M335 405 C405 404 414 72 490 72 C566 72 574 404 610 405" className="hero-curve curve-c" />
              <line x1="490" y1="53" x2="490" y2="420" className="hero-mean" />
              <circle cx="490" cy="72" r="7" className="hero-dot" />
              <text x="75" y="440">n = 10</text>
              <text x="273" y="440">n = 40</text>
              <text x="463" y="440">n = 160</text>
            </svg>
            <div className="visual-caption"><span>Sampling distributions</span><strong>Larger samples make estimates more precise.</strong></div>
          </div>
        </div>
      </section>

      <section className="quick-strip">
        <div className="page-shell quick-grid">
          <div><BookOpenCheck size={22} /><span><strong>8 focused units</strong>Full AP Statistics sequence</span></div>
          <div><ChartNoAxesCombined size={22} /><span><strong>Interactive models</strong>Change values, see results</span></div>
          <div><Sigma size={22} /><span><strong>Test-day language</strong>Conditions and conclusions</span></div>
        </div>
      </section>

      <section className="home-course page-shell">
        <div className="section-heading">
          <div><span className="kicker">Course map</span><h2>Build the whole picture</h2></div>
          <div><p>Each unit connects an idea, a procedure, and the language you need to explain your result.</p><Link href="/learn">All eight units <ArrowRight size={16} /></Link></div>
        </div>
        <CourseRoadmap compact />
      </section>

      <section className="home-lab page-shell">
        <div className="section-heading lab-section-heading">
          <div><span className="kicker">Learn by changing</span><h2>Make probability move</h2></div>
          <p>A Normal probability is area. Adjust the mean, spread, and bounds to see it—not just calculate it.</p>
        </div>
        <NormalLab condensed />
      </section>

      <section className="home-cta page-shell">
        <div>
          <span className="kicker kicker-light">Ready when you are</span>
          <h2>Start with the data in front of you.</h2>
        </div>
        <Link className="button button-light" href="/learn/exploring-data">Begin Unit 1 <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
