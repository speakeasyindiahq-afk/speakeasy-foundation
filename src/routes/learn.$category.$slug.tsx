import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, MessageCircle, MessageSquare, ThumbsUp, ThumbsDown, ShieldCheck, ExternalLink } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getCategory, categoryLabel } from "@/lib/categories";
import { ArticleCard } from "@/components/learn/ArticleCard";
import type { Article, Expert } from "@/lib/site-settings";
import { useQuery } from "@tanstack/react-query";

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

export const Route = createFileRoute("/learn/$category/$slug")({
  beforeLoad: ({ params }) => {
    if (!getCategory(params.category)) throw notFound();
  },
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("articles")
      .select("*, experts(*)")
      .eq("slug", params.slug)
      .eq("category", params.category)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) throw notFound();
    return { article: data as Article };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    const title = a?.seo_title || a?.title || "Article — Speakeasy India";
    const desc = a?.seo_description || a?.excerpt || "Medically-reviewed educational article.";
    const href = `/learn/${params.category}/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: href },
        ...(a?.cover_url ? [{ property: "og:image", content: a.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href }],
      scripts: a ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          image: a.cover_url || undefined,
          datePublished: a.created_at,
          author: a.experts ? { "@type": "Person", name: a.experts.name } : undefined,
        }),
      }] : [],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => {
    const { t } = useI18n();
    return (
      <div className="mx-auto max-w-[680px] px-5 py-20 text-center">
        <h1 className="text-2xl">{t("article.notfound")}</h1>
        <Link to="/learn" className="mt-4 inline-block text-sm font-semibold text-primary">← Learn</Link>
      </div>
    );
  },
});

function ArticlePage() {
  const { category, slug } = Route.useParams();
  const { article } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const expert = (article.experts ?? null) as Expert | null;

  const [warningPassed, setWarningPassed] = useState(!article.content_warning);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const relatedQ = useQuery({
    queryKey: ["articles", "related", category, slug],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("*")
        .eq("category", category).eq("status", "published")
        .neq("slug", slug)
        .order("created_at", { ascending: false }).limit(3);
      return (data ?? []) as Article[];
    },
  });

  async function sendFeedback(kind: "yes" | "no") {
    setFeedback(kind);
    const field = kind === "yes" ? "helpful_count" : "not_helpful_count";
    const current = (kind === "yes" ? article.helpful_count : article.not_helpful_count) ?? 0;
    try { await supabase.from("articles").update({ [field]: current + 1 }).eq("id", article.id); } catch {}
  }

  if (!warningPassed) {
    return (
      <div className="mx-auto max-w-[680px] px-5 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
            {t("warn.title")}
          </p>
          <h1 className="mt-2 text-2xl">{t("article.cw.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("article.cw.body")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setWarningPassed(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              {t("warn.continue")}
            </button>
            <Link to="/learn" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">
              {t("warn.back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = pick(lang, article.title_hi, article.title);
  const excerpt = pick(lang, article.excerpt_hi, article.excerpt);
  const body = pick(lang, article.body_hi, article.body);

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://speakeasy.in/learn/${category}/${slug}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  return (
    <article>
      {/* HERO */}
      <header
        className="border-b border-border/70"
        style={{
          background: "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 10%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 pt-8 pb-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">{t("learn.breadcrumb.home")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/learn" className="hover:text-foreground">{t("learn.breadcrumb.learn")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/learn/$category" params={{ category }} className="hover:text-foreground">{categoryLabel(category, lang)}</Link>
          </nav>
          {article.sub_category && (
            <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
              {article.sub_category}
            </span>
          )}
          <h1 className="mt-2 text-3xl leading-[1.15] sm:text-4xl" style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}>
            {title}
          </h1>
          {excerpt && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{excerpt}</p>}

          {/* Byline */}
          {expert && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 backdrop-blur">
              <div
                className="h-11 w-11 shrink-0 rounded-full bg-muted text-center text-xs font-semibold leading-[44px]"
                style={{
                  backgroundImage: expert.avatar_url ? `url(${expert.avatar_url})` : undefined,
                  backgroundSize: "cover", backgroundPosition: "center",
                  color: "var(--sage)",
                }}
              >
                {!expert.avatar_url && expert.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-semibold text-foreground">{t("article.reviewedBy")} {expert.name}</div>
                <div className="text-muted-foreground">
                  {[expert.credentials, expert.city].filter(Boolean).join(" · ")}
                  {article.review_date && <> · {t("article.reviewedOn")} {new Date(article.review_date).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { year: "numeric", month: "short", day: "numeric" })}</>}
                </div>
              </div>
              <ShieldCheck className="h-5 w-5" style={{ color: "var(--sage)" }} />
            </div>
          )}
        </div>
      </header>

      {article.cover_url && (
        <div className="mx-auto max-w-[680px] px-5 pt-8">
          <div className="overflow-hidden rounded-3xl border border-border">
            <img src={article.cover_url} alt={title} className="w-full" loading="eager" />
          </div>
        </div>
      )}

      {/* BODY */}
      <section className="mx-auto max-w-[680px] px-5 py-10">
        <EditorialBody body={body} lang={lang} />
      </section>

      {/* SOURCES */}
      {Array.isArray(article.sources) && article.sources.length > 0 && (
        <section className="mx-auto max-w-[680px] px-5 py-6">
          <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">{t("article.sources")}</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {(article.sources as { title: string; url: string }[]).map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-foreground hover:text-primary">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  <span>{s.title}</span>
                  <ExternalLink className="mt-0.5 h-3 w-3 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* FEEDBACK */}
      <section className="mx-auto max-w-[680px] px-5 py-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">{t("article.helpful.q")}</p>
          {feedback ? (
            <p className="mt-2 text-sm text-muted-foreground">{t("article.helpful.thanks")}</p>
          ) : (
            <div className="mt-3 flex gap-2">
              <button onClick={() => sendFeedback("yes")} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                <ThumbsUp className="h-4 w-4" style={{ color: "var(--sage)" }} /> {t("article.helpful.yes")}
              </button>
              <button onClick={() => sendFeedback("no")} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                <ThumbsDown className="h-4 w-4 text-muted-foreground" /> {t("article.helpful.no")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SHARE + DISCLAIMER */}
      <section className="mx-auto max-w-[680px] px-5 pb-4">
        <a
          href={waShare} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-4 w-4" /> {t("article.share.wa")}
        </a>
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("article.disclaimer")}
        </p>
      </section>

      {/* RELATED */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <h2 className="text-xl">{t("article.related")}</h2>
        {(relatedQ.data?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">—</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {(relatedQ.data ?? []).map((a) => <ArticleCard key={a.id} a={a} lang={lang} />)}
          </div>
        )}
      </section>

      {/* CTAs */}
      <section className="mx-auto max-w-[680px] grid gap-3 px-5 pb-16 sm:grid-cols-2">
        <Link to="/qa" className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary/40">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>{t("home.qa.eyebrow")}</p>
            <p className="mt-1 text-sm font-semibold">{t("home.qa.cta")}</p>
          </div>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </Link>
        <a
          href="https://whatsapp.com/channel/your-channel" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">{t("home.wa.eyebrow")}</p>
            <p className="mt-1 text-sm font-semibold">{t("wa.cta")}</p>
          </div>
          <MessageCircle className="h-5 w-5" />
        </a>
      </section>
    </article>
  );
}

/**
 * Renders body as editorial prose.
 * Markers:
 *   "> "  → pull quote (terracotta left border)
 *   "!> " → expert insight (sage panel)
 *   "## " → H2 section heading
 */
function EditorialBody({ body, lang }: { body: string; lang: Lang }) {
  const blocks = (body || "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const fontFamily = lang === "hi" ? "var(--font-hindi)" : "var(--font-body)";
  const fontSize = lang === "hi" ? "18px" : "16px";

  return (
    <div className="prose-editorial space-y-6" style={{ fontFamily, fontSize, lineHeight: 1.8, color: "var(--foreground)" }}>
      {blocks.length === 0 && <p className="text-muted-foreground">—</p>}
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i} className="!text-2xl !leading-tight pt-2">{block.slice(3)}</h2>;
        }
        if (block.startsWith("!> ")) {
          return (
            <aside key={i} className="rounded-2xl p-5"
              style={{
                backgroundColor: "color-mix(in oklab, var(--sage) 14%, transparent)",
                borderLeft: "4px solid var(--sage)",
              }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sage)" }}>
                ✦ Expert insight
              </p>
              <p className="mt-2">{block.slice(3)}</p>
            </aside>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote key={i} className="pl-5 italic"
              style={{ borderLeft: "4px solid var(--terracotta)", color: "var(--foreground)", fontFamily: "var(--font-display)", fontSize: "1.25rem", lineHeight: 1.5 }}>
              {block.slice(2)}
            </blockquote>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}