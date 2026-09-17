export const activities = [
  {
    id: "normal-lesson",
    title: "Normal distributions",
    category: "Lesson",
    href: "/learn/normal-curves",
    description:
      "Build a bell curve with Plinko, explore z-scores, and connect area to probability.",
    detail: "Interactive · 15 min",
    sections: ["learn", "normal"],
  },
  {
    id: "Inference Test Lab",
    title: "Inference Test Lab",
    category: "Quiz",
    href: "/practice/inference",
    description:
      "Choose your procedures and practice identifying tests, calculating, and drawing conclusions.",
    detail: "1,000 questions · Your pace",
    sections: ["practice"],
  },
  {
    id: "Normal Curve Quiz",
    title: "Normal Curve Quiz",
    category: "Quiz",
    href: "/normal/quiz",
    description:
      "Practice areas, z-scores, and percentiles with an interactive normal curve.",
    detail: "10 questions · 10 min",
    sections: ["practice", "normal"],
  },
  {
    id: "Notation Match",
    title: "Notation concentration",
    category: "Game",
    href: "/games/notation",
    description:
      "Match statistical symbols to their meanings. Clear the board in as few moves as possible.",
    detail: "8 pairs · 5 min",
    sections: ["games"],
  },
];
export const sections = {
  learn: {
    title: "Learn one idea at a time.",
    description:
      "Explore a lesson, try the interactive examples, then put your understanding into practice.",
  },
  practice: {
    title: "Practice at your pace.",
    description:
      "Choose a quiz. Get feedback, build confidence, and improve your personal best.",
  },
  normal: {
    title: "Get to know the normal curve.",
    description:
      "Start with the interactive lesson or check your understanding with a quiz.",
  },
  games: {
    title: "A little play. A lot of learning.",
    description: "Choose a game and make the essentials of statistics stick.",
  },
};
