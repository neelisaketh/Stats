"""Rebuild the deterministic 1,000-item bank. Requires scipy (authoring only)."""
import json, random, math
from pathlib import Path
from scipy.stats import norm, t, chi2, chi2_contingency
rng=random.Random(846)
names=['One-proportion z test','Two-proportion z test','One-sample t test','Two-sample t test','Paired t test','Chi-square goodness-of-fit','Chi-square independence','Chi-square homogeneity','Regression slope t test']
reasons=['One binary response in one population.','A binary response compared across two independent populations.','One quantitative mean with unknown population standard deviation.','Quantitative means from two independent groups; use Welch’s procedure.','The same subjects are measured twice; analyze within-subject differences.','One categorical variable compared with a specified distribution.','One sample classified by two categorical variables.','Independent samples from separate populations, comparing a categorical distribution.','Inference about a population linear regression slope.']
contexts=['battery testing','school transportation','a community survey','a manufacturing study','sports research','an environmental study','a campus survey','a nutrition study','an education study','a customer survey','a robotics study','a workplace study']
bank=[]
for i in range(1000):
 f=i%9; k=i//9; skill=(['identify','pvalue','alpha'] if f in [5,6,7] else ['identify','ci','pvalue','alpha'])[k%(3 if f in [5,6,7] else 4)]
 n=rng.randint(45,180); n2=rng.randint(45,180); alt=rng.choice(['less','greater','different']); tail={'less':'<','greater':'>','different':'≠'}[alt]; alpha=rng.choice([.01,.05,.1]); conf=rng.choice([.90,.95,.99]); df=None; null=0
 prefix=f'In {contexts[k%len(contexts)]}, '
 conditions='Assume random sampling, independent observations, and each sample is less than 10% of its population. '
 if f==0:
  n+=100; p0=rng.choice([.35,.4,.5,.6]); x=round(n*(p0+rng.uniform(-.12,.12))); est=x/n; se=math.sqrt(est*(1-est)/n); stat=(est-p0)/math.sqrt(p0*(1-p0)/n); null=p0
  scenario=f'a random sample of {n} people contains {x} who support a proposed policy. The claimed population support proportion is {p0}.'; param='p'; formula='z = (p̂ − p₀) / √[p₀(1 − p₀)/n]. For an interval use p̂ in the standard error.'
 elif f==1:
  n+=100; n2+=100; x=rng.randint(int(n*.3),int(n*.7)); y=rng.randint(int(n2*.3),int(n2*.7)); a=x/n; b=y/n2; est=a-b; pool=(x+y)/(n+n2); se=math.sqrt(a*(1-a)/n+b*(1-b)/n2); stat=est/math.sqrt(pool*(1-pool)*(1/n+1/n2))
  scenario=f'independent random samples from communities A and B find {x} of {n} and {y} of {n2} people support a policy, respectively. Compare A minus B.'; param='pA − pB'; formula='Pool the sample proportions for the equality test. For the interval, SE = √[p̂A(1−p̂A)/nA + p̂B(1−p̂B)/nB].'
 elif f in [2,3,4]:
  sd=round(rng.uniform(4,15),2); mean=round(rng.uniform(-3,5),2); se=sd/math.sqrt(n); df=n-1; est=mean
  if f==2:
   null=rng.randint(15,70); est=round(null+mean,2); scenario=f'a random sample of {n} devices has mean operating time {est} minutes and sample SD {sd} minutes. The claimed population mean is {null} minutes.'; param='μ'
  elif f==4:
   scenario=f'{n} randomly sampled students each take a before and after assessment. After-minus-before differences have mean {mean} points and sample SD {sd} points.'; param='μd'
  else:
   sd2=round(rng.uniform(4,15),2); m2=rng.randint(20,50); m1=round(m2+mean,2); se=math.sqrt(sd**2/n+sd2**2/n2); df=(sd**2/n+sd2**2/n2)**2/((sd**2/n)**2/(n-1)+(sd2**2/n2)**2/(n2-1)); scenario=f'independent random samples of {n} devices from supplier A and {n2} from supplier B have mean operating times {m1} and {m2} minutes, with sample SDs {sd} and {sd2}. Compare A minus B.'; param='μA − μB'
  stat=(est-null)/se; formula='t = (estimate − null value)/SE. Use sample SDs; for paired data use the SD of differences.'; conditions+='Quantitative distributions (differences for paired data) have no strong skew or outliers. '
 elif f==8:
  est=round(rng.uniform(-2,2),3); se=round(rng.uniform(.2,.9),3); df=n-2; stat=est/se; param='β'; scenario=f'a random sample of {n} students gives a regression of exam score on study hours with slope b = {est} points/hour and SE(b) = {se}.'; formula='t = b/SE(b), df = n − 2. The slope interval is b ± t*SE(b).'; conditions+='The relationship is linear with approximately Normal errors and constant error variance. '
 else:
  if f==5:
   obs=[rng.randint(25,75) for _ in range(4)]; exp=[sum(obs)/4]*4; stat=sum((o-e)**2/e for o,e in zip(obs,exp)); df=3; scenario=f'one random sample of products has category counts {obs} for A, B, C, D. Test the claim that all four categories are equally likely.'
  else:
   obs=[[rng.randint(20,70) for _ in range(3)] for _ in range(2)]; stat,p,df,exp=chi2_contingency(obs,correction=False)
   scenario=(f'one random sample of adults is classified by membership (member/nonmember) and preference (A/B/C). The rows of the count table are {obs[0]} and {obs[1]}. Test whether membership and preference are associated.' if f==6 else f'independent random samples from two cities record preference (A/B/C). City 1 counts are {obs[0]}; city 2 counts are {obs[1]}. Test whether the population preference distributions differ.')
  formula='χ² = Σ (observed − expected)²/expected; use the right tail. '+('df = categories − 1.' if f==5 else 'Expected = row total × column total / grand total; df = (rows − 1)(columns − 1).'); conditions+='All expected counts are at least 5. '
 p=float(chi2.sf(stat,df)) if f in [5,6,7] else float((norm.cdf(stat) if df is None else t.cdf(stat,df)) if alt=='less' else (norm.sf(stat) if df is None else t.sf(stat,df)) if alt=='greater' else 2*(norm.sf(abs(stat)) if df is None else t.sf(abs(stat),df)))
 prompt=prefix+scenario+' '+conditions
 if f not in [5,6,7] and skill!='ci': prompt+=f'Test H₀: {param} = {null} against Hₐ: {param} {tail} {null}. '
 options=[]; answer=[]
 if skill=='identify':
  prompt+='Which significance test should be used?'; options=names.copy(); answer=[names[f]]; explanation=reasons[f]
 elif skill=='pvalue':
  prompt+='Calculate the p-value. Enter a decimal rounded to four places.'; answer=[p]; explanation=f'{formula} Statistic = {stat:.6f}'+(f', df = {df:.6f}' if df is not None else '')+f'. '+('Use the right tail.' if f in [5,6,7] else f'Use the {alt} alternative; double the tail beyond |statistic| for a two-sided test.')+f' p = {p:.6f}.'
 elif skill=='ci':
  critical=float(norm.ppf((1+conf)/2) if df is None else t.ppf((1+conf)/2,df)); lo=est-critical*se; hi=est+critical*se; answer=[lo,hi]; prompt+=f'Find a {conf:.0%} confidence interval for {param}. Enter the lower and upper bounds as decimals, rounded to four places. Use Welch degrees of freedom for independent means.'; explanation=f'{formula} Estimate = {est:.6f}, SE = {se:.6f}, critical value = {critical:.6f}'+(f', df = {df:.6f}' if df is not None else '')+f'. Estimate ± critical value × SE gives ({lo:.6f}, {hi:.6f}).'
 else:
  # Supply enough precision for unambiguous comparison, including tiny p-values.
  shown=float(f'{p:.6g}'); prompt+=f'The calculated p-value is {shown:g}. At α = {alpha}, what is the decision?'; options=['p ≤ α: reject H₀','p > α: fail to reject H₀']; answer=[options[0 if shown<=alpha else 1]]; explanation=f'{shown:g} '+('≤' if shown<=alpha else '>')+f' {alpha}. '+('There is sufficient evidence for the alternative.' if shown<=alpha else 'There is insufficient evidence for the alternative; this does not prove the null.')
 bank.append(dict(id=f'Q{i+1:04}',family=f,skill=skill,prompt=prompt,options=options,answer=answer,explanation=explanation))
assert len(bank)==1000 and len({q['prompt'] for q in bank})==1000
assert all(all(math.isfinite(a) for a in q['answer'] if isinstance(a,(int,float))) for q in bank)
Path('lib/question-bank.json').write_text(json.dumps(bank,separators=(',',':'))+'\n')
print('Generated 1000 unique questions', {s:sum(q['skill']==s for q in bank) for s in ['identify','ci','pvalue','alpha']})
