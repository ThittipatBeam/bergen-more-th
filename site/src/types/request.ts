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
}

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
};
