import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, RotateCw, Share2, Headphones } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n, type Lang } from "@/lib/i18n";
import type { AudioEpisode, Expert } from "@/lib/site-settings";
import { AUDIO_CATEGORIES, audioCategoryLabel } from "@/lib/audio-categories";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/audio")({
  head: () => ({
    meta: [
      { title: "Sunke Seekho — Audio lessons | Speakeasy India" },
      { name: "description", content: "Private, low-bandwidth audio lessons on sexual wellness in Hindi and English." },
      { property: "og:title", content: "Sunke Seekho — Speakeasy India" },
      { property: "og:description", content: "Learn by listening. Expert-reviewed audio lessons." },
      { property: "og:url", content: "/audio" },
    ],
    links: [{ rel: "canonical", href: "/audio" }],
  }),
  component: AudioLayout,
});

function AudioLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/audio") return <Outlet />;
  return <AudioHub />;
}

const pick = (lang: Lang, hi?: string | null, en?: string | null) =>
  (lang === "hi" ? hi || en : en || hi) || "";

function formatDuration(secs?: number | null, mins?: number | null) {
  const s = secs ?? (mins ? mins * 60 : 0);
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function AudioHub() {
  const { lang } = useI18n();
  const [cat, setCat] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const epsQ = useQuery({
    queryKey: ["audio_episodes", "published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audio_episodes")
        .select("*, experts(name, credentials, avatar_url)")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      return (data ?? []) as (AudioEpisode & { experts?: Expert | null })[];
    },
  });

  const filtered = useMemo(() => {
    const list = epsQ.data ?? [];
    if (cat === "all") return list;
    return list.filter((e) => e.category === cat);
  }, [epsQ.data, cat]);

  const current = filtered.find((e) => e.id === playingId) ?? null;

  return (
    <>
      <section
        className="relative overflow-hidden border-b border-border/70"
        style={{ background: "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 14%, var(--ivory)) 0%, var(--ivory) 70%)" }}
      >
        <div className="mx-auto max-w-[680px] px-5 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--terracotta)" }}>
            {lang === "hi" ? "ऑडियो हब" : "Audio Hub"}
          </p>
          <h1 className="mt-2 text-4xl leading-[1.05]" style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}>
            {lang === "hi" ? "सुनके सीखो" : "Sunke Seekho"}
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            {lang === "hi"
              ? "निजी रूप से, आसानी से सुनकर सीखें। कम डेटा में भी।"
              : "Learn by listening — privately, easily, even on slow networks."}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
            <Headphones className="h-3.5 w-3.5" />
            {lang === "hi" ? "हेडफ़ोन की सिफारिश" : "Headphones recommended"}
          </p>
        </div>
      </section>

      <section className="sticky top-14 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-[680px] overflow-x-auto px-5 py-3">
          <div className="flex gap-2">
            {AUDIO_CATEGORIES.map((c) => {
              const active = cat === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCat(c.slug)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active ? "border-transparent text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { backgroundColor: "var(--terracotta)" } : undefined}
                >
                  {lang === "hi" ? c.hi : c.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[680px] px-5 py-10 pb-36">
        {epsQ.isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-4 space-y-3 animate-pulse">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-4 w-8 rounded-full" />
                </div>
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-3 w-1/3" />
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
            {lang === "hi" ? "इस श्रेणी में अभी कोई ऑडियो नहीं है।" : "No audio yet in this category."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((ep) => (
              <AudioCard key={ep.id} ep={ep} lang={lang} playing={playingId === ep.id} onPlay={() => setPlayingId(ep.id)} />
            ))}
          </div>
        )}
      </section>

      {current && <StickyPlayer ep={current} lang={lang} onClose={() => setPlayingId(null)} />}
    </>
  );
}

function AudioCard({
  ep, lang, playing, onPlay,
}: { ep: AudioEpisode & { experts?: Expert | null }; lang: Lang; playing: boolean; onPlay: () => void }) {
  const title = pick(lang, ep.title_hi, ep.title);
  const expert = ep.experts ?? null;
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "color-mix(in oklab, var(--sage) 22%, transparent)" }}>
          <Headphones className="h-5 w-5" style={{ color: "var(--sage)" }} />
        </div>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "color-mix(in oklab, var(--terracotta) 12%, transparent)", color: "var(--terracotta)" }}>
          {(ep.language ?? "en").toUpperCase()}
        </span>
      </div>
      <Link
        to="/audio/$slug"
        params={{ slug: ep.slug ?? ep.id }}
        className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug hover:text-primary"
        style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}
      >
        {title || "(untitled)"}
      </Link>
      {expert && (
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
          {expert.name}{expert.credentials ? ` · ${expert.credentials}` : ""}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{formatDuration(ep.duration_seconds, ep.duration_minutes)}</span>
        <button
          onClick={onPlay}
          aria-label="Play"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105"
          style={{ backgroundColor: "var(--terracotta)" }}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function StickyPlayer({
  ep, lang, onClose,
}: { ep: AudioEpisode & { experts?: Expert | null }; lang: Lang; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const counted = useRef(false);

  const title = pick(lang, ep.title_hi, ep.title);

  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };
  const seek = (delta: number) => {
    const a = audioRef.current; if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta));
  };
  const setSpeed = () => {
    const a = audioRef.current; if (!a) return;
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 0.75 : 1;
    a.playbackRate = next; setRate(next);
  };
  const share = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/audio/${ep.slug ?? ep.id}`;
    const text = `🎧 ${title}\n${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch { /* */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <audio
        ref={audioRef}
        src={ep.audio_url ?? undefined}
        autoPlay
        preload="none"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setPos(t);
          if (!counted.current && t > 5) {
            counted.current = true;
            void supabase.rpc("increment_audio_play", { _id: ep.id });
          }
        }}
        onEnded={() => setPlaying(false)}
      />
      <div className="mx-auto max-w-[680px] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in oklab, var(--sage) 22%, transparent)" }}>
            <Headphones className="h-4 w-4" style={{ color: "var(--sage)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold">{title}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatDuration(Math.floor(pos))} / {formatDuration(Math.floor(dur))}
            </p>
          </div>
          <button onClick={() => seek(-10)} aria-label="Back 10s" className="rounded-full p-2 text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: "var(--terracotta)" }}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>
          <button onClick={() => seek(10)} aria-label="Forward 10s" className="rounded-full p-2 text-muted-foreground hover:text-foreground">
            <RotateCw className="h-4 w-4" />
          </button>
          <button onClick={setSpeed} className="rounded-full border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
            {rate}x
          </button>
          <button onClick={share} aria-label="Share" className="rounded-full p-2 text-muted-foreground hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} aria-label="Close" className="ml-1 hidden rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground sm:inline-block">✕</button>
        </div>
        <input
          type="range" min={0} max={dur || 0} step={1} value={pos}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = v;
            setPos(v);
          }}
          className="mt-2 w-full accent-[var(--terracotta)]"
        />
        <p className="mt-1 text-center text-[10px] text-muted-foreground">{audioCategoryLabel(ep.category, lang)}</p>
      </div>
    </div>
  );
}