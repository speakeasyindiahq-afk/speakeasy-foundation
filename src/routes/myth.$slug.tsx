import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MessageCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { Myth, Expert } from "@/lib/site-settings";
import { mythCategoryLabel } from "@/lib/myth-categories";
import { MythCard } from "@/components/myth/MythCard";
import { Skeleton } from "@/components/ui/skeleton";

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

export const Route = createFileRoute("/myth/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("myths")
      .select("*, experts(*)")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) throw notFound();
    return { myth: data as Myth };
  },
  head: ({ params, loaderData }) => {
    const m = loaderData?.myth;
    const title =
      m?.seo_title_en ||
      m?.myth_statement_en ||
      m?.myth ||
      "Myth — Speakeasy India";
    const desc =
      m?.seo_description_en ||
      m?.truth_statement_en ||
      m?.fact ||
      "Myth vs Truth, reviewed by clinicians.";
    const href = `/myth/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: href },
      ],
      links: [{ rel: "canonical", href }],
    };
  },
  component: MythPage,
  notFoundComponent: () => {
    const { t } = useI18n();
    return (
      <div className="mx-auto max-w-[680px] px-5 py-20 text-center">
        <h1 className="text-2xl">{t("myth.notfound")}</h1>
        <Link to="/myth" className="mt-4 inline-block text-sm font-semibold text-primary">
          ← {t("myth.breadcrumb")}
        </Link>
      </div>
    );
  },
});

function MythPage() {
  const { slug } = Route.useParams();
  const { myth } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const expert = (myth.experts ?? null) as Expert | null;

  const mythHi = myth.myth_statement_hi ?? myth.myth_hi ?? "";
  const truthHi = myth.truth_statement_hi ?? myth.fact_hi ?? "";
  const explanation = pick(lang, myth.explanation_hi, myth.explanation_en);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://speakeasy.in/myth/${slug}`;
  const waText = `❌ MYTH: ${mythHi || myth.myth_statement_en || myth.myth || ""}\n✅ SACH: ${truthHi || myth.truth_statement_en || myth.fact || ""}\nPoora padhein: ${shareUrl}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  const relatedQ = useQuery({
    queryKey: ["myths", "related", myth.category, slug],
    queryFn: async () => {
      let q = supabase
        .from("myths")
        .select("*")
        .eq("status", "published")
        .neq("slug", slug)
        .order("created_at", { ascending: false })
        .limit(3);
      if (myth.category) q = q.eq("category", myth.category);
      const { data } = await q;
      return (data ?? []) as Myth[];
    },
  });

  return (
    <article>
      {/* HERO */}
      <header
        className="border-b border-border/70"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, #C0392B 12%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 pt-8 pb-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              {t("learn.breadcrumb.home")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/myth" className="hover:text-foreground">
              {t("myth.breadcrumb")}
            </Link>
            {myth.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{mythCategoryLabel(myth.category, lang)}</span>
              </>
            )}
          </nav>

          <div className="mt-6">
            <MythCard m={{ ...myth, slug: null }} lang={lang} />
          </div>

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
                  <span>
                    {expert.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-semibold text-foreground">
                  {t("article.reviewedBy")} {expert.name}
                </div>
                <div className="text-muted-foreground">
                  {[expert.credentials, expert.city].filter(Boolean).join(" · ")}
                </div>
              </div>
              <ShieldCheck className="h-5 w-5" style={{ color: "var(--sage)" }} />
            </div>
          )}
        </div>
      </header>

      {/* EXPLANATION */}
      <section className="mx-auto max-w-[680px] px-5 py-10">
        <div
          className="space-y-5"
          style={{
            fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-body)",
            fontSize: lang === "hi" ? "18px" : "16px",
            lineHeight: 1.8,
          }}
        >
          {explanation
            ? explanation.split(/\n{2,}/).map((p, i) => <p key={i}>{p.trim()}</p>)
            : <p className="text-muted-foreground">—</p>}
        </div>
      </section>

      {/* SHARE + DISCLAIMER */}
      <section className="mx-auto max-w-[680px] px-5 pb-4">
        <a
          href={waShare}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-4 w-4" /> {t("myth.share.wa")}
        </a>
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("article.disclaimer")}
        </p>
      </section>

      {/* RELATED */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <h2 className="text-xl">{t("myth.related")}</h2>
        {relatedQ.isLoading ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 animate-pulse" style={{ borderLeft: "4px solid #C0392B" }}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <span className="h-px flex-1 bg-muted" />
                  <span className="text-[10px] text-muted-foreground">✦</span>
                  <span className="h-px flex-1 bg-muted" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-sage/10" />
                  <Skeleton className="h-5 w-5/6 bg-sage/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (relatedQ.data?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">—</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(relatedQ.data ?? []).map((m) => (
              <MythCard key={m.id} m={m} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* CTAs */}
      <section className="mx-auto max-w-[680px] grid gap-3 px-5 pb-16 sm:grid-cols-2">
        <Link
          to="/qa"
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--terracotta)" }}
            >
              {t("home.qa.eyebrow")}
            </p>
            <p className="mt-1 text-sm font-semibold">{t("home.qa.cta")}</p>
          </div>
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </Link>
        <a
          href="https://whatsapp.com/channel/your-channel"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
              {t("home.wa.eyebrow")}
            </p>
            <p className="mt-1 text-sm font-semibold">{t("wa.cta")}</p>
          </div>
          <MessageCircle className="h-5 w-5" />
        </a>
      </section>
    </article>
  );
}