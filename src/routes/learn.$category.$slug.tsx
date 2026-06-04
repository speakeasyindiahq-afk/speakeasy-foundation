import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ChevronRight, MessageCircle, MessageSquare, ThumbsUp, ThumbsDown, ShieldCheck, ExternalLink } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getCategory, categoryLabel } from "@/lib/categories";
import { ArticleCard } from "@/components/learn/ArticleCard";
import type { Article, Expert } from "@/lib/site-settings";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
    const titleEn = a?.seo_title || a?.title || "";
    const titleHi = a?.seo_title_hi || a?.title_hi || "";
    const title = titleHi && titleEn && titleHi !== titleEn
      ? `${titleHi} | ${titleEn}`
      : (titleHi || titleEn || "Article — Speakeasy India");

    const descEn = a?.seo_description || a?.excerpt || "";
    const descHi = a?.seo_description_hi || a?.excerpt_hi || "";
    const desc = descHi && descEn && descHi !== descEn
      ? `${descHi} / ${descEn}`
      : (descHi || descEn || "Medically-reviewed educational article.");
    const href = `https://speakeasyindia.online/learn/${params.category}/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: href },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(a?.cover_url ? [
          { property: "og:image", content: a.cover_url },
          { name: "twitter:image", content: a.cover_url }
        ] : []),
      ],
      links: [{ rel: "canonical", href }],
      scripts: a ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: desc,
          image: a.cover_url || undefined,
          datePublished: a.created_at,
          author: a.experts ? { "@type": "Person", name: a.experts.name } : undefined,
          publisher: {
            "@type": "Organization",
            name: "Speakeasy India",
            url: "https://speakeasyindia.online",
          }
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
      const { data } = await supabase.from("articles")
        .select("id,slug,title,title_hi,excerpt,excerpt_hi,cover_url,category,created_at")
        .eq("category", category).eq("status", "published")
        .neq("slug", slug)
        .order("created_at", { ascending: false }).limit(3);
      return (data ?? []) as Article[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
    : `https://speakeasyindia.online/learn/${category}/${slug}`;
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
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted text-center text-xs font-semibold flex items-center justify-center text-[var(--sage)]">
                {expert.avatar_url ? (
                  <img
                    src={expert.avatar_url}
                    alt={expert.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{expert.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                )}
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
          <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl border border-border bg-[color-mix(in_oklab,var(--terracotta)_10%,var(--ivory))]">
            <img src={article.cover_url} alt={title} className="h-full w-full object-cover" loading="eager" />
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
        {relatedQ.isLoading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm space-y-2 animate-pulse">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-10 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (relatedQ.data?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">—</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {(relatedQ.data ?? []).map((a) => <ArticleCard key={a.id} a={a} lang={lang} />)}
          </div>
        )}
        <div className="mt-8 border-t border-border/60 pt-6">
          <h3 className="text-sm font-semibold text-foreground">
            {lang === "hi" ? "संबंधित माध्यम" : "Explore other formats"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/myth"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/40 hover:text-primary transition"
            >
              ❓ {lang === "hi" ? "मिथक और सच" : "Myths vs Facts"}
            </Link>
            <Link
              to="/audio"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/40 hover:text-primary transition"
            >
              🎧 {lang === "hi" ? "ऑडियो पाठ" : "Audio Lessons"}
            </Link>
          </div>
        </div>
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

type ListItem = {
  text: string;
  indent: number;
  listType: "ul" | "ol";
};

function parseInline(text: string): React.ReactNode {
  if (!text) return "";
  
  const regex = /(\*\*.*?\*\*|__.*?__|`.*?`|\[.*?\]\(.*?\)|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, index) => {
        if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
          const content = part.slice(2, -2);
          return <strong key={index} className="font-bold text-foreground">{parseInline(content)}</strong>;
        }
        if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
          const content = part.slice(1, -1);
          return <em key={index} className="italic">{parseInline(content)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="font-mono text-xs sm:text-sm bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded text-primary">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("[") && part.includes("](")) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [, linkText, url] = match;
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 decoration-primary/50 transition font-semibold"
              >
                {parseInline(linkText)}
              </a>
            );
          }
        }
        return part;
      })}
    </>
  );
}

