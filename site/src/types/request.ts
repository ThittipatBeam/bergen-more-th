/** Values the free-text request form collects. */
export interface RequestFormState {
  generatorName: string;
  generatorLink: string;
  embeddingName: string;
  embeddingLink: string;
  rerankerName: string;
  rerankerLink: string;
  contact: string;
  email: string;
  notes: string;
  /** Honeypot field. Must stay empty; bots that fill it are dropped. */
  website: string;
}

/** Shared submission state for the form and its error banner. */
export type SubmitStatus =
  | "idle"
  | "sending"
  | "success"
  | "error"
  | "rate_limited"
  | "invalid"
  | "unconfigured";

export const EMPTY_REQUEST_FORM: RequestFormState = {
  generatorName: "",
  generatorLink: "",
  embeddingName: "",
  embeddingLink: "",
  rerankerName: "",
  rerankerLink: "",
  contact: "",
  email: "",
  notes: "",
  website: "",
};
