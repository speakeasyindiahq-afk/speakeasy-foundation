import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getCategory, CATEGORIES } from "@/lib/categories";
import { ArticleCard } from "@/components/learn/ArticleCard";
import type { Article } from "@/lib/site-settings";

export const Route = createFileRoute("/learn/$category")({
  beforeLoad: ({ params }) => {
    if (!getCategory(params.category)) throw notFound();
  },
  head: ({ params }) => {
    const c = getCategory(params.category);
    const title = c ? `${c.en} — Learn — Speakeasy India` : "Learn — Speakeasy India";
    const desc = c?.desc_en ?? "Medically-reviewed lessons.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/learn/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/learn/${params.category}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-[680px] px-5 py-16 text-center">
      <h1 className="text-2xl">Topic not found</h1>
      <Link to="/learn" className="mt-4 inline-block text-sm font-semibold text-primary">Back to Learn</Link>
    </div>
  ),
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { t, lang } = useI18n();
  const c = getCategory(category)!;
  const [sub, setSub] = useState<string | null>(null);

  const articlesQ = useQuery({
    queryKey: ["articles", "by-category", category, sub],
    queryFn: async () => {
      let q = supabase.from("articles").select("*")
        .eq("category", category).eq("status", "published")
        .order("created_at", { ascending: false });
      if (sub) q = q.eq("sub_category", sub);
      const { data } = await q;
      return (data ?? []) as Article[];
    },
  });

  return (
    <>
      <section
        className="border-b border-border/70"
        style={{
          background: "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 12%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 py-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">{t("learn.breadcrumb.home")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/learn" className="hover:text-foreground">{t("learn.breadcrumb.learn")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{lang === "hi" ? c.hi : c.en}</span>
          </nav>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{lang === "hi" ? c.hi : c.en}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{lang === "hi" ? c.desc_hi : c.desc_en}</p>

          {c.subcategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSub(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border ${sub === null ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}
              >
                {t("learn.allSubcats")}
              </button>
              {c.subcategories.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSub(s.slug)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border ${sub === s.slug ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"}`}
                >
                  {lang === "hi" ? s.hi : s.en}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[680px] px-5 py-10">
        {articlesQ.isLoading ? (
          <p className="text-sm text-muted-foreground">…</p>
        ) : (articlesQ.data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">{t("learn.empty")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {CATEGORIES.filter((x) => x.slug !== c.slug).slice(0, 4).map((x) => (
                <Link
                  key={x.slug}
                  to="/learn/$category"
                  params={{ category: x.slug }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  {lang === "hi" ? x.hi : x.en}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(articlesQ.data ?? []).map((a) => <ArticleCard key={a.id} a={a} lang={lang} />)}
          </div>
        )}
      </section>
    </>
  );
}