function renderListTree(items: ListItem[]): React.ReactNode {
  if (items.length === 0) return null;

  const renderGroup = (startIndex: number, currentIndent: number): { elements: React.ReactNode[]; nextIndex: number } => {
    const elements: React.ReactNode[] = [];
    let i = startIndex;

    while (i < items.length) {
      const item = items[i];
      if (item.indent < currentIndent) {
        break;
      }

      if (item.indent > currentIndent) {
        const subListType = item.listType;
        const subResult = renderGroup(i, item.indent);
        const sublist = subListType === "ol" 
          ? <ol className="list-decimal pl-6 mt-1 space-y-1 marker:text-primary">{subResult.elements}</ol> 
          : <ul className="list-disc pl-6 mt-1 space-y-1 marker:text-primary">{subResult.elements}</ul>;
        
        if (elements.length > 0) {
          const lastIndex = elements.length - 1;
          const lastElement = elements[lastIndex];
          elements[lastIndex] = (
            <div key={lastIndex} className="space-y-1">
              {lastElement}
              {sublist}
            </div>
          );
        } else {
          elements.push(<li key={`sub-${i}`} className="list-none">{sublist}</li>);
        }
        i = subResult.nextIndex;
        continue;
      }

      const itemText = item.text;
      let childrenNode: React.ReactNode = null;
      if (i + 1 < items.length && items[i + 1].indent > currentIndent) {
        const subResult = renderGroup(i + 1, items[i + 1].indent);
        const subListType = items[i + 1].listType;
        childrenNode = subListType === "ol"
          ? <ol className="list-decimal pl-6 mt-1 space-y-1 marker:text-primary">{subResult.elements}</ol>
          : <ul className="list-disc pl-6 mt-1 space-y-1 marker:text-primary">{subResult.elements}</ul>;
        i = subResult.nextIndex - 1;
      }

      elements.push(
        <li key={i} className="pl-1 text-foreground/90 leading-relaxed">
          {parseInline(itemText)}
          {childrenNode}
        </li>
      );
      i++;
    }

    return { elements, nextIndex: i };
  };

  const firstItem = items[0];
  const tree = renderGroup(0, firstItem.indent);
  return firstItem.listType === "ol"
    ? <ol className="list-decimal pl-6 space-y-2 my-4 marker:text-primary">{tree.elements}</ol>
    : <ul className="list-disc pl-6 space-y-2 my-4 marker:text-primary">{tree.elements}</ul>;
}

