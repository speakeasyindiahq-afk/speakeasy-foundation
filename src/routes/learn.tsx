import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/learn/ArticleCard";
import type { Article } from "@/lib/site-settings";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Speakeasy India" },
      { name: "description", content: "Medically-reviewed sexual health lessons across 8 essential topics." },
      { property: "og:title", content: "Learn — Speakeasy India" },
      { property: "og:description", content: "Medically-reviewed sexual health lessons across 8 essential topics." },
      { property: "og:url", content: "/learn" },
    ],
    links: [{ rel: "canonical", href: "/learn" }],
  }),
  component: LearnLayout,
});

function LearnLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/learn" && path !== "/learn/") return <Outlet />;
  return <Learn />;
}

function Learn() {
  const { t, lang } = useI18n();

  const countsQ = useQuery({
    queryKey: ["articles", "counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      await Promise.all(CATEGORIES.map(async (c) => {
        const { count } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("category", c.slug)
          .eq("status", "published");
        counts[c.slug] = count ?? 0;
      }));
      return counts;
    },
  });

  const recentQ = useQuery({
    queryKey: ["articles", "recent"],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("*")
        .eq("status", "published").order("created_at", { ascending: false }).limit(6);
      return (data ?? []) as Article[];
    },
  });

  const popularQ = useQuery({
    queryKey: ["articles", "popular"],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("*")
        .eq("status", "published").order("view_count", { ascending: false }).limit(6);
      return (data ?? []) as Article[];
    },
  });

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-border/70"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 14%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
            {t("learn.breadcrumb.learn")}
          </p>
          <h1 className="mt-2 text-4xl leading-[1.1]">{t("learn.hub.title")}</h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">{t("learn.hub.subtitle")}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = String(new FormData(e.currentTarget).get("q") ?? "");
              window.location.assign(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="mt-6 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 shadow-sm focus-within:border-primary/60"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="q" type="search" placeholder={t("learn.search")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : undefined }}
            />
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <SectionHeader
          eyebrow={t("learn.allTopics")}
          title={lang === "hi" ? "विषय" : "Topics"}
          subtitle={lang === "hi" ? "अपनी रुचि का विषय चुनें।" : "Pick a topic to explore."}
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const count = countsQ.data?.[c.slug] ?? 0;
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                to="/learn/$category"
                params={{ category: c.slug }}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "color-mix(in oklab, var(--terracotta) 14%, transparent)", color: "var(--terracotta)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold leading-tight">{lang === "hi" ? c.hi : c.en}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lang === "hi" ? c.desc_hi : c.desc_en}</p>
                </div>
                <span className="text-[11px] text-muted-foreground min-h-[16px] inline-flex items-center">
                  {countsQ.isLoading ? (
                    <Skeleton className="h-3 w-12" />
                  ) : (
                    `${count} ${count === 1 ? t("learn.articleCount.one") : t("learn.articleCount.many")}`
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <SectionDivider />

      {/* RECENT */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <SectionHeader eyebrow={t("learn.recent")} title={lang === "hi" ? "ताज़ा पाठ" : "Fresh from the desk"} />
        <ArticleStrip items={recentQ.data ?? []} lang={lang} emptyLabel={t("learn.empty")} isLoading={recentQ.isLoading} />
      </section>

      <SectionDivider />

      {/* POPULAR */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <SectionHeader eyebrow={t("learn.popular")} title={lang === "hi" ? "पाठकों की पसंद" : "Reader favourites"} />
        <ArticleStrip items={popularQ.data ?? []} lang={lang} emptyLabel={t("learn.empty")} isLoading={popularQ.isLoading} />
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>{eyebrow}</p>
      <h2 className="mt-2 text-2xl leading-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function SectionDivider() {
  return (
    <div aria-hidden className="mx-auto max-w-[680px] px-5">
      <div className="flex items-center gap-3 py-1 opacity-60">
        <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--sage)" }}>✦</span>
        <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
      </div>
    </div>
  );
}

function ArticleStrip({ items, lang, emptyLabel, isLoading }: { items: Article[]; lang: "en" | "hi"; emptyLabel: string; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-12 mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.slice(0, 6).map((a) => <ArticleCard key={a.id} a={a} lang={lang} />)}
    </div>
  );
}