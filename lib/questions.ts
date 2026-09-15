import { chiSquareCdf, fCdf, inverseNormal, inverseT, normalCdf, studentTCdf } from "./stats";

export type TestFamily = { id:string; name:string; short:string; description:string; ci:boolean; ti:string };
export type InferenceQuestion = { id:string; family:string; prompt:string; testStatistic:number; pValue:number; ci?:[number,number]; alpha:number; decision:string; explanation:string; tiCommand:string };

export const TESTS: TestFamily[] = [
  {id:"one-prop",name:"One-proportion z",short:"1-PropZTest",description:"One binary variable in one population",ci:true,ti:"1-PropZTest / 1-PropZInt"},
  {id:"two-prop",name:"Two-proportion z",short:"2-PropZTest",description:"Compare two independent proportions",ci:true,ti:"2-PropZTest / 2-PropZInt"},
  {id:"one-t",name:"One-sample t",short:"T-Test",description:"One population mean, σ unknown",ci:true,ti:"T-Test / TInterval"},
  {id:"two-t",name:"Two-sample t",short:"2-SampTTest",description:"Compare two independent means",ci:true,ti:"2-SampTTest / 2-SampTInt"},
  {id:"paired-t",name:"Paired t",short:"T-Test on differences",description:"Mean of matched-pair differences",ci:true,ti:"T-Test / TInterval on L₁−L₂"},
  {id:"gof",name:"Chi-square goodness-of-fit",short:"χ²GOF-Test",description:"One categorical variable vs. a model",ci:false,ti:"χ²GOF-Test"},
  {id:"independence",name:"Chi-square independence",short:"χ²-Test",description:"Association between two categorical variables",ci:false,ti:"χ²-Test"},
  {id:"homogeneity",name:"Chi-square homogeneity",short:"χ²-Test",description:"Compare categorical distributions",ci:false,ti:"χ²-Test"},
  {id:"slope",name:"Regression slope t",short:"LinRegTTest",description:"Inference for a population regression slope",ci:true,ti:"LinRegTTest / LinRegTInt"},
  {id:"anova",name:"One-way ANOVA",short:"ANOVA(",description:"Compare three or more means (extension)",ci:false,ti:"ANOVA("},
];

