import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className={`px-2.5 py-1 rounded-full transition ${lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
      >
        हिं
      </button>
    </div>
  );
}