import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { Myth } from "@/lib/site-settings";
import { MYTH_CATEGORIES } from "@/lib/myth-categories";
import { MythCard } from "@/components/myth/MythCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/myth")({
  head: () => ({
    meta: [
      { title: "Myth Ya Sach? — Speakeasy India" },
      { name: "description", content: "Common sexual wellness myths corrected by clinicians. Hindi + English." },
      { property: "og:title", content: "Myth Ya Sach? — Speakeasy India" },
      { property: "og:description", content: "Common sexual wellness myths corrected by clinicians. Hindi + English." },
      { property: "og:url", content: "/myth" },
    ],
    links: [{ rel: "canonical", href: "/myth" }],
  }),
  component: MythLayout,
});

function MythLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/myth") return <Outlet />;
  return <MythHub />;
}

function MythHub() {
  const { t, lang } = useI18n();
  const [cat, setCat] = useState<string>("all");

  const mythsQ = useQuery({
    queryKey: ["myths", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("myths")
        .select("id,slug,myth,myth_hi,fact,fact_hi,myth_statement_hi,myth_statement_en,truth_statement_hi,truth_statement_en,category")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return (data ?? []) as Myth[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const filtered = useMemo(() => {
    const list = mythsQ.data ?? [];
    if (cat === "all") return list;
    return list.filter((m) => m.category === cat);
  }, [mythsQ.data, cat]);

  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-border/70"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, #C0392B 14%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#C0392B" }}>
            {t("myth.breadcrumb")}
          </p>
          <h1
            className="mt-2 text-4xl leading-[1.05]"
            style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}
          >
            {t("myth.hub.title")}
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">{t("myth.hub.subtitle")}</p>
        </div>
      </section>

      {/* FILTER PILLS */}
      <section className="sticky top-14 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-[680px] overflow-x-auto px-5 py-3">
          <div className="flex gap-2">
            {MYTH_CATEGORIES.map((c) => {
              const active = cat === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCat(c.slug)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-transparent text-white"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { backgroundColor: "#C0392B" } : undefined}
                >
                  {lang === "hi" ? c.hi : c.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MYTH GRID */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        {mythsQ.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 animate-pulse" style={{ borderLeft: "4px solid #C0392B" }}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-2/3" />
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
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
            {t("myth.empty")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((m) => (
              <MythCard key={m.id} m={m} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}