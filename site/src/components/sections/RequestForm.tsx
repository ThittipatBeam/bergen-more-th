"use client";

import type { FormEvent } from "react";
import { JUDGE_N } from "@/lib/benchmark-data";
import type { RequestFormState } from "@/types/request";
import { RequestPipelineFields } from "@/components/sections/RequestPipelineFields";
import { RequestContactFields } from "@/components/sections/RequestContactFields";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

type SubmitStatus = "idle" | "sending" | "success" | "error" | "unconfigured";

interface RequestFormProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: SubmitStatus;
}

/** The whole request form: pipeline, reply-to details, notes, submit. */
export function RequestForm({ form, onFieldChange, onSubmit, status }: RequestFormProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;
  const sending = status === "sending";
  const failed = status === "error";

  const submitLabel = sending
    ? t.sending
    : failed
      ? t.retryBtn
      : t.submitBtn;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-xs sm:p-8"
    >
      <RequestPipelineFields form={form} onFieldChange={onFieldChange} />
      <RequestContactFields form={form} onFieldChange={onFieldChange} />

      <div className="flex flex-col gap-4 border-t border-[var(--border-default)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-[52ch] flex-col gap-2">
          <p className="font-sans text-sm leading-relaxed text-[var(--text-muted)]">
            {t.disclaimer(JUDGE_N)}
          </p>
          {failed && (
            <p
              role="alert"
              className="rounded-xl bg-[var(--negative-bg)] px-3 py-2 font-sans text-sm leading-relaxed text-[var(--negative)]"
            >
              <span className="font-semibold">{t.errorTitle}. </span>
              {t.errorBody}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={sending}
          className="min-h-[44px] shrink-0 cursor-pointer rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)] disabled:cursor-wait disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
