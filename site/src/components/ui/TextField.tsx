interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email";
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "url" | "email";
  maxLength?: number;
}

/** Labelled single-line input styled for the site's request form. */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
  autoComplete,
  inputMode,
  maxLength,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-[var(--negative)]">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-describedby={hintId}
        className="min-h-[44px] w-full min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-3.5 font-sans text-base text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none"
      />
      {hint && (
        <p
          id={hintId}
          className="font-sans text-xs leading-relaxed text-[var(--text-muted)]"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
