// Small, dependency-free distribution helpers for the in-browser TI-84-style tools.
function logGamma(z: number): number {
  const c = [676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
  if (z < .5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1; let x = .9999999999998099;
  c.forEach((v, i) => x += v / (z + i + 1));
  const t = z + c.length - .5;
  return .5 * Math.log(2 * Math.PI) + (z + .5) * Math.log(t) - t + Math.log(x);
}

function betaFraction(a: number, b: number, x: number) {
  const max = 160, eps = 3e-12, tiny = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap; d = 1 / Math.max(Math.abs(d), tiny) * Math.sign(d || 1);
  let h = d;
  for (let m = 1; m <= max; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

export function regularizedBeta(x: number, a: number, b: number) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betaFraction(a, b, x) / a : 1 - bt * betaFraction(b, a, 1 - x) / b;
}

export function normalCdf(x: number) {
  const sign = x < 0 ? -1 : 1, a = Math.abs(x) / Math.sqrt(2), t = 1 / (1 + .3275911 * a);
  const erf = 1 - (((((1.061405429*t - 1.453152027)*t + 1.421413741)*t - .284496736)*t + .254829592)*t)*Math.exp(-a*a);
  return .5 * (1 + sign * erf);
}

export function inverseNormal(p: number) {
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  const a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924];
  const b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857];
  const c=[-.00778489400243029,-.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878];
  const d=[.00778469570904146,.32246712907004,2.445134137143,3.75440866190742];
  if(p<.02425){const q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
  if(p>.97575){const q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
  const q=p-.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

export function studentTCdf(t: number, df: number) {
  const x = df / (df + t * t), ib = regularizedBeta(x, df / 2, .5);
  return t >= 0 ? 1 - .5 * ib : .5 * ib;
}

export function inverseT(p: number, df: number) {
  let lo = -40, hi = 40;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (studentTCdf(mid, df) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

function gammaP(a: number, x: number) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n=1;n<180;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*3e-12)break;}
    return sum * Math.exp(-x + a*Math.log(x) - logGamma(a));
  }
  let b=x+1-a,c=1e30,d=1/b,h=d;
  for(let i=1;i<180;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-30)d=1e-30;c=b+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-12)break;}
  return 1-Math.exp(-x+a*Math.log(x)-logGamma(a))*h;
}

export const chiSquareCdf = (x:number, df:number) => gammaP(df/2, x/2);
export const fCdf = (x:number, d1:number, d2:number) => regularizedBeta((d1*x)/(d1*x+d2),d1/2,d2/2);
export const clamp = (n:number, lo:number, hi:number) => Math.min(hi,Math.max(lo,n));
