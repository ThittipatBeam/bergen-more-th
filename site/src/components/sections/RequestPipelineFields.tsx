import type { RequestFormState } from "@/types/request";
import { RequestModelRow } from "@/components/sections/RequestModelRow";
import { TextField } from "@/components/ui/TextField";

interface RequestPipelineFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/** Generator, embedding and optional reranker — free text, with optional links. */
export function RequestPipelineFields({
  form,
  onFieldChange,
}: RequestPipelineFieldsProps) {
  return (
    <section aria-labelledby="pipeline-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2
          id="pipeline-title"
          className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
        >
          The pipeline
        </h2>
        <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          Name each part. A link is optional, but it helps us find the exact
          checkpoint.
        </p>
      </div>

      {/* Rows are divided by a rule, not each wrapped in its own card. */}
      <div className="flex flex-col [&>*+*]:mt-6 [&>*+*]:border-t [&>*+*]:border-[var(--border-default)] [&>*+*]:pt-6">
        <RequestModelRow step="01" title="Generator model" required>
          <TextField
            id="generator-name"
            label="Model name"
            required
            value={form.generatorName}
            onChange={(value) => onFieldChange("generatorName", value)}
            placeholder="e.g. meta-llama/Llama-3.3-70B-Instruct"
            autoComplete="off"
          />
          <TextField
            id="generator-link"
            label="Model link (optional)"
            inputMode="url"
            value={form.generatorLink}
            onChange={(value) => onFieldChange("generatorLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
          />
        </RequestModelRow>

        <RequestModelRow step="02" title="Embedding model" required>
          <TextField
            id="embedding-name"
            label="Model name"
            required
            value={form.embeddingName}
            onChange={(value) => onFieldChange("embeddingName", value)}
            placeholder="e.g. BAAI/bge-m3"
            autoComplete="off"
          />
          <TextField
            id="embedding-link"
            label="Model link (optional)"
            inputMode="url"
            value={form.embeddingLink}
            onChange={(value) => onFieldChange("embeddingLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
          />
        </RequestModelRow>

        <RequestModelRow
          step="03"
          title="Reranker model"
          hint="Leave both blank to run dense retrieval only."
        >
          <TextField
            id="reranker-name"
            label="Model name"
            value={form.rerankerName}
            onChange={(value) => onFieldChange("rerankerName", value)}
            placeholder="e.g. BAAI/bge-reranker-v2-m3"
            autoComplete="off"
          />
          <TextField
            id="reranker-link"
            label="Model link (optional)"
            inputMode="url"
            value={form.rerankerLink}
            onChange={(value) => onFieldChange("rerankerLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
          />
        </RequestModelRow>
      </div>
    </section>
  );
}
