import type { RequestFormState } from "@/types/request";
import { TextField } from "@/components/ui/TextField";

interface RequestContactFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/** Reply-to details (required) and free-form notes (optional). */
export function RequestContactFields({
  form,
  onFieldChange,
}: RequestContactFieldsProps) {
  return (
    <>
      <section
        aria-labelledby="contact-title"
        className="flex flex-col gap-6 border-t border-[var(--border-default)] pt-8"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="contact-title"
            className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
          >
            Who should we reply to?
          </h2>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            We need a contact and an email address to confirm the run with you.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="contact"
            label="Contact or organization name"
            required
            value={form.contact}
            onChange={(value) => onFieldChange("contact", value)}
            autoComplete="organization"
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            required
            value={form.email}
            onChange={(value) => onFieldChange("email", value)}
            autoComplete="email"
          />
        </div>
      </section>

      <section
        aria-labelledby="notes-title"
        className="flex flex-col gap-4 border-t border-[var(--border-default)] pt-8"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="notes-title"
            className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
          >
            Anything else?
          </h2>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            Optional. Tell us about parameters, prompts or a paper you want us
            to reproduce.
          </p>
        </div>
        <label
          htmlFor="notes"
          className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
        >
          Additional notes or evaluation parameters
        </label>
        <textarea
          id="notes"
          rows={5}
          value={form.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          className="min-h-[132px] resize-y rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-4 font-sans text-base leading-relaxed text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none"
        />
      </section>
    </>
  );
}
