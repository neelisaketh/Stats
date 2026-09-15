import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Gamepad2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="kicker">AP Statistics, made visual</span>
          <h1>“Without data, you’re just another person with an opinion.”</h1>
          <p>Build intuition first. Then practice until the method feels automatic.</p>
          <div className="hero-actions">
            <Link className="button button-accent" href="/practice">Start practicing <ArrowRight size={18} /></Link>
            <Link className="button button-outline" href="/learn">Explore the lesson</Link>
          </div>
        </div>
        <div className="hero-visual" aria-label="A dot plot settling into a bell curve">
          <div className="axis-label axis-left">less likely</div>
          <div className="bell-bars" aria-hidden="true">
            {[18, 28, 42, 62, 88, 116, 146, 166, 146, 116, 88, 62, 42, 28, 18].map((height, i) => (
              <span key={i} style={{ height }}><i /></span>
            ))}
          </div>
          <div className="axis-line"><span>−3σ</span><span>mean</span><span>+3σ</span></div>
          <div className="quote-credit">— commonly attributed to W. Edwards Deming</div>
        </div>
      </section>

      <section className="path-section">
        <div className="wrap">
          <div className="section-title-row">
            <div><span className="kicker">Choose your path</span><h2>Learn it. Test it. Play it.</h2></div>
            <p>One focused activity in each mode—designed to work together.</p>
          </div>
          <div className="feature-grid">
            <Link className="feature-card navy" href="/practice">
              <span className="feature-icon"><Brain /></span><span className="feature-number">01</span>
              <h3>Inference Test Lab</h3><p>Choose among 10 procedures and practice identification, calculations, and conclusions.</p>
              <span className="card-link">1,000 original problems <ArrowRight size={17} /></span>
            </Link>
            <Link className="feature-card blue" href="/normal">
              <span className="feature-icon"><BarChart3 /></span><span className="feature-number">02</span>
              <h3>Normal Curve Quiz</h3><p>Find z-scores and areas, then drag curve bounds to prove you can see the answer.</p>
              <span className="card-link">Open quiz <ArrowRight size={17} /></span>
            </Link>
            <Link className="feature-card coral" href="/games">
              <span className="feature-icon"><Gamepad2 /></span><span className="feature-number">03</span>
              <h3>Notation Match</h3><p>Pair symbols with their meanings in a fast concentration game.</p>
              <span className="card-link">Play a round <ArrowRight size={17} /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="lesson-callout wrap">
        <div className="lesson-orbit" aria-hidden="true"><Sparkles size={28} /><span>μ</span><span>σ</span><span>z</span></div>
        <div><span className="kicker">Interactive lesson</span><h2>Watch randomness become a normal curve.</h2><p>Drop hundreds of balls through a Plinko board, explore z-score bounds, and see the probability equation update live.</p></div>
        <Link className="button button-dark" href="/learn">Begin normal curves <ArrowRight size={18} /></Link>
      </section>
    </main>
  );
}
