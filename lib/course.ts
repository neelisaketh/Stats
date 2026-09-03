export type Checkpoint = {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type CourseUnit = {
  slug: string;
  unit: number;
  title: string;
  eyebrow: string;
  description: string;
  color: string;
  time: string;
  lessons: string[];
  objectives: string[];
  formula: string;
  formulaLabel: string;
  example: {
    prompt: string;
    steps: { label: string; text: string }[];
    conclusion: string;
  };
  trap: string;
  checkpoint: Checkpoint;
};

export const courseUnits: CourseUnit[] = [
  {
    slug: "exploring-data",
    unit: 1,
    title: "Exploring data",
    eyebrow: "Describe before you calculate",
    description: "Read distributions, choose useful summaries, and explain what a graph actually says.",
    color: "#ff8a4c",
    time: "42 min",
    lessons: ["Shape, center & spread", "Outliers and transformations", "Comparing distributions"],
    objectives: [
      "Describe a distribution using context, shape, center, spread, and unusual features.",
      "Choose median/IQR or mean/standard deviation based on shape and outliers.",
      "Compare groups with a direct statement about the variable—not two separate summaries.",
    ],
    formula: "IQR = Q₃ − Q₁",
    formulaLabel: "Middle 50% spread",
    example: {
      prompt: "A robotics team records build times of 18, 21, 22, 24, and 55 minutes. Which center best represents a typical build?",
      steps: [
        { label: "Notice", text: "55 minutes sits far above the other values, so the distribution is right-skewed." },
        { label: "Choose", text: "The median is resistant to that unusually long build, while the mean is pulled upward." },
        { label: "Calculate", text: "The ordered middle value is 22 minutes." },
      ],
      conclusion: "Use the median: a typical build took about 22 minutes.",
    },
    trap: "Never call a distribution “normal” just because it looks roughly symmetric. Normal also implies a specific bell-shaped model.",
    checkpoint: {
      question: "A strongly right-skewed distribution has a mean of 74. Which statement is most likely true?",
      choices: ["The median is greater than 74", "The median is less than 74", "The median must equal 74", "There is not enough data to compare them"],
      answer: 1,
      explanation: "A long right tail pulls the mean toward larger values, so the mean is typically above the median.",
    },
  },
  {
    slug: "collecting-data",
    unit: 2,
    title: "Collecting data",
    eyebrow: "Good conclusions start at design",
    description: "Separate samples from experiments, spot bias, and know exactly what can be generalized.",
    color: "#35b7a0",
    time: "48 min",
    lessons: ["Sampling methods", "Experimental design", "Scope of inference"],
    objectives: [
      "Distinguish random sampling from random assignment and explain what each permits.",
      "Identify undercoverage, nonresponse, response bias, and wording effects.",
      "Design randomized comparative experiments with control, replication, and blocking.",
    ],
    formula: "random sample → generalize",
    formulaLabel: "Population inference",
    example: {
      prompt: "Students are randomly selected from a school, then randomly assigned to two study methods. What conclusions are justified?",
      steps: [
        { label: "Sampling", text: "Random selection makes the sample representative enough to generalize to the school population." },
        { label: "Assignment", text: "Random assignment balances lurking variables and supports a cause-and-effect conclusion." },
        { label: "Scope", text: "Both design features are present, so both kinds of inference are available." },
      ],
      conclusion: "A difference can be attributed to the study method and generalized to students at that school.",
    },
    trap: "A large voluntary-response sample can still be badly biased. Size reduces random variation; it does not repair a flawed selection method.",
    checkpoint: {
      question: "Which design feature is required to make a cause-and-effect conclusion?",
      choices: ["A census", "Random selection", "Random assignment", "A sample larger than 30"],
      answer: 2,
      explanation: "Random assignment creates comparable treatment groups, which is what supports causation.",
    },
  },
  {
    slug: "probability",
    unit: 3,
    title: "Probability",
    eyebrow: "Model uncertainty precisely",
    description: "Work with conditional probability, independence, counting, and simulations without losing the context.",
    color: "#6e83ff",
    time: "56 min",
    lessons: ["Probability rules", "Conditional probability", "Simulation"],
    objectives: [
      "Use complements, unions, and intersections correctly.",
      "Test independence by comparing conditional and unconditional probabilities.",
      "Build a simulation whose random digits match the stated probability model.",
    ],
    formula: "P(A | B) = P(A ∩ B) / P(B)",
    formulaLabel: "Conditional probability",
    example: {
      prompt: "Thirty percent of parts fail inspection; 12% are both scratched and fail. Among failed parts, what fraction are scratched?",
      steps: [
        { label: "Condition", text: "The phrase “among failed parts” makes failure the new sample space." },
        { label: "Substitute", text: "P(scratched | fail) = P(scratched and fail) ÷ P(fail)." },
        { label: "Calculate", text: "0.12 ÷ 0.30 = 0.40." },
      ],
      conclusion: "Forty percent of the failed parts are scratched.",
    },
    trap: "Disjoint events with positive probability are not independent. If one happens, the other becomes impossible.",
    checkpoint: {
      question: "If P(A) = .5, P(B) = .4, and A and B are independent, what is P(A ∩ B)?",
      choices: [".10", ".20", ".45", ".90"],
      answer: 1,
      explanation: "For independent events, multiply: P(A ∩ B) = P(A)P(B) = .5(.4) = .20.",
    },
  },
  {
    slug: "random-variables",
    unit: 4,
    title: "Random variables",
    eyebrow: "From outcomes to distributions",
    description: "Calculate expected value and variability, then recognize binomial and geometric settings.",
    color: "#d56adf",
    time: "51 min",
    lessons: ["Expected value", "Combining variables", "Binomial & geometric models"],
    objectives: [
      "Find and interpret the mean and standard deviation of a random variable.",
      "Combine means and variances correctly for sums and differences.",
      "Verify conditions before using a binomial or geometric distribution.",
    ],
    formula: "μₓ = Σ x · P(x)",
    formulaLabel: "Expected value",
    example: {
      prompt: "A game pays $8 with probability .2 and costs $2 otherwise. What is the expected net result?",
      steps: [
        { label: "Outcomes", text: "The net values are +$8 with probability .2 and −$2 with probability .8." },
        { label: "Weight", text: "Multiply each possible value by its probability." },
        { label: "Calculate", text: "8(.2) + (−2)(.8) = 0." },
      ],
      conclusion: "The game is fair in the long run: the expected net result is $0 per play.",
    },
    trap: "Standard deviations do not add. For independent variables, add variances and then take the square root.",
    checkpoint: {
      question: "Which condition is not required for a binomial setting?",
      choices: ["A fixed number of trials", "Independent trials", "Exactly two outcomes per trial", "At least 30 trials"],
      answer: 3,
      explanation: "Binomial models need binary outcomes, independence, a fixed n, and constant success probability—not a minimum n.",
    },
  },
  {
    slug: "sampling-distributions",
    unit: 5,
    title: "Sampling distributions",
    eyebrow: "See statistics vary",
    description: "Understand bias, standard error, and why larger random samples produce steadier estimates.",
    color: "#f1c845",
    time: "58 min",
    lessons: ["Parameters vs. statistics", "Sample proportions", "Sample means & CLT"],
    objectives: [
      "Describe the center, spread, and shape of a sampling distribution.",
      "Check independence and large-counts conditions before using a Normal model.",
      "Explain how sample size changes standard error without changing the parameter.",
    ],
    formula: "SD(p̂) = √[p(1−p) / n]",
    formulaLabel: "Standard error of p̂",
    example: {
      prompt: "If 40% of students bike to school, how variable is p̂ in random samples of 100 students?",
      steps: [
        { label: "Center", text: "The sampling distribution is centered at the population proportion p = .40." },
        { label: "Spread", text: "SD(p̂) = √[.40(.60) ÷ 100]." },
        { label: "Calculate", text: "The standard deviation is about .049, or 4.9 percentage points." },
      ],
      conclusion: "Across many samples of 100, p̂ typically varies about .049 from .40.",
    },
    trap: "The population does not become more Normal when n grows. The sampling distribution of the mean becomes more nearly Normal.",
    checkpoint: {
      question: "If sample size is multiplied by 4, what happens to standard error?",
      choices: ["It doubles", "It is cut in half", "It is divided by 4", "It does not change"],
      answer: 1,
      explanation: "Standard error scales with 1/√n, so multiplying n by 4 divides standard error by √4 = 2.",
    },
  },
  {
    slug: "proportion-inference",
    unit: 6,
    title: "Inference for proportions",
    eyebrow: "Estimate and test percentages",
    description: "Build confidence intervals and significance tests for one or two population proportions.",
    color: "#ff6f7f",
    time: "64 min",
    lessons: ["One-proportion intervals", "One-proportion tests", "Two-proportion inference"],
    objectives: [
      "Choose the correct one- or two-proportion procedure.",
      "Check random, independence, and large-counts conditions in context.",
      "Interpret confidence levels, intervals, p-values, and decisions correctly.",
    ],
    formula: "estimate ± critical · SE",
    formulaLabel: "Confidence interval skeleton",
    example: {
      prompt: "In a random sample, 84 of 120 students support a schedule change. Find a 95% confidence interval.",
      steps: [
        { label: "Estimate", text: "p̂ = 84/120 = .70; the success-failure counts are both at least 10." },
        { label: "Error", text: "SE = √[.70(.30)/120] ≈ .0418, so the margin is 1.96(.0418) ≈ .082." },
        { label: "Interval", text: ".70 ± .082 gives (.618, .782)." },
      ],
      conclusion: "We are 95% confident that 61.8% to 78.2% of the population supports the change.",
    },
    trap: "A p-value is not the probability that the null hypothesis is true. It assumes H₀ and measures how surprising the data are.",
    checkpoint: {
      question: "A 95% confidence interval for p₁ − p₂ is (−.04, .11). What is the best conclusion?",
      choices: ["p₁ is definitely larger", "p₂ is definitely larger", "No statistically significant difference at α = .05", "The proportions are exactly equal"],
      answer: 2,
      explanation: "Because 0 is inside the interval, equality remains a plausible value for p₁ − p₂ at the 5% level.",
    },
  },
  {
    slug: "mean-inference",
    unit: 7,
    title: "Inference for means",
    eyebrow: "Work with quantitative averages",
    description: "Use t procedures for one sample, paired data, and two independent groups.",
    color: "#58a9ff",
    time: "67 min",
    lessons: ["One-sample t", "Paired t", "Two-sample t"],
    objectives: [
      "Distinguish paired data from two independent samples.",
      "Check randomization, independence, and Normal/large-sample conditions.",
      "Interpret a t interval or test conclusion in the original context.",
    ],
    formula: "t = (x̄ − μ₀) / (s/√n)",
    formulaLabel: "One-sample t statistic",
    example: {
      prompt: "A random sample of 25 batteries has x̄ = 14.2 Ah and s = 1.5 Ah. Test H₀: μ = 13.5 Ah.",
      steps: [
        { label: "Procedure", text: "The response is quantitative and σ is unknown, so use a one-sample t test." },
        { label: "Statistic", text: "t = (14.2 − 13.5)/(1.5/√25) = 2.33 with df = 24." },
        { label: "Evidence", text: "For a two-sided test, the p-value is about .028." },
      ],
      conclusion: "At α = .05, there is convincing evidence that the population mean differs from 13.5 Ah.",
    },
    trap: "Before-and-after measurements on the same subjects are paired. Analyze the within-person differences, not two independent samples.",
    checkpoint: {
      question: "Why do t distributions have heavier tails than the standard Normal?",
      choices: ["Data are always skewed", "Estimating σ with s adds uncertainty", "The mean is biased", "Sample sizes are always small"],
      answer: 1,
      explanation: "Replacing the unknown population standard deviation with the sample standard deviation adds estimation uncertainty.",
    },
  },
  {
    slug: "categorical-and-regression",
    unit: 8,
    title: "Chi-square & regression",
    eyebrow: "Finish with relationships",
    description: "Analyze categorical tables and test whether a linear model captures a real relationship.",
    color: "#7bc96f",
    time: "61 min",
    lessons: ["Chi-square procedures", "Expected counts & contributions", "Regression inference"],
    objectives: [
      "Choose among chi-square goodness-of-fit, homogeneity, and independence tests.",
      "Compute and interpret expected counts and chi-square contributions.",
      "Test a population regression slope and interpret an interval for β.",
    ],
    formula: "χ² = Σ (observed − expected)² / expected",
    formulaLabel: "Chi-square statistic",
    example: {
      prompt: "A survey records class year and preferred study location for one random sample. Which procedure tests association?",
      steps: [
        { label: "Variables", text: "Both class year and location are categorical variables measured on the same individuals." },
        { label: "Goal", text: "The question asks whether the two variables are associated in one population." },
        { label: "Choose", text: "Use a chi-square test of independence." },
      ],
      conclusion: "The test compares observed cell counts with counts expected if the variables were independent.",
    },
    trap: "A significant slope supports a linear association, not causation. Causation still depends on how the data were produced.",
    checkpoint: {
      question: "For a 3 × 4 contingency table, what are the chi-square degrees of freedom?",
      choices: ["5", "6", "7", "12"],
      answer: 1,
      explanation: "df = (rows − 1)(columns − 1) = (3 − 1)(4 − 1) = 6.",
    },
  },
];

export function getUnit(slug: string) {
  return courseUnits.find((unit) => unit.slug === slug);
}

export const totalLessonCount = courseUnits.reduce((total, unit) => total + unit.lessons.length, 0);
