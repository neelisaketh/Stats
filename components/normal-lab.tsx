"use client";

import { useMemo, useState } from "react";

function erf(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

function normalCdf(x: number, mean: number, sd: number) {
  return 0.5 * (1 + erf((x - mean) / (sd * Math.sqrt(2))));
}

export function NormalLab({ condensed = false }: { condensed?: boolean }) {
  const [mean, setMean] = useState(0);
  const [sd, setSd] = useState(1);
  const [low, setLow] = useState(-1);
  const [high, setHigh] = useState(1);

  const graph = useMemo(() => {
    const width = 640;
    const height = condensed ? 210 : 260;
    const baseline = height - 30;
    const xMin = mean - 4 * sd;
    const xMax = mean + 4 * sd;
    const maxY = 1 / (sd * Math.sqrt(2 * Math.PI));
    const point = (x: number) => {
      const px = ((x - xMin) / (xMax - xMin)) * width;
      const density = Math.exp(-0.5 * ((x - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
      const py = baseline - (density / maxY) * (baseline - 18);
      return { x: px, y: py };
    };
    const xs = Array.from({ length: 161 }, (_, index) => xMin + ((xMax - xMin) * index) / 160);
    const curve = xs.map((x, index) => `${index ? "L" : "M"}${point(x).x.toFixed(2)},${point(x).y.toFixed(2)}`).join(" ");
    const clippedLow = Math.max(xMin, Math.min(low, high));
    const clippedHigh = Math.min(xMax, Math.max(low, high));
    const shadedXs = [clippedLow, ...xs.filter((x) => x > clippedLow && x < clippedHigh), clippedHigh];
    const area = shadedXs.length > 1
      ? `M${point(clippedLow).x},${baseline} ${shadedXs.map((x) => `L${point(x).x.toFixed(2)},${point(x).y.toFixed(2)}`).join(" ")} L${point(clippedHigh).x},${baseline} Z`
      : "";
    return { width, height, baseline, curve, area, xMin, xMax };
  }, [mean, sd, low, high, condensed]);

  const lower = Math.min(low, high);
  const upper = Math.max(low, high);
  const probability = normalCdf(upper, mean, sd) - normalCdf(lower, mean, sd);

  return (
    <section className={condensed ? "normal-lab lab-condensed" : "normal-lab"} aria-label="Interactive normal distribution">
      <div className="lab-heading">
        <div>
          <span className="kicker">Interactive model</span>
          <h2>Normal distribution lab</h2>
        </div>
        <div className="probability-readout">
          <span>P({lower.toFixed(1)} &lt; X &lt; {upper.toFixed(1)})</span>
          <strong>{(probability * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <div className="curve-wrap">
        <svg viewBox={`0 0 ${graph.width} ${graph.height}`} role="img" aria-label={`Normal curve with ${(probability * 100).toFixed(1)} percent shaded`}>
          <defs>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff8a4c" stopOpacity=".78" />
              <stop offset="1" stopColor="#ff8a4c" stopOpacity=".16" />
            </linearGradient>
          </defs>
          <line x1="0" y1={graph.baseline} x2={graph.width} y2={graph.baseline} className="axis-line" />
          {[-2, -1, 0, 1, 2].map((z) => {
            const x = ((mean + z * sd - graph.xMin) / (graph.xMax - graph.xMin)) * graph.width;
            return (
              <g key={z}>
                <line x1={x} y1={graph.baseline} x2={x} y2={graph.baseline + 6} className="tick-line" />
                <text x={x} y={graph.baseline + 22} textAnchor="middle" className="tick-label">{(mean + z * sd).toFixed(1)}</text>
              </g>
            );
          })}
          <path d={graph.area} fill="url(#area-fill)" />
          <path d={graph.curve} className="curve-line" />
        </svg>
      </div>

      <div className="lab-controls">
        <label>
          <span>Mean <b>μ = {mean.toFixed(1)}</b></span>
          <input type="range" min="-3" max="3" step="0.1" value={mean} onChange={(event) => setMean(Number(event.target.value))} />
        </label>
        <label>
          <span>Standard deviation <b>σ = {sd.toFixed(1)}</b></span>
          <input type="range" min="0.5" max="3" step="0.1" value={sd} onChange={(event) => setSd(Number(event.target.value))} />
        </label>
        <div className="bound-controls">
          <label>
            <span>Lower bound</span>
            <input type="number" step="0.1" value={low} onChange={(event) => setLow(Number(event.target.value))} />
          </label>
          <label>
            <span>Upper bound</span>
            <input type="number" step="0.1" value={high} onChange={(event) => setHigh(Number(event.target.value))} />
          </label>
        </div>
      </div>
    </section>
  );
}
