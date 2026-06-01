import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Search, MessageSquare, Headphones, ShieldCheck, Heart,
  Sparkles, Users, Activity, HandHeart, MessageCircle, Lock, Play, Clock,
} from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { PrivacyChip } from "@/components/PrivacyChip";
import { ContentWarning } from "@/components/ContentWarning";
import { CrisisSupport } from "@/components/CrisisSupport";
import { StickyWhatsApp } from "@/components/home/StickyWhatsApp";
import { supabase } from "@/lib/supabase";
import {
  fetchSiteSettings, settingString,
  type Article, type Myth, type AudioEpisode, type Expert,
} from "@/lib/site-settings";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Speakeasy India — Stigma-Free Sexual Wellness & Education" },
      { name: "description", content: "India's trust-first, private sexual wellness education platform. Medically-reviewed lessons, myths corrected, and anonymous Q&A in Hindi and English." },
      { property: "og:title", content: "Speakeasy India — Stigma-Free Sexual Wellness & Education" },
      { property: "og:description", content: "India's trust-first, private sexual wellness education platform. Medically-reviewed lessons, myths corrected, and anonymous Q&A." },
      { property: "og:url", content: "https://speakeasyindia.online" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Speakeasy India — Stigma-Free Sexual Wellness & Education" },
      { name: "twitter:description", content: "India's trust-first, private sexual wellness education platform. Medically-reviewed lessons, myths corrected, and anonymous Q&A." },
    ],
    links: [{ rel: "canonical", href: "https://speakeasyindia.online" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Speakeasy India",
          "url": "https://speakeasyindia.online",
          "logo": "https://speakeasyindia.online/logo.png"
        }),
      },
    ],
  }),
  component: Index,
});

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

