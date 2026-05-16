import { Link } from "@tanstack/react-router";
import type { Myth } from "@/lib/site-settings";
import type { Lang } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

export function MythCard({ m, lang }: { m: Myth; lang: Lang }) {
  const { t } = useI18n();
  const mythText = pick(lang, m.myth_statement_hi ?? m.myth_hi, m.myth_statement_en ?? m.myth);
  const truthText = pick(lang, m.truth_statement_hi ?? m.fact_hi, m.truth_statement_en ?? m.fact);

  const Inner = (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
      style={{ borderLeft: "4px solid #C0392B" }}
    >
      <div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: "#C0392B" }}
        >
          ❌ {t("myth.label.myth")}
        </span>
        <p
          className="mt-2 text-base italic leading-snug text-foreground"
          style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}
        >
          {mythText}
        </p>
      </div>

      <div className="my-4 flex items-center gap-2 opacity-70">
        <span className="h-px flex-1" style={{ backgroundColor: "var(--sage)" }} />
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--sage)" }}>✦</span>
        <span className="h-px flex-1" style={{ backgroundColor: "var(--sage)" }} />
      </div>

      <div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: "var(--sage)" }}
        >
          ✅ {t("myth.label.truth")}
        </span>
        <p className="mt-2 text-base font-medium leading-snug text-foreground">{truthText}</p>
      </div>

      {m.slug && (
        <span
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--terracotta)" }}
        >
          {t("myth.readFull")}
        </span>
      )}
    </article>
  );

  if (!m.slug) return Inner;
  return (
    <Link to="/myth/$slug" params={{ slug: m.slug }} className="block">
      {Inner}
    </Link>
  );
}