import type { Metadata } from "next";
import { ArrowDown, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Inference Test Guide | Statlab",
  description: "Choose the right AP Statistics inference procedure from the variables and study design.",
};

const rows = [
  ["One proportion", "1 categorical variable · 1 sample", "1-proportion z interval/test", "Random · 10% · large counts"],
  ["Two proportions", "1 categorical variable · 2 groups", "2-proportion z interval/test", "Random · 10% · large counts in both groups"],
  ["One mean", "1 quantitative variable · 1 sample", "1-sample t interval/test", "Random · 10% · Normal or large n"],
  ["Paired means", "Quantitative differences · matched pairs", "Paired t interval/test", "Check conditions on the differences"],
  ["Two means", "1 quantitative variable · 2 independent groups", "2-sample t interval/test", "Random · 10% · Normal or large n in each"],
  ["One categorical distribution", "Counts across 3+ categories", "χ² goodness-of-fit test", "Random · 10% · all expected counts ≥ 5"],
  ["Two categorical variables", "Counts in a two-way table", "χ² independence/homogeneity test", "Random · 10% · all expected counts ≥ 5"],
  ["Linear relationship", "2 quantitative variables", "Linear regression t interval/test", "Linear · independent · Normal · equal variance"],
];

export default function ReferencePage() {
  return (
    <main>
      <section className="reference-hero page-shell">
        <span className="kicker kicker-light">Inference test guide</span>
        <h1>Choose from the structure,<br />not from a keyword.</h1>
        <p>Identify the response variable, the number of groups, and whether the data are paired. The correct procedure usually follows.</p>
        <a href="#guide" className="button button-light">Open the guide <ArrowDown size={17} /></a>
      </section>
      <section id="guide" className="guide-section page-shell">
        <div className="section-heading">
          <div><span className="kicker">Procedure map</span><h2>What kind of data do you have?</h2></div>
          <p>“Interval/test” means choose an interval to estimate and a test to evaluate a claim.</p>
        </div>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead><tr><th>Target</th><th>Data structure</th><th>Procedure</th><th>Conditions</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 && <CheckCircle2 size={16} />}{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="four-step-card">
          <div><span>1</span><strong>State</strong><p>Name the parameter and hypotheses or confidence level.</p></div>
          <div><span>2</span><strong>Plan</strong><p>Name the procedure and check every condition in context.</p></div>
          <div><span>3</span><strong>Do</strong><p>Show the statistic, standard error, test statistic, and result.</p></div>
          <div><span>4</span><strong>Conclude</strong><p>Answer the original question with context and uncertainty.</p></div>
        </div>
      </section>
    </main>
  );
}
