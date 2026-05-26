import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, X, BookOpen, AlertCircle, Headphones, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Speakeasy India" },
      { name: "description", content: "Search articles, myths, audio lessons, and anonymous Q&A across Speakeasy India." },
      { property: "og:title", content: "Search — Speakeasy India" },
      { property: "og:description", content: "Search articles, myths, audio lessons, and anonymous Q&A across Speakeasy India." },
      { property: "og:url", content: "https://speakeasyindia.online/search" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Search — Speakeasy India" },
      { name: "twitter:description", content: "Search articles, myths, audio lessons, and anonymous Q&A across Speakeasy India." },
    ],
    links: [{ rel: "canonical", href: "https://speakeasyindia.online/search" }],
  }),
  component: SearchPage,
});

type ResultType = "learn" | "myths" | "qa" | "audio";
type Result = {
  type: ResultType;
  id: string;
  title: string;
  excerpt?: string | null;
  href: string;
  category?: string | null;
};

const RECENT_KEY = "speakeasy.search.recent";
const MAX_RECENT = 6;

const SUGGESTED = ["Consent", "Contraception", "STI", "Periods", "Pregnancy", "Relationships", "Body image", "LGBTQ+"];

function SearchPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ResultType | "all">("all");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}

    // Read q parameter from URL on mount
    try {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get("q");
      if (queryParam) {
        setQ(queryParam);
      }
    } catch {}
  }, []);

  // Update URL search parameter when q changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const term = q.trim();
      if (term) {
        url.searchParams.set("q", term);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {}
  }, [q]);

  const saveRecent = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    const next = [cleaned, ...recent.filter((r) => r.toLowerCase() !== cleaned.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  };

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const handle = setTimeout(async () => {
      const res = await runSearch(term);
      setResults(res);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  const filtered = useMemo(
    () => (filter === "all" ? results : results.filter((r) => r.type === filter)),
    [results, filter],
  );

  const counts = useMemo(() => {
    const c: Record<ResultType | "all", number> = { all: results.length, learn: 0, myths: 0, qa: 0, audio: 0 };
    results.forEach((r) => { c[r.type]++; });
    return c;
  }, [results]);

  const tabs: Array<{ k: ResultType | "all"; label: string }> = [
    { k: "all", label: t("search.filter.all") },
    { k: "learn", label: t("search.filter.learn") },
    { k: "myths", label: t("search.filter.myths") },
    { k: "qa", label: t("search.filter.qa") },
    { k: "audio", label: t("search.filter.audio") },
  ];

  return (
    <div className="mx-auto max-w-[680px] px-5 pt-6 pb-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        {t("search.title")}
      </h1>

      <form
        onSubmit={(e) => { e.preventDefault(); saveRecent(q); }}
        className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30"
      >
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }}
          placeholder={t("search.placeholder")}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          aria-label={t("search.placeholder")}
          autoComplete="off"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {q.trim().length >= 2 && (
        <div className="mt-4 -mx-5 overflow-x-auto px-5">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const active = filter === tab.k;
              const count = counts[tab.k];
              return (
                <button
                  key={tab.k}
                  onClick={() => setFilter(tab.k)}
                  className={`min-h-11 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {count > 0 && <span className={`ml-1.5 ${active ? "opacity-80" : "opacity-60"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {q.trim().length < 2 && (
        <div className="mt-8 space-y-8">
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t("search.recent")}</h2>
                <button onClick={clearRecent} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  {t("search.clearRecent")}
                </button>
              </div>
              <ul className="mt-3 flex flex-col gap-1">
                {recent.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => { setQ(r); inputRef.current?.focus(); }}
                      className="flex w-full min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{r}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t("search.suggested")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQ(s); inputRef.current?.focus(); }}
                  className="min-h-11 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {q.trim().length >= 2 && (
        <div className="mt-6">
          {loading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3.5 w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">{t("search.noResults")}</p>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                {t("wa.cta")}
              </a>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2">
              {filtered.map((r) => (
                <ResultRow key={`${r.type}-${r.id}`} r={r} q={q} t={t} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({ r, q, t }: { r: Result; q: string; t: (k: any) => string }) {
  const Icon = r.type === "learn" ? BookOpen : r.type === "myths" ? AlertCircle : r.type === "audio" ? Headphones : MessageSquare;
  const typeLabel = t(`search.type.${r.type}`);
  return (
    <li>
      <Link
        to={r.href as any}
        className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-muted/40"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "color-mix(in oklab, var(--terracotta) 12%, transparent)", color: "var(--terracotta)" }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <span>{typeLabel}</span>
              {r.category && <span aria-hidden>·</span>}
              {r.category && <span className="truncate">{r.category}</span>}
            </div>
            <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">
              <Highlight text={r.title} q={q} />
            </h3>
            {r.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                <Highlight text={r.excerpt} q={q} />
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const term = q.trim();
  if (!term) return <>{text}</>;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase()
          ? <mark key={i} className="rounded bg-[color-mix(in_oklab,var(--terracotta)_22%,transparent)] px-0.5 text-foreground">{p}</mark>
          : <span key={i}>{p}</span>,
      )}
    </>
  );
}

async function runSearch(term: string): Promise<Result[]> {
  const like = `%${term}%`;
  const safeOr = (cols: string[]) => cols.map((c) => `${c}.ilike.${like}`).join(",");
  const [articles, myths, audio, qa] = await Promise.all([
    supabase.from("articles").select("id,slug,title,title_hi,excerpt,excerpt_hi,category").eq("status", "published")
      .or(safeOr(["title", "title_hi", "excerpt", "excerpt_hi"])).limit(8),
    supabase.from("myths").select("id,slug,myth,myth_hi,fact,fact_hi,myth_statement_en,myth_statement_hi,category").eq("status", "published")
      .or(safeOr(["myth", "myth_hi", "fact", "fact_hi", "myth_statement_en", "myth_statement_hi"])).limit(8),
    supabase.from("audio_episodes").select("id,slug,title,title_hi,description,description_hi,category").eq("status", "published")
      .or(safeOr(["title", "title_hi", "description", "description_hi"])).limit(8),
    supabase.from("qa_submissions").select("id,question_en,question_hi,answer_en,answer_hi,category").eq("status", "published")
      .or(safeOr(["question_en", "question_hi", "answer_en", "answer_hi"])).limit(8),
  ]);

  const out: Result[] = [];

  (articles.data ?? []).forEach((a: any) => {
    out.push({
      type: "learn", id: a.id,
      title: a.title || a.title_hi || "Untitled",
      excerpt: a.excerpt || a.excerpt_hi || null,
      category: a.category || null,
      href: a.category && a.slug ? `/learn/${a.category}/${a.slug}` : "/learn",
    });
  });
  (myths.data ?? []).forEach((m: any) => {
    out.push({
      type: "myths", id: m.id,
      title: m.myth_statement_en || m.myth || m.myth_statement_hi || m.myth_hi || "Myth",
      excerpt: m.fact || m.fact_hi || null,
      category: m.category || null,
      href: m.slug ? `/myth/${m.slug}` : "/myth",
    });
  });
  (audio.data ?? []).forEach((au: any) => {
    out.push({
      type: "audio", id: au.id,
      title: au.title || au.title_hi || "Audio",
      excerpt: au.description || au.description_hi || null,
      category: au.category || null,
      href: au.slug ? `/audio/${au.slug}` : "/audio",
    });
  });
  (qa.data ?? []).forEach((q: any) => {
    out.push({
      type: "qa", id: q.id,
      title: q.question_en || q.question_hi || "Question",
      excerpt: q.answer_en || q.answer_hi || null,
      category: q.category || null,
      href: "/sawal-jawab",
    });
  });

  const tLow = term.toLowerCase();
  return out
    .map((r) => ({ r, score: (r.title.toLowerCase().includes(tLow) ? 2 : 0) + (r.excerpt?.toLowerCase().includes(tLow) ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);
}