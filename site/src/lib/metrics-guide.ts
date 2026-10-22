/** "Which score should I use?" cheat sheet. */
export interface WhichScoreRow {
  need: string;
  use: string;
  why: string;
}

export const WHICH_SCORE_ROWS: WhichScoreRow[] = [
  {
    need: "One number to rank pipelines on",
    use: "Overall",
    why: "Blends all four correctness scores, weighted to the judge.",
  },
  {
    need: "Answers I can trust",
    use: "Judge",
    why: "Reads meaning, not spelling.",
  },
  {
    need: "Proof the source's words were used",
    use: "Recall · F1",
    why: "Measures how much of the answer key was covered.",
  },
  {
    need: "To catch waffle",
    use: "Precision",
    why: "Every extra word lowers it.",
  },
  {
    need: "An exact string match",
    use: "EM",
    why: "All or nothing, after a light cleanup.",
  },
  {
    need: "Speed",
    use: "Generation time",
    why: "Model writing time only.",
  },
];
