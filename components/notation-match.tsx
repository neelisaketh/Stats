"use client";
import { ScoreResult } from "./score-result";
import { useState, useEffect, useRef } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { useProgress } from "./progress-provider";

const pairs=[
  ["μ","population mean"],["x̄","sample mean"],["σ","population standard deviation"],["s","sample standard deviation"],
  ["p","population proportion"],["p̂","sample proportion"],["ρ","population correlation"],["r","sample correlation"],
  ["β","population regression slope"],["b","sample regression slope"],["χ²","chi-square statistic"],["α","significance level"],
];
const shuffle=<T,>(a:T[])=>{const b=[...a];for(let i=b.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
function createDeck(){return shuffle(pairs.slice(0,8).flatMap((p,i)=>[{id:`${i}-s`,pair:i,label:p[0],kind:"symbol" as const},{id:`${i}-m`,pair:i,label:p[1],kind:"meaning" as const}]));}

export function NotationMatch(){const{recordActivity}=useProgress();const[deck,setDeck]=useState<ReturnType<typeof createDeck>>([]),[open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]),[moves,setMoves]=useState(0),[locked,setLocked]=useState(false);const done=matched.length===8;const timer=useRef<ReturnType<typeof setTimeout>|null>(null);useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function choose(index:number){if(locked||open.includes(index)||matched.includes(deck[index].pair))return;const next=[...open,index];setOpen(next);if(next.length===2){setMoves(moves+1);const hit=deck[next[0]].pair===deck[next[1]].pair;if(hit){const newMatched=[...matched,deck[index].pair];setMatched(newMatched);setOpen([]);if(newMatched.length===8)void recordActivity("Notation Match",8,Math.min(1000,moves+1));}else{setLocked(true);timer.current=setTimeout(()=>{setOpen([]);setLocked(false);},750);}}}
  function reset(){if(timer.current)clearTimeout(timer.current);setDeck(createDeck());setOpen([]);setMatched([]);setMoves(0);setLocked(false);}
  return <main className="activity-page wrap"><div className="activity-heading compact"><div><span className="kicker">Game / statistical notation</span><h1>Notation concentration.</h1><p>Match each symbol to its meaning. Score = 8 pairs ÷ moves; fewer moves means a higher score.</p></div><div className="score-pill">{moves} moves</div></div>{done&&<div className="game-win"><Trophy/><div><strong>Board cleared in {moves} moves.</strong><span>{moves<=12?"That was sharp.":"The symbols are starting to stick."}</span></div><button className="button button-accent" onClick={reset}>New board <RotateCcw size={17}/></button></div>}{done&&<ScoreResult activity="Notation Match"/>}{deck.length===0&&<section className="empty-state"><h2>Ready to make a match?</h2><p>Turn over two cards at a time to find each symbol’s meaning.</p><button className="button button-accent" onClick={reset}>Start game</button></section>}<section className="memory-grid" aria-label="Statistical notation matching game">{deck.map((card,index)=>{const revealed=open.includes(index)||matched.includes(card.pair);return <button key={card.id} className={`${revealed?"flipped":""} ${matched.includes(card.pair)?"matched":""}`} onClick={()=>choose(index)} aria-label={revealed?card.label:"Hidden card"}><span className="card-back">?</span><span className={`card-face ${card.kind}`}>{card.label}</span></button>;})}</section><div className="game-key"><span><i className="symbol-dot"/>symbol</span><span><i className="meaning-dot"/>meaning</span><button className="quiet-button" onClick={reset}>Reset board</button></div></main>;
}
