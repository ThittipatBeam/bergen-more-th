import type { MetricIconName } from "@/types/metrics";

/** One numbered chapter of the About page. */
export interface AboutChapterMeta {
  id: string;
  number: string;
  title: string;
  intro?: string;
  icon: MetricIconName;
  /** AA-checked CSS custom properties, same shape as the other chapters. */
  accent: { fg: string; bg: string };
}

/** A public artifact or upstream project a run can be traced back to. */
export interface AboutLink {
  /** Short mono label: "Code", "Dataset", "Harness", "Source text". */
  label: string;
  /** Repository id, dataset id, or project name. */
  name: string;
  description: string;
  href: string;
  /** Link label, without the arrow. */
  cta: string;
  brand: "github" | "huggingface";
}

/** An organization whose resources made the benchmark runs possible. */
export interface AboutSponsor {
  /** Short mono label, always English: "Powered by", "Model APIs by". */
  label: string;
  name: string;
  description: string;
  href: string;
  /** Short link label, without the arrow: "siam.ai", "cohere.com". */
  hrefLabel: string;
  /** Token family for the card: brand blue or verified green. */
  tone: "brand" | "positive";
  /** Which mark to render. */
  icon: "brandmark" | "cohere";
}
