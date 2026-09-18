"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { normalCdf } from "@/lib/stats";
import { NormalCurve } from "./normal-curve";
import { useProgress } from "./progress-provider";

import { Plinko } from "./plinko";
export function NormalLesson(){const[count,setCount]=useState(0),[lower,setLower]=useState(-1),[upper,setUpper]=useState(1);const{completeUnit}=useProgress();
  const area=normalCdf(upper)-normalCdf(lower);
  return <main className="lesson-page"><section className="lesson-intro wrap"><span className="kicker">Interactive lesson · 8 minutes</span><h1>Why does the normal curve keep appearing?</h1><p>It begins when many small, independent chances add together. Build the shape, then measure it.</p><div className="lesson-progress"><span className={count>0?"done":""}>1</span><i/><span className={count>=600?"done":""}>2</span><i/><span>3</span></div></section>
  <section className="lesson-block plinko-section"><div className="wrap lesson-grid"><div><span className="step-number">01</span><h2>Let randomness pile up.</h2><p>By default, each peg gives a ball a 50% chance of turning right. Adjust the controls to explore biased paths. Most paths contain a mix of left and right turns, so balls collect near the center. All-left or all-right paths are rare.</p><div className="lesson-note"><strong>The hidden math</strong><span>Each landing position follows a binomial distribution. With enough rows, its outline approaches a normal curve.</span></div></div><Plinko onCount={setCount}/></div></section>
  <section className="lesson-block curve-section"><div className="wrap lesson-grid reverse"><div className="curve-lesson-card"><NormalCurve lower={lower} upper={upper} interactive onLower={setLower} onUpper={setUpper}/><div className="equation-card"><span>Standardize</span><strong>z = (x − μ) / σ</strong><span>Area</span><strong>P({lower.toFixed(1)} &lt; Z &lt; {upper.toFixed(1)}) = {(area).toFixed(4)}</strong></div></div><div><span className="step-number">02</span><h2>Area is probability.</h2><p>The total area under a density curve is 1. Choose two z-score bounds; the shaded area is the proportion of observations expected between them.</p><ul className="rule-list"><li><strong>68%</strong><span>within 1 standard deviation</span></li><li><strong>95%</strong><span>within 2 standard deviations</span></li><li><strong>99.7%</strong><span>within 3 standard deviations</span></li></ul></div></div></section>
  <section className="lesson-finish wrap"><div><span className="step-number">03</span><h2>Turn the picture into a skill.</h2><p>Practice moving between raw values, z-scores, and areas. The graph stays beside you.</p></div><Link className="button button-accent" href="/normal/quiz" onClick={()=>void completeUnit("normal-curves")}>Practice normal curves <ArrowRight size={18}/></Link></section></main>;
}
