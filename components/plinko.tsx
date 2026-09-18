"use client";

import { useEffect, useRef, useState } from "react";

type Ball = { path: number[]; age: number; id: number };
export function Plinko({ onCount }: { onCount: (n: number) => void }) {
  const [rows, setRows] = useState(12);
  const [probability, setProbability] = useState(.5);
  const [rate, setRate] = useState(8);
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [bins, setBins] = useState<number[]>(Array(13).fill(0));
  const [balls, setBalls] = useState<Ball[]>([]);
  const engine = useRef({ balls: [] as Ball[], bins: Array(13).fill(0) as number[], credit: 0, id: 0 });
  const total = bins.reduce((a, b) => a + b, 0);
  useEffect(() => { onCount(total); }, [total, onCount]);

  function newBall(): Ball {
    const path = [0];
    for (let row = 0; row < rows; row++) path.push(path[row] + (Math.random() < probability ? 1 : 0));
    return { path, age: 0, id: engine.current.id++ };
  }
  function reset(nextRows = rows) {
    setRunning(false);
    engine.current = { balls: [], bins: Array(nextRows + 1).fill(0), credit: 0, id: 0 };
    setBins([...engine.current.bins]); setBalls([]);
  }
  function single() {
    engine.current.balls.push(newBall());
    setBalls([...engine.current.balls]);
    setRunning(true);
    setSingleMode(true);
  }
  const [singleMode, setSingleMode] = useState(false);
  useEffect(() => {
    if (!running) return;
    let frame = 0, previous = 0;
    const tick = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      const e = engine.current;
      if (!singleMode && e.bins.reduce((a,b)=>a+b,0) + e.balls.length < 10000) {
        e.credit += dt * rate;
        while (e.credit >= 1) {
          const path = [0];
          for (let row=0;row<rows;row++) path.push(path[row]+(Math.random()<probability?1:0));
          e.balls.push({ path, age: 0, id: e.id++ }); e.credit--;
        }
      }
      let landed = false;
      e.balls = e.balls.filter(ball => {
        ball.age += dt * speed * 4;
        if (ball.age >= rows + 1) { e.bins[ball.path[rows]]++; landed = true; return false; }
        return true;
      });
      setBalls(e.balls.map(ball => ({ ...ball })));
      if (landed) setBins([...e.bins]);
      if (!e.balls.length && (singleMode || e.bins.reduce((a,b)=>a+b,0)>=10000)) { setRunning(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, rows, probability, rate, speed, singleMode]);

  const spacing = 500 / (rows + 1);
  const x = (row: number, rights: number) => 300 + (rights - row / 2) * spacing;
  const y = (row: number) => 25 + row * 230 / rows;
  const expected = Array.from({length:rows+1}, (_, k) => {
    let choose = 1;
    for(let j=1;j<=k;j++) choose *= (rows-j+1)/j;
    return choose * probability**k * (1-probability)**(rows-k);
  });
  const scale = Math.max(.05, ...expected, ...bins.map(n=>total?n/total:0));
  return <section className="plinko-lab" aria-label="Interactive Plinko experiment">
    <div className="plinko-toolbar"><strong>{total.toLocaleString()} landed · {balls.length} falling</strong><div>
      <button className="button button-accent" onClick={()=>{setSingleMode(false);setRunning(!running);}}>{running?"Pause":"Run"}</button>
      <button className="button button-outline" disabled={running || balls.length>0 || total>=10000} onClick={single}>Drop one</button>
      <button className="button button-outline" onClick={()=>reset()}>Reset</button>
    </div></div>
    <svg viewBox="0 0 600 420" role="img" aria-label={`Plinko with ${rows} rows. ${total} balls landed. Histogram shows the number of right turns.`}>
      <rect width="600" height="420" rx="12" fill="#eff6f8"/>
      {Array.from({length:rows},(_,row)=>Array.from({length:row+1},(_,k)=><circle key={`${row}-${k}`} cx={x(row,k)} cy={y(row)} r="3" fill="#7693a3"/>))}
      {balls.map(ball=>{const row=Math.min(rows-1,Math.floor(ball.age)),t=Math.min(1,ball.age-row);const cx=ball.age>=rows?x(rows,ball.path[rows]):x(row,ball.path[row])+(x(row+1,ball.path[row+1])-x(row,ball.path[row]))*t;const cy=ball.age>=rows?y(rows)+(ball.age-rows)*24:y(row)+(y(row+1)-y(row))*t-5*Math.sin(Math.PI*t);return <circle key={ball.id} cx={cx} cy={cy-6} r="4.5" fill="#e86d58"/>;})}
      {bins.map((n,k)=>{const height=total?100*n/total/scale:0;return <g key={k}><title>{k} right turns: {n} balls ({total?(100*n/total).toFixed(1):0}%). Expected {(expected[k]*100).toFixed(1)}%.</title><rect x={x(rows,k)-spacing*.43} y={385-height} width={spacing*.86} height={height} fill="#087d66"/><text x={x(rows,k)} y="402" textAnchor="middle" fontSize="12" fill="#173b57">{k}</text></g>;})}
      {overlay&&<polyline points={expected.map((v,k)=>`${x(rows,k)},${385-100*v/scale}`).join(" ")} fill="none" stroke="#4d72df" strokeWidth="2.5" strokeDasharray="5 4"/>}
    </svg>
    <p className="plinko-caption">Horizontal axis: number of right turns. Green: observed proportions. Dashed blue: exact binomial probabilities.</p>
    <div className="plinko-controls">
      <label>Peg rows <strong>{rows}</strong><input type="range" min="4" max="20" value={rows} onChange={e=>{const n=+e.target.value;setRows(n);reset(n);}}/></label>
      <label>Chance of turning right <strong>{Math.round(probability*100)}%</strong><input type="range" min="0" max="1" step=".05" value={probability} onChange={e=>{setProbability(+e.target.value);reset();}}/></label>
      <label>Drop rate <strong>{rate} balls/sec</strong><input type="range" min="1" max="30" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Animation speed <strong>{speed}×</strong><input type="range" min=".25" max="3" step=".25" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label>
    </div>
    <label className="plinko-toggle"><input type="checkbox" checked={overlay} onChange={e=>setOverlay(e.target.checked)}/> Show theoretical distribution</label>
    <p className="plinko-caption">Changing rows or probability resets the experiment. Pause freezes balls in place. Limit: 10,000 balls per run.</p>
    <div className="plinko-math">X ~ Binomial({rows}, {probability.toFixed(2)}) · μ = {(rows*probability).toFixed(2)} · σ = {Math.sqrt(rows*probability*(1-probability)).toFixed(2)}</div>
    <p className="plinko-caption">{rows*probability>=5&&rows*(1-probability)>=5?"The normal approximation is reasonable here: both np and n(1−p) are at least 5.":"The exact distribution is binomial. With few rows or strong bias, a normal approximation may be poor."}</p>
    <details><summary>View exact bin counts</summary><div className="plinko-table"><table><thead><tr><th>Right turns</th><th>Balls</th><th>Observed</th><th>Expected</th></tr></thead><tbody>{bins.map((n,k)=><tr key={k}><td>{k}</td><td>{n}</td><td>{total?(100*n/total).toFixed(1):"0.0"}%</td><td>{(expected[k]*100).toFixed(1)}%</td></tr>)}</tbody></table></div></details>
  </section>;
}
