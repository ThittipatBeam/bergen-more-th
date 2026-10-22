"use client";

import type { FormEvent } from "react";
import { JUDGE_N } from "@/lib/benchmark-data";
import type { RequestFormState } from "@/types/request";
import { RequestPipelineFields } from "@/components/sections/RequestPipelineFields";
import { RequestContactFields } from "@/components/sections/RequestContactFields";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface RequestFormProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/** The whole request form: pipeline, reply-to details, notes, submit. */
export function RequestForm({ form, onFieldChange, onSubmit }: RequestFormProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-xs sm:p-8"
    >
      <RequestPipelineFields form={form} onFieldChange={onFieldChange} />
      <RequestContactFields form={form} onFieldChange={onFieldChange} />

      <div className="flex flex-col gap-4 border-t border-[var(--border-default)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[52ch] font-sans text-sm leading-relaxed text-[var(--text-muted)]">
          {t.disclaimer(JUDGE_N)}
        </p>
        <button
          type="submit"
          className="min-h-[44px] shrink-0 cursor-pointer rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
        >
          {t.submitBtn}
        </button>
      </div>
    </form>
  );
}
