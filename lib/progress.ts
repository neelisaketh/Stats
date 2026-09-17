export type Profile = {
  user_id: string;
  display_name: string;
  grade: number;
  school_year: string;
  class_period: number;
};
export type Attempt = {
  id: string;
  user_id?: string;
  activity: string;
  correct: number;
  total: number;
  created_at: string;
};
export type Review = {
  post_id: string;
  grade: number | null;
  feedback: string;
  recorded: boolean;
  reviewed_at: string;
  reviewer_id: string;
};
export type ScorePost = {
  id: string;
  attempt_id: string;
  user_id: string;
  activity: string;
  correct: number;
  total: number;
  display_name: string;
  grade: number;
  school_year: string;
  class_period: number;
  attempted_at: string;
  posted_at: string;
  score_reviews: Review | null;
};
export function bestAttempts(attempts: Attempt[]) {
  const best = new Map<string, Attempt>();
  for (const a of attempts) {
    const old = best.get(a.activity);
    if (
      !old ||
      a.correct / a.total > old.correct / old.total ||
      (a.correct / a.total === old.correct / old.total && a.total > old.total)
    )
      best.set(a.activity, a);
  }
  return [...best.values()];
}
export function schoolYear() {
  const d = new Date(),
    y = d.getFullYear() - (d.getMonth() < 7 ? 1 : 0);
  return `${y}-${y + 1}`;
}