const contexts = ["robot battery life","commute choices","plant growth","study habits","water quality","manufacturing time","sleep duration","reaction time","screen use","athletic recovery"];
function rng(seed:number){let s=seed>>>0;return()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
const rnd=(r:()=>number,a:number,b:number)=>Math.floor(r()*(b-a+1))+a;
const clean=(n:number)=>Number(n.toFixed(6));
function twoTail(cdf:number){return 2*Math.min(cdf,1-cdf);}

function makeQuestion(family:TestFamily, i:number):InferenceQuestion {
  const r=rng((i+1)*7919+TESTS.indexOf(family)*104729), ctx=contexts[(i+TESTS.indexOf(family))%contexts.length], alpha=[.01,.05,.1][i%3];
  let prompt="",stat=0,p=0,ci:[number,number]|undefined,explanation="",cmd=family.ti;
  if(family.id==="one-prop"){
    const n=rnd(r,110,260),p0=[.35,.4,.5,.6][i%4],x=Math.round(n*(p0+(r()-.5)*.16)),ph=x/n,se0=Math.sqrt(p0*(1-p0)/n),se=Math.sqrt(ph*(1-ph)/n);stat=(ph-p0)/se0;p=twoTail(normalCdf(stat));const z=inverseNormal(.975);ci=[ph-z*se,ph+z*se];prompt=`A random sample of ${n} students studying ${ctx} found ${x} with the target response. Test H₀: p = ${p0} against Hₐ: p ≠ ${p0}.`;explanation=`One binary response from one random sample calls for a one-proportion z procedure. z = (p̂ − p₀)/√(p₀(1−p₀)/n).`;cmd=`1-PropZTest(${p0}, ${x}, ${n}, ≠)`;
  } else if(family.id==="two-prop"){
    const n1=rnd(r,90,190),n2=rnd(r,90,190),x1=rnd(r,35,n1-25),x2=rnd(r,35,n2-25),p1=x1/n1,p2=x2/n2,pool=(x1+x2)/(n1+n2);stat=(p1-p2)/Math.sqrt(pool*(1-pool)*(1/n1+1/n2));p=twoTail(normalCdf(stat));const se=Math.sqrt(p1*(1-p1)/n1+p2*(1-p2)/n2),z=inverseNormal(.975);ci=[p1-p2-z*se,p1-p2+z*se];prompt=`Independent samples studying ${ctx} find ${x1} of ${n1} in group A and ${x2} of ${n2} in group B with the target response. Test whether the population proportions differ.`;explanation=`Two independent groups and a binary response call for a two-proportion z procedure. Pool only for the hypothesis test.`;cmd=`2-PropZTest(${x1}, ${n1}, ${x2}, ${n2}, ≠)`;
  } else if(["one-t","paired-t"].includes(family.id)){
    const n=rnd(r,24,72),mean=clean((r()-.42)*5),sd=clean(3+r()*8),df=n-1;stat=mean/(sd/Math.sqrt(n));p=twoTail(studentTCdf(stat,df));const t=inverseT(.975,df),m=t*sd/Math.sqrt(n);ci=[mean-m,mean+m];prompt=family.id==="paired-t"?`${n} students are measured before and after a change related to ${ctx}. The after-minus-before differences have mean ${mean} and SD ${sd}. Test H₀: μd = 0 versus Hₐ: μd ≠ 0.`:`A random sample of ${n} observations related to ${ctx} has mean ${mean}, SD ${sd}. Test H₀: μ = 0 versus Hₐ: μ ≠ 0.`;explanation=family.id==="paired-t"?`The observations are linked pairs, so analyze the single list of differences with a one-sample t procedure.`:`One quantitative sample with unknown population σ calls for a one-sample t procedure.`;cmd=`T-Test(μ₀=0, x̄=${mean}, Sx=${sd}, n=${n}, ≠)`;
  } else if(family.id==="two-t"){
    const n1=rnd(r,24,65),n2=rnd(r,24,65),m1=clean(18+r()*8),m2=clean(18+r()*8),s1=clean(3+r()*6),s2=clean(3+r()*6),se=Math.sqrt(s1*s1/n1+s2*s2/n2),df=(s1*s1/n1+s2*s2/n2)**2/((s1*s1/n1)**2/(n1-1)+(s2*s2/n2)**2/(n2-1));stat=(m1-m2)/se;p=twoTail(studentTCdf(stat,df));const t=inverseT(.975,df),margin=t*se;ci=[m1-m2-margin,m1-m2+margin];prompt=`Independent samples studying ${ctx} have n₁=${n1}, x̄₁=${m1}, s₁=${s1} and n₂=${n2}, x̄₂=${m2}, s₂=${s2}. Test whether the population means differ.`;explanation=`Two independent quantitative samples with unknown population standard deviations call for a two-sample t procedure (unpooled/Welch).`;cmd=`2-SampTTest(${m1}, ${s1}, ${n1}, ${m2}, ${s2}, ${n2}, ≠, pooled:no)`;
  } else if(["gof","independence","homogeneity"].includes(family.id)){
    const obs=[[rnd(r,24,70),rnd(r,24,70),rnd(r,24,70)],[rnd(r,24,70),rnd(r,24,70),rnd(r,24,70)]];
    if(family.id==="gof"){const row=obs[0],total=row.reduce((a,b)=>a+b),e=total/3;stat=row.reduce((s,o)=>s+(o-e)**2/e,0);p=1-chiSquareCdf(stat,2);prompt=`In a study of ${ctx}, one random sample gives category counts ${row.join(", ")}. Test whether the three categories are equally likely.`;explanation=`One categorical variable compared with a claimed distribution calls for chi-square goodness-of-fit. Expected count = total/3.`;cmd=`χ²GOF-Test(observed, expected), df=2`;}else{const rt=obs.map(row=>row.reduce((a,b)=>a+b)),ct=[0,1,2].map(j=>obs[0][j]+obs[1][j]),total=rt[0]+rt[1];stat=obs.flatMap((row,a)=>row.map((o,b)=>{const e=rt[a]*ct[b]/total;return(o-e)**2/e;})).reduce((a,b)=>a+b);p=1-chiSquareCdf(stat,2);prompt=family.id==="independence"?`One random sample studying ${ctx} is classified by two variables. The two rows of a 2×3 table are [${obs[0]}] and [${obs[1]}]. Test whether the variables are associated.`:`Independent samples from populations A and B studying ${ctx} give category counts [${obs[0]}] and [${obs[1]}]. Test whether their population distributions differ.`;explanation=family.id==="independence"?`One population measured on two categorical variables calls for a chi-square test of independence.`:`Separate populations compared on one categorical response call for a chi-square test of homogeneity.`;cmd=`χ²-Test(observed matrix)`;}
  } else if(family.id==="slope"){
    const n=rnd(r,28,90),b=clean((r()-.5)*2.5),se=clean(.16+r()*.55),df=n-2;stat=b/se;p=twoTail(studentTCdf(stat,df));const t=inverseT(.975,df);ci=[b-t*se,b+t*se];prompt=`For ${n} randomly selected cases involving ${ctx}, a least-squares model gives slope b=${b} with SE(b)=${se}. Test H₀: β=0 versus Hₐ: β≠0.`;explanation=`The parameter is a population regression slope, so use a regression slope t procedure with df=n−2.`;cmd=`LinRegTTest(β=0, ≠)`;
  } else {
    const groups=3,n=12+i%8,means=[clean(18+r()*5),clean(18+r()*5),clean(18+r()*5)],within=clean(7+r()*8),grand=means.reduce((a,b)=>a+b)/groups,between=n*means.reduce((s,m)=>s+(m-grand)**2,0),msb=between/2,msw=within;stat=msb/msw;p=1-fCdf(stat,2,groups*(n-1));prompt=`Three independent groups studying ${ctx} each contain ${n} observations with means ${means.join(", ")}. The within-group mean square is ${within}. Test whether all population means are equal.`;explanation=`Three independent quantitative groups call for one-way ANOVA. This is included as a course extension beyond the core AP exam.`;cmd=`ANOVA(L₁, L₂, L₃)`;
  }
  return {id:`${family.id}-${String(i+1).padStart(3,"0")}`,family:family.id,prompt,testStatistic:clean(stat),pValue:clean(p),ci:ci?[clean(ci[0]),clean(ci[1])]:undefined,alpha,decision:p<=alpha?"Reject H₀":"Fail to reject H₀",explanation,tiCommand:cmd};
}

export const QUESTION_BANK = TESTS.flatMap(test => Array.from({length:100},(_,i)=>makeQuestion(test,i)));
export const TEST_BY_ID = Object.fromEntries(TESTS.map(test=>[test.id,test]));
