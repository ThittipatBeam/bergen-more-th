export type MetricId =
  | "judge"
  | "em"
  | "mth"
  | "precision"
  | "recall"
  | "f1"
  | "generation";

/** Accent family — one hue per question the metric answers. */
export type MetricFamily = "quality" | "containment" | "overlap" | "speed";

/** Keys of the inline Material Symbols in components/ui/MetricIcon.tsx. */
export type MetricIconName =
  | "fact_check"
  | "gavel"
  | "match_case"
  | "select_check_box"
  | "compare_arrows"
  | "compress"
  | "done_all"
  | "scale"
  | "speed"
  | "timer"
  | "expand_more"
  | "help"
  | "bolt"
  | "search"
  | "mail"
  | "edit_note"
  | "folder_open"
  | "handshake"
  | "cloud";

export interface MetricSymbol {
  symbol: string;
  meaning: string;
}

export interface MetricFormula {
  /** KaTeX source. English-only: Thai glyphs inside \text{} may be missing. */
  tex: string;
  /** Plain-language reading of each symbol, shown beside the formula. */
  symbols: MetricSymbol[];
}

/** The short layer every reader sees without opening anything. */
export interface MetricSimpleCopy {
  /** Audience-facing question, e.g. "Would a reader say it's right?" */
  question: string;
  /** One sentence, no jargon. */
  explanation: string;
  /** One line tying the metric back to the shared worked example. */
  example: string;
}

/** The layer behind "Show the math". */
export interface MetricTechnicalCopy {
  /** How to interpret the number, in one sentence. */
  reading: string;
  /** Column key in the leaderboard / experiment record. */
  key: string;
  formula: MetricFormula;
  /** At most three bullets. */
  notes: string[];
}

export interface MetricDefinition {
  id: MetricId;
  /** Short display name, e.g. "Match TH". */
  name: string;
  icon: MetricIconName;
  family: MetricFamily;
  /** Which way the number should move. */
  direction: "higher" | "lower";
  simple: MetricSimpleCopy;
  technical: MetricTechnicalCopy;
}

/** One PyThaiNLP word piece in the worked example. */
export interface StoryToken {
  text: string;
  matched: boolean;
}

export interface StoryScore {
  id: MetricId;
  label: string;
  value: string;
  /** true = tick, false = cross, null = numeric only. */
  verdict: boolean | null;
}