function Index() {
  const { t, lang } = useI18n();

  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const settings = settingsQ.data ?? {};

  const articlesQ = useQuery({
    queryKey: ["articles", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id,slug,title,title_hi,excerpt,excerpt_hi,cover_url,category,created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);
      return (data ?? []) as Article[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const mythQ = useQuery({
    queryKey: ["myths", "latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("myths")
        .select("id,slug,myth,myth_hi,fact,fact_hi,myth_statement_en,myth_statement_hi,truth_statement_en,truth_statement_hi")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1);
      return ((data ?? [])[0] ?? null) as Myth | null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const audioQ = useQuery({
    queryKey: ["audio_episodes", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audio_episodes")
        .select("id,slug,title,title_hi,duration_minutes,description,audio_url")
        .eq("status", "published")
        .limit(3);
      return (data ?? []) as AudioEpisode[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const expertsQ = useQuery({
    queryKey: ["experts", "active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("experts")
        .select("id,name,avatar_url")
        .eq("active", true)
        .limit(4);
      return (data ?? []) as Expert[];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  const waUrl = settingString(settings, "whatsapp_channel_url", "https://whatsapp.com/channel/your-channel");
  const heroTitle = settingString(
    settings,
    lang === "hi" ? "hero_title_hi" : "hero_title_en",
    lang === "hi" ? "ईमानदार जवाब। बिना शर्म, बिना निर्णय।" : "Honest answers. No shame, no judgement.",
  );
  const heroSub = settingString(
    settings,
    lang === "hi" ? "hero_subtitle_hi" : "hero_subtitle_en",
    lang === "hi"
      ? "भारत के लिए चिकित्सकीय रूप से समीक्षित यौन कल्याण शिक्षा।"
      : "Medically-reviewed sexual wellness education for India.",
  );

  const topics = [
    { to: "/learn", icon: Activity, label: t("home.topics.bodies") },
    { to: "/learn", icon: HandHeart, label: t("home.topics.consent") },
    { to: "/learn", icon: ShieldCheck, label: t("home.topics.contraception") },
    { to: "/learn", icon: Heart, label: t("home.topics.relationships") },
    { to: "/learn", icon: Sparkles, label: t("home.topics.health") },
    { to: "/learn", icon: Users, label: t("home.topics.identity") },
  ];

  return (
    <>
      <ContentWarning />

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 10% 0%, color-mix(in oklab, var(--terracotta) 28%, transparent), transparent 60%), linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 18%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        {/* botanical texture */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 opacity-20"
          viewBox="0 0 200 200" fill="none"
        >
          <path d="M100 10 C 130 60, 160 80, 180 100 C 160 120, 130 140, 100 190 C 70 140, 40 120, 20 100 C 40 80, 70 60, 100 10 Z"
            stroke="var(--terracotta)" strokeWidth="1.2" />
          <path d="M100 30 C 120 70, 140 90, 160 100" stroke="var(--sage)" strokeWidth="1" />
          <path d="M100 30 C 80 70, 60 90, 40 100" stroke="var(--sage)" strokeWidth="1" />
        </svg>
        <svg aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 opacity-15" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="var(--sage)" strokeDasharray="2 6" />
          <circle cx="100" cy="100" r="50" stroke="var(--terracotta)" strokeDasharray="2 6" />
        </svg>

        <div className="relative mx-auto max-w-[680px] px-5 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <PrivacyChip />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
            {t("home.eyebrow")}
          </p>
          <h1
            className="mt-3 text-[2.25rem] leading-[1.1] sm:text-5xl"
            style={{ fontFamily: "var(--font-hindi)" }}
          >
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{heroSub}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95"
            >
              {t("home.cta.learn")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/qa"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-card"
            >
              {t("home.cta.qa")}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--sage)" }} /> {t("home.qa.privacy3")}</span>
            <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" style={{ color: "var(--sage)" }} /> {t("privacy.chip")}</span>
            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" style={{ color: "var(--sage)" }} /> 18+</span>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="border-y border-border/70 bg-card/60">
        <div className="mx-auto max-w-[680px] px-5 py-6">
          <form
            onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const q = String(f.get("q") ?? ""); window.location.assign(`/search?q=${encodeURIComponent(q)}`); }}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 shadow-sm focus-within:border-primary/60"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder={t("home.search.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : undefined }}
            />
            <button type="submit" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
              {t("nav.search")}
            </button>
          </form>
        </div>
      </section>

      {/* TOPICS */}
      <section className="mx-auto max-w-[680px] px-5 pt-12 pb-10">
        <SectionHeader eyebrow={t("nav.learn")} title={t("home.topics.title")} subtitle={t("home.topics.subtitle")} />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {topics.map((tp) => (
            <Link
              key={tp.label}
              to={tp.to}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "color-mix(in oklab, var(--terracotta) 14%, transparent)", color: "var(--terracotta)" }}
              >
                <tp.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold leading-tight">{tp.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* FEATURED ARTICLES */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <SectionHeader eyebrow={t("nav.learn")} title={t("home.featured.title")} subtitle={t("home.featured.subtitle")} />
        <div className="mt-6 -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {articlesQ.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[260px] flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-w-0">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-12 mt-3" />
                </div>
              </div>
            ))
          ) : (
            (articlesQ.data ?? placeholderArticles).map((a) => {
              const hasLink = !!(a.category && a.slug);
              const CardContent = (
                <>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[color-mix(in_oklab,var(--terracotta)_12%,var(--ivory))]">
                    {a.cover_url && (
                      <img
                        src={a.cover_url}
                        alt={pick(lang, a.title_hi, a.title)}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    {a.category && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>{a.category}</span>}
                    <h3 className="mt-1 text-base font-semibold leading-snug">{pick(lang, a.title_hi, a.title)}</h3>
                    {(a.excerpt || a.excerpt_hi) && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pick(lang, a.excerpt_hi, a.excerpt)}</p>
                    )}
                    {hasLink ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--terracotta)" }}>
                        {t("home.featured.read")} <ArrowRight className="h-3 w-3" />
                      </span>
                    ) : (
                      <Link to="/learn" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--terracotta)" }}>
                        {t("home.featured.read")} <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </>
              );

              if (hasLink) {
                return (
                  <Link
                    key={a.id}
                    to="/learn/$category/$slug"
                    params={{ category: a.category!, slug: a.slug! }}
                    className="min-w-[260px] flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-w-0"
                  >
                    {CardContent}
                  </Link>
                );
              }

              return (
                <article
                  key={a.id}
                  className="min-w-[260px] flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-w-0"
                >
                  {CardContent}
                </article>
              );
            })
          )}
        </div>
      </section>

      <SectionDivider />

      {/* MYTH OF THE WEEK */}
      <section className="px-5 py-12" style={{ backgroundColor: "color-mix(in oklab, var(--terracotta) 8%, var(--background))" }}>
        <div className="mx-auto max-w-[680px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
            {t("home.myth.eyebrow")}
          </p>
          {mythQ.isLoading ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-sm animate-pulse">
              <div className="grid sm:grid-cols-2">
                <div className="p-6 space-y-3 bg-[color-mix(in_oklab,var(--destructive)_8%,transparent)]">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-5/6 bg-destructive/10" />
                  <Skeleton className="h-6 w-3/4 bg-destructive/10" />
                </div>
                <div className="p-6 space-y-3 bg-[color-mix(in_oklab,var(--sage)_10%,transparent)]">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-5/6 bg-sage/10" />
                  <Skeleton className="h-6 w-3/4 bg-sage/10" />
                </div>
              </div>
            </div>
          ) : (() => {
            const m = mythQ.data ?? placeholderMyth;
            const Inner = (
              <div className="grid sm:grid-cols-2">
                <div className="p-6" style={{ backgroundColor: "color-mix(in oklab, var(--destructive) 8%, transparent)" }}>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">❌ {t("home.myth.myth")}</span>
                  <p className="mt-3 text-lg leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                    {pick(lang, m.myth_hi, m.myth)}
                  </p>
                </div>
                <div className="p-6" style={{ backgroundColor: "color-mix(in oklab, var(--sage) 10%, transparent)" }}>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sage)" }}>✅ {t("home.myth.fact")}</span>
                  <p className="mt-3 text-lg leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                    {pick(lang, m.fact_hi, m.fact)}
                  </p>
                </div>
              </div>
            );

            if (m.slug) {
              return (
                <Link
                  to="/myth/$slug"
                  params={{ slug: m.slug }}
                  className="mt-4 block overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                >
                  {Inner}
                </Link>
              );
            }

            return (
              <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                {Inner}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ANONYMOUS Q&A */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-[680px] overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>{t("home.qa.eyebrow")}</p>
          <h2 className="mt-3 text-3xl leading-tight">{t("home.qa.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("home.qa.body")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[t("home.qa.privacy1"), t("home.qa.privacy2"), t("home.qa.privacy3")].map((p) => (
              <span key={p} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs">
                <Lock className="h-3 w-3" style={{ color: "var(--sage)" }} /> {p}
              </span>
            ))}
          </div>
          <Link to="/qa" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            <MessageSquare className="h-4 w-4" /> {t("home.qa.cta")}
          </Link>
        </div>
      </section>

      <SectionDivider />

      {/* AUDIO */}
      <section className="mx-auto max-w-[680px] px-5 py-12">
        <SectionHeader eyebrow={t("nav.audio")} title={t("home.audio.title")} subtitle={t("home.audio.subtitle")} />
        <div className="mt-6 -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {audioQ.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[240px] flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))
          ) : (
            (audioQ.data ?? placeholderAudio).map((ep) => (
              <Link
                key={ep.id}
                to="/audio/$slug"
                params={{ slug: ep.slug ?? ep.id }}
                className="min-w-[240px] flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:min-w-0 block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: "var(--terracotta)" }}>
                    <Play className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-semibold">{pick(lang, ep.title_hi, ep.title)}</h3>
                    {ep.duration_minutes != null && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {ep.duration_minutes} {t("home.audio.minutes")}
                      </span>
                    )}
                  </div>
                </div>
                {ep.description && <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{ep.description}</p>}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* TRUST */}
      <section className="px-5 py-14" style={{ backgroundColor: "color-mix(in oklab, var(--sage) 14%, var(--background))" }}>
        <div className="mx-auto max-w-[680px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--sage)" }}>{t("home.trust.eyebrow")}</p>
          <h2 className="mt-3 text-3xl leading-tight">{t("home.trust.title")}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("home.trust.body")}</p>

          {expertsQ.isLoading ? (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-full border-2 border-background" />
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {(expertsQ.data ?? placeholderExperts).map((ex) => (
                  <div
                    key={ex.id}
                    title={ex.name}
                    className="h-12 w-12 overflow-hidden rounded-full border-2 border-background bg-card text-center text-xs font-semibold flex items-center justify-center text-[var(--sage)]"
                  >
                    {ex.avatar_url ? (
                      <img
                        src={ex.avatar_url}
                        alt={ex.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>{ex.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{(expertsQ.data ?? placeholderExperts).length}+ {lang === "hi" ? "विशेषज्ञ" : "experts"}</div>
                <div className="text-muted-foreground">{lang === "hi" ? "डॉक्टर · परामर्शदाता · शिक्षक" : "Doctors · counsellors · educators"}</div>
              </div>
            </div>
          )}

          <div className="mt-8"><CrisisSupport /></div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-[680px] overflow-hidden rounded-3xl p-8 text-white shadow-md" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">{t("home.wa.eyebrow")}</p>
          <h2 className="mt-2 text-3xl leading-tight" style={{ color: "white" }}>{t("home.wa.title")}</h2>
          <p className="mt-3 max-w-md opacity-95">{t("home.wa.body")}</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold"
            style={{ color: "#128C7E" }}
          >
            <MessageCircle className="h-4 w-4" /> {t("wa.cta")}
          </a>
        </div>
      </section>

      <StickyWhatsApp href={waUrl} />
    </>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>{eyebrow}</p>
      <h2 className="mt-2 text-3xl leading-tight">{title}</h2>
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

// Fallbacks shown when tables are empty / not yet provisioned.
const placeholderArticles: Article[] = [
  { id: "p1", title: "Understanding consent", title_hi: "सहमति को समझना", excerpt: "What yes really means.", excerpt_hi: "हाँ का असली मतलब।", category: "Consent", created_at: "" },
  { id: "p2", title: "Contraception basics", title_hi: "गर्भनिरोध की मूल बातें", excerpt: "Options, myths, and facts.", excerpt_hi: "विकल्प, मिथक और तथ्य।", category: "Health", created_at: "" },
  { id: "p3", title: "Talking to your partner", title_hi: "साथी से बात करना", excerpt: "Open conversations help.", excerpt_hi: "खुली बातचीत मदद करती है।", category: "Relationships", created_at: "" },
];
const placeholderMyth: Myth = {
  id: "pm",
  myth: "You can't get pregnant the first time.",
  myth_hi: "पहली बार में गर्भधारण नहीं हो सकता।",
  fact: "Pregnancy is possible any time unprotected sex occurs.",
  fact_hi: "बिना सुरक्षा के संबंध बनने पर किसी भी समय गर्भधारण संभव है।",
  created_at: "",
};
const placeholderAudio: AudioEpisode[] = [
  { id: "a1", title: "What is consent?", title_hi: "सहमति क्या है?", duration_minutes: 7, created_at: "" },
  { id: "a2", title: "Periods 101", title_hi: "मासिक धर्म 101", duration_minutes: 9, created_at: "" },
  { id: "a3", title: "Safer sex basics", title_hi: "सुरक्षित संबंध की बातें", duration_minutes: 6, created_at: "" },
];
const placeholderExperts: Expert[] = [
  { id: "e1", name: "Dr. A" }, { id: "e2", name: "Dr. B" }, { id: "e3", name: "Ms. C" }, { id: "e4", name: "Dr. D" },
];