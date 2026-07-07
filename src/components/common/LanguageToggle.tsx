"use client";

import { useI18n, type Lang } from "@/lib/i18n/context";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "id", label: "ID" },
];

/** Sakelar bahasa EN/ID di navbar. Default EN, tersimpan di localStorage. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("nav.lang_aria")}
      className="inline-flex overflow-hidden rounded-full border border-foreground shadow-hard-xs"
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(opt.value)}
            className={`px-2.5 py-1 font-display text-xs tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
