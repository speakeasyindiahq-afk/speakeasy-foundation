import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/site-settings";
import type { Lang } from "@/lib/i18n";

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

export function ArticleCard({ a, lang }: { a: Article; lang: Lang }) {
  if (!a.category || !a.slug) {
    return (
      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        <CardInner a={a} lang={lang} />
      </article>
    );
  }
  return (
    <Link
      to="/learn/$category/$slug"
      params={{ category: a.category, slug: a.slug }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-sm"
    >
      <CardInner a={a} lang={lang} />
    </Link>
  );
}

function CardInner({ a, lang }: { a: Article; lang: Lang }) {
  return (
    <>
      <div
        className="aspect-[16/10] w-full"
        style={{
          backgroundImage: a.cover_url ? `url(${a.cover_url})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: "color-mix(in oklab, var(--terracotta) 10%, var(--ivory))",
        }}
      />
      <div className="p-4">
        {a.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
            {a.category}
          </span>
        )}
        <h3 className="mt-1 text-base font-semibold leading-snug">{pick(lang, a.title_hi, a.title)}</h3>
        {(a.excerpt || a.excerpt_hi) && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pick(lang, a.excerpt_hi, a.excerpt)}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--terracotta)" }}>
          {lang === "hi" ? "पढ़ें" : "Read"} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </>
  );
}