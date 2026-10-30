"use client";

import type { FormEvent } from "react";
import type { RequestFormState, SubmitStatus } from "@/types/request";
import { RequestPipelineFields } from "@/components/sections/RequestPipelineFields";
import { RequestContactFields } from "@/components/sections/RequestContactFields";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface RequestFormProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: SubmitStatus;
  /** Server-side validation detail, already localized. */
  invalidDetail?: string | null;
}

/**
 * The request form: pipeline groups, contact fields, submit — spaced by
 * section, not boxed in one padded mega-panel.
 */
export function RequestForm({
  form,
  onFieldChange,
  onSubmit,
  status,
  invalidDetail,
}: RequestFormProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;
  const sending = status === "sending";
  const failed = status === "error";
  const rateLimited = status === "rate_limited";
  const invalid = status === "invalid";
  const showError = failed || rateLimited || invalid;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative flex flex-col gap-12 sm:gap-16"
    >
      {/* Honeypot: visually hidden, skipped by keyboard and screen readers.
          Bots that fill it get a silent success and nothing is delivered. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="company-website">Company website</label>
        <input
          id="company-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => onFieldChange("website", event.target.value)}
        />
      </div>
      <div data-form-reveal>
        <RequestPipelineFields form={form} onFieldChange={onFieldChange} />
      </div>
      <div data-form-reveal>
        <RequestContactFields form={form} onFieldChange={onFieldChange} />
      </div>

      <div data-form-reveal className="flex flex-col gap-4">
        {showError && (
          <p
            role="alert"
            className="rounded-xl bg-[var(--negative-bg)] px-3 py-2 font-sans text-sm leading-relaxed text-[var(--negative)]"
          >
            <span className="font-semibold">
              {rateLimited
                ? t.rateLimitTitle
                : invalid
                  ? t.invalidTitle
                  : t.errorTitle}
              .{" "}
            </span>
            {rateLimited
              ? t.rateLimitBody
              : invalid
                ? invalidDetail ?? t.invalidBody
                : t.errorBody}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={sending}
            className="group inline-flex min-h-[48px] w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            {sending ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
                {t.sending}
              </>
            ) : (
              <>
                {showError ? t.retryBtn : t.submitBtn}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                >
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
