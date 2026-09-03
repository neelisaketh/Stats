"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { Checkpoint as CheckpointType } from "@/lib/course";

export function Checkpoint({ data }: { data: CheckpointType }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === data.answer;

  return (
    <section className="checkpoint">
      <span className="kicker">Checkpoint</span>
      <h2>{data.question}</h2>
      <div className="choice-list">
        {data.choices.map((choice, index) => (
          <button
            type="button"
            key={choice}
            className={`choice ${selected === index ? "selected" : ""} ${submitted && index === data.answer ? "correct" : ""}`}
            onClick={() => !submitted && setSelected(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {choice}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button className="button button-dark" type="button" disabled={selected === null} onClick={() => setSubmitted(true)}>
          Check answer
        </button>
      ) : (
        <div className={correct ? "feedback feedback-correct" : "feedback feedback-wrong"}>
          <span className="feedback-icon">{correct ? <Check size={18} /> : <X size={18} />}</span>
          <div><strong>{correct ? "Exactly." : "Not quite."}</strong><p>{data.explanation}</p></div>
          <button type="button" aria-label="Try again" onClick={() => { setSelected(null); setSubmitted(false); }}><RotateCcw size={17} /></button>
        </div>
      )}
    </section>
  );
}
