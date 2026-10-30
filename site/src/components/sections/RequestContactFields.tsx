"use client";

import type { RequestFormState } from "@/types/request";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { H3 } from "@/lib/design";

interface RequestContactFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/** Reply-to details (required) and a notes box (optional). */
export function RequestContactFields({
  form,
  onFieldChange,
}: RequestContactFieldsProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;
  const isTh = language === "TH";

  return (
    <div className="flex flex-col gap-10">
      <h2 className={`${H3} text-[var(--text-primary)]`}>
        {t.contactGroup}
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <TextField
          id="contact"
          label={t.nameLabel}
          required
          value={form.contact}
          onChange={(value) => onFieldChange("contact", value)}
          autoComplete="organization"
          maxLength={200}
        />
        <TextField
          id="email"
          label={t.emailLabel}
          type="email"
          inputMode="email"
          required
          value={form.email}
          onChange={(value) => onFieldChange("email", value)}
          autoComplete="email"
          maxLength={254}
        />
      </div>

      <div className="flex flex-col gap-4">
        <label
          htmlFor="notes"
          className="font-sans text-sm font-bold text-[var(--text-primary)]"
        >
          {t.notesLabel}
          <span className="font-normal text-[var(--text-muted)]">
            {" "}
            {isTh ? "(ไม่บังคับ)" : "(optional)"}
          </span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          value={form.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          placeholder={
            isTh
              ? "เช่น พารามิเตอร์เฉพาะ รูปแบบพรอมต์ หรือลิงก์ endpoint…"
              : "e.g. specific parameters, prompt template, or endpoint link…"
          }
          className="min-h-[112px] resize-y rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] p-4 font-sans text-base leading-relaxed text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none"
        />
      </div>
    </div>
  );
}
