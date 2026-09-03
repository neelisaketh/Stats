import type { Metadata } from "next";
import { NormalLab } from "@/components/normal-lab";

export const metadata: Metadata = {
  title: "Normal Distribution Lab | Statlab",
  description: "Change the mean, spread, and bounds to see Normal probabilities update live.",
};

export default function LabPage() {
  return (
    <main className="lab-page page-shell">
      <header className="page-intro">
        <span className="kicker">Explore a model</span>
        <h1>Move the numbers.<br />Watch the area respond.</h1>
        <p>A Normal probability is an area under the curve. Change μ, σ, and the interval to make that relationship visible.</p>
      </header>
      <NormalLab />
      <section className="lab-notes">
        <div><span>01</span><h2>Moving μ</h2><p>Changes the center without changing the shape. Every x-value shifts by the same amount.</p></div>
        <div><span>02</span><h2>Growing σ</h2><p>Spreads probability over a wider range, lowering and flattening the curve.</p></div>
        <div><span>03</span><h2>Changing bounds</h2><p>Changes the shaded event. The full area under any density curve is always 1.</p></div>
      </section>
    </main>
  );
}