function parseMarkdownToBlocks(body: string): React.ReactNode[] {
  const lines = (body || "").replace(/\r\n/g, "\n").split("\n");
  const elements: React.ReactNode[] = [];

  let currentBlockType: "paragraph" | "blockquote" | "insight" | "list" | "table" | null = null;
  let accumulatedLines: string[] = [];
  let accumulatedListItems: ListItem[] = [];

  const closeCurrentBlock = () => {
    if (!currentBlockType) return;

    const blockKey = elements.length;
    if (currentBlockType === "paragraph") {
      elements.push(
        <p key={blockKey} className="leading-relaxed whitespace-pre-line my-4 text-foreground/90 font-normal">
          {parseInline(accumulatedLines.join("\n"))}
        </p>
      );
    } else if (currentBlockType === "blockquote") {
      elements.push(
        <blockquote key={blockKey} className="pl-5 italic border-l-4 my-6 py-1"
          style={{ borderLeftColor: "var(--terracotta)", color: "var(--foreground)", fontFamily: "var(--font-display)", fontSize: "1.25rem", lineHeight: 1.5 }}>
          {accumulatedLines.map((line, idx) => (
            <p key={idx} className={idx > 0 ? "mt-2" : ""}>
              {parseInline(line)}
            </p>
          ))}
        </blockquote>
      );
    } else if (currentBlockType === "insight") {
      elements.push(
        <aside key={blockKey} className="rounded-2xl p-5 my-6 border-l-4"
          style={{
            backgroundColor: "color-mix(in oklab, var(--sage) 14%, transparent)",
            borderLeftColor: "var(--sage)",
          }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sage)" }}>
            ✦ Expert insight
          </p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">
            {accumulatedLines.map((line, idx) => (
              <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                {parseInline(line)}
              </p>
            ))}
          </div>
        </aside>
      );
    } else if (currentBlockType === "list") {
      elements.push(
        <div key={blockKey} className="my-4">
          {renderListTree(accumulatedListItems)}
        </div>
      );
    } else if (currentBlockType === "table") {
      const tableRows: string[][] = [];
      let alignments: ("left" | "center" | "right" | undefined)[] = [];
      let headerCells: string[] = [];

      for (let j = 0; j < accumulatedLines.length; j++) {
        const line = accumulatedLines[j];
        const trimmed = line.trim();
        
        const isSeparator = /^[|\s:-]+$/.test(trimmed) && trimmed.includes("-");
        
        let cells = line.split("|").map(c => c.trim());
        if (line.startsWith("|")) {
          cells.shift();
        }
        if (line.endsWith("|") && cells.length > 0 && cells[cells.length - 1] === "") {
          cells.pop();
        }

        if (isSeparator) {
          alignments = cells.map(col => {
            if (col.startsWith(":") && col.endsWith(":")) return "center";
            if (col.startsWith(":")) return "left";
            if (col.endsWith(":")) return "right";
            return undefined;
          });
        } else {
          if (headerCells.length === 0 && j === 0) {
            headerCells = cells;
          } else {
            tableRows.push(cells);
          }
        }
      }

      const columnCount = Math.max(headerCells.length, alignments.length);
      for (let k = alignments.length; k < columnCount; k++) {
        alignments[k] = undefined;
      }

      elements.push(
        <div key={blockKey} className="w-full overflow-x-auto my-6 rounded-2xl border border-border bg-card/30 shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-foreground/90">
            {headerCells.length > 0 && (
              <thead className="bg-muted/50 border-b border-border/70">
                <tr>
                  {alignments.map((_, idx) => {
                    const cell = headerCells[idx] || "";
                    const align = alignments[idx];
                    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                    return (
                      <th
                        key={idx}
                        className={`px-4 py-3.5 font-bold text-foreground text-xs uppercase tracking-wider ${alignClass}`}
                      >
                        {parseInline(cell)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border/30">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                  {alignments.map((_, cIdx) => {
                    const cell = row[cIdx] || "";
                    const align = alignments[cIdx];
                    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                    return (
                      <td key={cIdx} className={`px-4 py-3.5 leading-relaxed ${alignClass}`}>
                        {parseInline(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    currentBlockType = null;
    accumulatedLines = [];
    accumulatedListItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      closeCurrentBlock();
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      closeCurrentBlock();
      elements.push(<h1 key={elements.length} className="text-3xl sm:text-4xl font-semibold font-display tracking-tight mt-8 mb-4 text-foreground leading-tight">{parseInline(trimmedLine.slice(2))}</h1>);
      continue;
    }
    if (trimmedLine.startsWith("## ")) {
      closeCurrentBlock();
      elements.push(<h2 key={elements.length} className="text-2xl sm:text-3xl font-semibold font-display tracking-tight mt-8 mb-4 text-foreground pt-4 border-b border-border/40 pb-1.5 leading-tight">{parseInline(trimmedLine.slice(3))}</h2>);
      continue;
    }
    if (trimmedLine.startsWith("### ")) {
      closeCurrentBlock();
      elements.push(<h3 key={elements.length} className="text-xl sm:text-2xl font-semibold font-display tracking-tight mt-6 mb-3 text-foreground leading-snug">{parseInline(trimmedLine.slice(4))}</h3>);
      continue;
    }

    if (trimmedLine.startsWith("> ")) {
      if (currentBlockType !== "blockquote") {
        closeCurrentBlock();
        currentBlockType = "blockquote";
      }
      accumulatedLines.push(trimmedLine.slice(2));
      continue;
    }

    if (trimmedLine.startsWith("!> ")) {
      if (currentBlockType !== "insight") {
        closeCurrentBlock();
        currentBlockType = "insight";
      }
      accumulatedLines.push(trimmedLine.slice(3));
      continue;
    }

    if (trimmedLine.startsWith("|")) {
      if (currentBlockType !== "table") {
        closeCurrentBlock();
        currentBlockType = "table";
      }
      accumulatedLines.push(line);
      continue;
    }

    const bulletMatch = line.match(/^(\s*)([-*])\s+(.*)$/);
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (currentBlockType !== "list") {
        closeCurrentBlock();
        currentBlockType = "list";
      }
      const indent = bulletMatch[1].length;
      const text = bulletMatch[3];
      accumulatedListItems.push({
        text,
        indent,
        listType: "ul"
      });
      continue;
    }

    if (numberMatch) {
      if (currentBlockType !== "list") {
        closeCurrentBlock();
        currentBlockType = "list";
      }
      const indent = numberMatch[1].length;
      const text = numberMatch[3];
      accumulatedListItems.push({
        text,
        indent,
        listType: "ol"
      });
      continue;
    }

    if (currentBlockType !== "paragraph") {
      closeCurrentBlock();
      currentBlockType = "paragraph";
    }
    accumulatedLines.push(line);
  }

  closeCurrentBlock();
  return elements;
}

export function EditorialBody({ body, lang }: { body: string; lang: Lang }) {
  const elements = useMemo(() => {
    return parseMarkdownToBlocks(body);
  }, [body]);

  const fontFamily = lang === "hi" ? "var(--font-hindi)" : "var(--font-body)";
  const fontSize = lang === "hi" ? "1.125rem" : "1.0625rem";

  return (
    <div className="prose prose-neutral max-w-none space-y-6" style={{ fontFamily, fontSize, lineHeight: 1.8, color: "var(--foreground)" }}>
      {elements.length === 0 ? <p className="text-muted-foreground">—</p> : elements}
    </div>
  );
}