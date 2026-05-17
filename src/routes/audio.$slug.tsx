import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n, type Lang } from "@/lib/i18n";
import type { AudioEpisode, Expert } from "@/lib/site-settings";
import { audioCategoryLabel } from "@/lib/audio-categories";
import { StickyPlayer } from "./audio";

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

export const Route = createFileRoute("/audio/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("audio_episodes")
      .select("*, experts(*)")
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) throw notFound();
    return { ep: data as AudioEpisode & { experts?: Expert | null } };
  },
  head: ({ params, loaderData }) => {
    const ep = loaderData?.ep;
    const title = ep?.seo_title || ep?.title || "Audio — Speakeasy India";
    const desc = ep?.seo_description || ep?.description || "Audio lesson on Speakeasy India.";
    const href = `/audio/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "music.song" },
        { property: "og:url", content: href },
      ],
      links: [{ rel: "canonical", href }],
    };
  },
  component: AudioDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-[680px] px-5 py-20 text-center">
      <h1 className="text-2xl">Audio not found.</h1>
      <Link to="/audio" className="mt-4 inline-block text-sm font-semibold text-primary">
        ← Audio Hub
      </Link>
    </div>
  ),
});

function AudioDetail() {
  const { ep } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const [showTranscript, setShowTranscript] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

  const title = pick(lang, ep.title_hi, ep.title);
  const description = pick(lang, ep.description_hi, ep.description);
  const transcript = pick(lang, ep.transcript_hi, ep.transcript_en);
  const expert = (ep.experts ?? null) as Expert | null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : `/audio/${ep.slug ?? ep.id}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`🎧 ${title}\n${shareUrl}`)}`;

  return (
    <article className="pb-40">
      <header
        className="border-b border-border/70"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 12%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[680px] px-5 pt-8 pb-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">{t("learn.breadcrumb.home")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/audio" className="hover:text-foreground">Audio</Link>
            {ep.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{audioCategoryLabel(ep.category, lang)}</span>
              </>
            )}
          </nav>

          <h1
            className="mt-4 text-3xl leading-tight"
            style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}
          >
            {title}
          </h1>

          {expert && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 backdrop-blur">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundImage: expert.avatar_url ? `url(${expert.avatar_url})` : undefined,
                  backgroundSize: "cover",
                  backgroundColor: "var(--muted)",
                  color: "var(--sage)",
                }}
              >
                {!expert.avatar_url && expert.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-semibold text-foreground">
                  {t("article.reviewedBy")} {expert.name}
                </div>
                <div className="text-muted-foreground">{expert.credentials}</div>
              </div>
              <ShieldCheck className="h-5 w-5" style={{ color: "var(--sage)" }} />
            </div>
          )}

          {ep.audio_url && (
            <button
              onClick={() => setPlayerOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              ▶ {lang === "hi" ? "सुनो" : "Play episode"}
            </button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-[680px] px-5 py-10">
        {description && (
          <p
            className="text-base leading-relaxed text-foreground"
            style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-body)" }}
          >
            {description}
          </p>
        )}

        {transcript && (
          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-4">
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold"
            >
              <span>{lang === "hi" ? "ट्रांसक्रिप्ट" : "Transcript"}</span>
              <span className="text-xs text-muted-foreground">{showTranscript ? "−" : "+"}</span>
            </button>
            {showTranscript && (
              <div
                className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
                style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-body)" }}
              >
                {transcript}
              </div>
            )}
          </div>
        )}

        <a
          href={waShare}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="h-4 w-4" /> {t("article.share.wa")}
        </a>

        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("article.disclaimer")}
        </p>
      </section>

      {playerOpen && (
        <StickyPlayer ep={ep} lang={lang} onClose={() => setPlayerOpen(false)} />
      )}
    </article>
  );
}