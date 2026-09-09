"use client";

import { useState } from "react";
import { vocab } from "@/lib/practice";

function shuffle(a: number[]) {
  const result = [...a];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function VocabMatch() {
  const [terms, setTerms] = useState<number[]>([]);
  const [definitions, setDefinitions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");

  function start() {
    const next = shuffle(vocab.map((_, i) => i)).slice(0, 5);
    setTerms(next);
    setDefinitions(shuffle(next));
    setMatched([]);
    setSelected(null);
    setAttempts(0);
    setFeedback("Choose a term, then its definition.");
  }

  function match(index: number) {
    if (selected === null) return;
    setAttempts(attempts + 1);
    if (index === selected) {
      setMatched([...matched, index]);
      setFeedback(matched.length === 4 ? "All five matched! Try a fresh board." : `Matched: ${vocab[index][0]}.`);
      setSelected(null);
    } else {
      setFeedback(`That definition describes ${vocab[index][0]}. Try another definition for ${vocab[selected][0]}.`);
    }
  }

  return <section className="activity-panel match-panel">
    <div className="activity-top"><span className="kicker">Match the meaning</span><span>{matched.length}/5 pairs · {attempts} attempts</span></div>
    <h2>Connect the term to the idea.</h2>
    <p>Select a term on the left, then match its definition on the right. This board is a quick, unsaved warm-up.</p>
    <button className="button button-accent" onClick={start}>{terms.length ? "New board" : "Deal five pairs"}</button>
    <p role="status">{feedback}</p>
    {!!terms.length && <div className="match-columns">
      <div>{terms.map(i => <button key={i} disabled={matched.includes(i)} aria-pressed={selected === i} className={`answer ${matched.includes(i) ? 'answer-correct' : ''}`} onClick={() => setSelected(i)}>{matched.includes(i) ? '✓ ' : ''}{vocab[i][0]}</button>)}</div>
      <div>{definitions.map(i => <button key={i} disabled={selected === null || matched.includes(i)} className={`answer ${matched.includes(i) ? 'answer-correct' : ''}`} onClick={() => match(i)}>{matched.includes(i) ? '✓ ' : ''}{vocab[i][1]}</button>)}</div>
    </div>}
  </section>;
}
