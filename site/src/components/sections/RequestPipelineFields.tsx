"use client";

import type { RequestFormState } from "@/types/request";
import { RequestModelRow } from "@/components/sections/RequestModelRow";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/hooks/use-language";

interface RequestPipelineFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/** Generator, embedding and optional reranker — free text, with optional links. */
export function RequestPipelineFields({
  form,
  onFieldChange,
}: RequestPipelineFieldsProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <section aria-labelledby="pipeline-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2
          id="pipeline-title"
          className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
        >
          {isTh ? "โมเดลที่ต้องการทดสอบ" : "The pipeline"}
        </h2>
        <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          {isTh
            ? "ระบุชื่อโมเดลแต่ละส่วน การใส่ลิงก์โมเดลจะช่วยให้เราโหลด checkpoint ได้ถูกต้องตรงรุ่น"
            : "Name each model. Adding a link is optional, but helps us load the exact checkpoint."}
        </p>
      </div>

      {/* Rows are divided by a rule, not each wrapped in its own card. */}
      <div className="flex flex-col [&>*+*]:mt-6 [&>*+*]:border-t [&>*+*]:border-[var(--border-default)] [&>*+*]:pt-6">
        <RequestModelRow
          step="01"
          title={isTh ? "โมเดล Generator" : "Generator model"}
          required
        >
          <TextField
            id="generator-name"
            label={isTh ? "ชื่อโมเดล" : "Model name"}
            required
            value={form.generatorName}
            onChange={(value) => onFieldChange("generatorName", value)}
            placeholder="e.g. meta-llama/Llama-3.3-70B-Instruct"
            autoComplete="off"
            maxLength={200}
          />
          <TextField
            id="generator-link"
            label={isTh ? "ลิงก์โมเดล (ไม่บังคับ)" : "Model link (optional)"}
            inputMode="url"
            value={form.generatorLink}
            onChange={(value) => onFieldChange("generatorLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
            maxLength={500}
          />
        </RequestModelRow>

        <RequestModelRow
          step="02"
          title={isTh ? "โมเดล Embedding" : "Embedding model"}
          required
        >
          <TextField
            id="embedding-name"
            label={isTh ? "ชื่อโมเดล" : "Model name"}
            required
            value={form.embeddingName}
            onChange={(value) => onFieldChange("embeddingName", value)}
            placeholder="e.g. BAAI/bge-m3"
            autoComplete="off"
            maxLength={200}
          />
          <TextField
            id="embedding-link"
            label={isTh ? "ลิงก์โมเดล (ไม่บังคับ)" : "Model link (optional)"}
            inputMode="url"
            value={form.embeddingLink}
            onChange={(value) => onFieldChange("embeddingLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
            maxLength={500}
          />
        </RequestModelRow>

        <RequestModelRow
          step="03"
          title={isTh ? "โมเดล Reranker" : "Reranker model"}
          hint={
            isTh
              ? "เว้นว่างไว้หากต้องการทดสอบเฉพาะ dense retrieval โดยไม่ใช้ reranker"
              : "Leave blank to run dense retrieval only."
          }
        >
          <TextField
            id="reranker-name"
            label={isTh ? "ชื่อโมเดล" : "Model name"}
            value={form.rerankerName}
            onChange={(value) => onFieldChange("rerankerName", value)}
            placeholder="e.g. BAAI/bge-reranker-v2-m3"
            autoComplete="off"
            maxLength={200}
          />
          <TextField
            id="reranker-link"
            label={isTh ? "ลิงก์โมเดล (ไม่บังคับ)" : "Model link (optional)"}
            inputMode="url"
            value={form.rerankerLink}
            onChange={(value) => onFieldChange("rerankerLink", value)}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
            maxLength={500}
          />
        </RequestModelRow>
      </div>
    </section>
  );
}
