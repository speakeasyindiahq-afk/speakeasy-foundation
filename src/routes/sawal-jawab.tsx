import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Send, CheckCircle2, ShieldCheck, Sparkles, Phone, HeartHandshake } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import type { Expert } from "@/lib/site-settings";

export const Route = createFileRoute("/sawal-jawab")({
  head: () => ({
    meta: [
      { title: "Sawal Jawab — Anonymous Q&A — Speakeasy India" },
      {
        name: "description",
        content:
          "Ask sexual wellness questions anonymously. No name, email, or phone required. Answered by verified Indian clinicians.",
      },
      { property: "og:title", content: "Sawal Jawab — Anonymous Q&A — Speakeasy India" },
      {
        property: "og:description",
        content: "Stigma-free anonymous Q&A reviewed by Indian clinicians. Hindi + English.",
      },
      { property: "og:url", content: "/sawal-jawab" },
    ],
    links: [{ rel: "canonical", href: "/sawal-jawab" }],
  }),
  component: SawalJawab,
});

type PublishedQA = {
  id: string;
  question_en: string | null;
  question_hi: string | null;
  answer_en: string | null;
  answer_hi: string | null;
  topic_category: string | null;
  published_at: string | null;
  experts?: Expert | null;
};

const submitSchema = z.object({
  question: z.string().trim().min(15, "Please write at least 15 characters.").max(2000),
  topic_category: z.string().min(1, "Please pick a topic."),
  language: z.enum(["en", "hi"]),
  age_confirmed: z.literal(true, {
    errorMap: () => ({ message: "Please confirm you are 18 or older." }),
  }),
});

function SawalJawab() {
  const { lang } = useI18n();
  const [filter, setFilter] = useState<string>("all");

  // form state
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState(CATEGORIES[0].slug);
  const [formLang, setFormLang] = useState<"en" | "hi">(lang);
  const [age, setAge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishedQ = useQuery({
    queryKey: ["qa", "published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("qa_submissions")
        .select("id,question_en,question_hi,answer_en,answer_hi,topic_category,published_at,experts(*)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(60);
      return (data ?? []) as unknown as PublishedQA[];
    },
  });

  const filtered = useMemo(() => {
    const list = publishedQ.data ?? [];
    if (filter === "all") return list;
    return list.filter((q) => q.topic_category === filter);
  }, [publishedQ.data, filter]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = submitSchema.safeParse({
      question,
      topic_category: topic,
      language: formLang,
      age_confirmed: age,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please review the form.");
      return;
    }
    setSubmitting(true);
    const payload = {
      question_en: formLang === "en" ? parsed.data.question : null,
      question_hi: formLang === "hi" ? parsed.data.question : null,
      topic_category: parsed.data.topic_category,
      language: parsed.data.language,
      age_confirmed: true,
      status: "pending" as const,
    };
    const { error: insErr } = await supabase.from("qa_submissions").insert(payload);
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setSubmitted(true);
    setQuestion("");
    setAge(false);
  }

  const T = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <>
      {/* HERO */}
      <section
        className="border-b border-border/70"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--terracotta) 12%, var(--ivory)) 0%, var(--ivory) 70%)",
        }}
      >
        <div className="mx-auto max-w-[720px] px-5 py-12">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--terracotta)" }}
          >
            {T("Anonymous Q&A", "गुमनाम सवाल–जवाब")}
          </p>
          <h1
            className="mt-2 text-4xl leading-[1.05]"
            style={{ fontFamily: lang === "hi" ? "var(--font-hindi)" : "var(--font-display)" }}
          >
            {T("Sawal Jawab", "सवाल जवाब")}
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            {T(
              "Ask a question without giving your name, email, or phone. Verified Indian clinicians answer.",
              "बिना नाम, ईमेल या फ़ोन दिए सवाल पूछें। भारत के विशेषज्ञ डॉक्टर जवाब देंगे।",
            )}
          </p>
        </div>
      </section>

      {/* SECTION 1 — PRIVACY ASSURANCE BOX */}
      <section className="mx-auto max-w-[720px] px-5 pt-8">
        <div
          className="flex items-start gap-4 rounded-2xl border p-5"
          style={{
            backgroundColor: "color-mix(in oklab, var(--terracotta) 8%, var(--background))",
            borderColor: "color-mix(in oklab, var(--terracotta) 35%, transparent)",
          }}
        >
          <Lock className="h-6 w-6 mt-0.5" style={{ color: "var(--terracotta)" }} />
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--terracotta)" }}>
              {T("Your question is anonymous.", "आपका सवाल पूरी तरह गुमनाम है।")}
            </h2>
            <p className="mt-1 text-sm text-foreground/80">
              {T(
                "We do not ask for your name, email, or phone number. Aapka sawal anonymous hai.",
                "Aapka naam, email, ya phone nahi maanga jayega. आपका सवाल गुमनाम है।",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FORM */}
      <section className="mx-auto max-w-[720px] px-5 pt-8">
        {submitted ? (
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "color-mix(in oklab, var(--sage) 14%, var(--background))",
              borderColor: "color-mix(in oklab, var(--sage) 40%, transparent)",
            }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-0.5" style={{ color: "var(--sage)" }} />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--sage)" }}>
                  {T("Thank you.", "Shukriya!")}
                </h3>
                <p className="mt-1 text-sm text-foreground/80">
                  {T(
                    "Your question has reached our expert. After review it may be published anonymously for others to learn from.",
                    "Aapka sawal hamare expert tak pahunch gaya. Jawab review ke baad publish ho sakta hai.",
                  )}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  {T("Ask another", "एक और सवाल पूछें")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            autoComplete="off"
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <label className="block">
              <span className="text-sm font-semibold">
                {T("Your question", "आपका सवाल")}
              </span>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                maxLength={2000}
                required
                autoComplete="off"
                spellCheck={false}
                placeholder={T(
                  "Type your question here. Be as honest as you want — no one will know it’s you.",
                  "अपना सवाल यहाँ लिखें। जितना खुलकर पूछना हो पूछें — कोई नहीं जानेगा कि यह आपने पूछा।",
                )}
                className="mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-base shadow-sm outline-none focus:border-[color:var(--terracotta)]"
              />
              <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                {question.length}/2000
              </span>
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">{T("Topic", "विषय")}</span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--terracotta)]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {lang === "hi" ? c.hi : c.en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">{T("Answer me in", "जवाब चाहिए")}</span>
                <div className="mt-2 inline-flex w-full rounded-xl border border-input bg-background p-1 text-sm">
                  {(["en", "hi"] as const).map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setFormLang(l)}
                      className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition ${
                        formLang === l ? "text-white" : "text-muted-foreground"
                      }`}
                      style={formLang === l ? { backgroundColor: "var(--terracotta)" } : undefined}
                    >
                      {l === "en" ? "English" : "हिंदी"}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={age}
                onChange={(e) => setAge(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input"
                required
              />
              <span>
                {T(
                  "I confirm I am 18 years or older. Main 18+ hoon.",
                  "मैं पुष्टि करता/करती हूँ कि मेरी उम्र 18 वर्ष या उससे अधिक है। Main 18+ hoon.",
                )}
              </span>
            </label>

            {error && (
              <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                {T(
                  "No name, email, or phone collected.",
                  "नाम, ईमेल या फ़ोन नहीं लिया जाता।",
                )}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
                style={{ backgroundColor: "var(--terracotta)" }}
              >
                <Send className="h-4 w-4" />
                {submitting
                  ? T("Sending…", "भेज रहे हैं…")
                  : T("Submit Anonymously →", "गुमनाम भेजें →")}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* SECTION 3 — PROCESS VISUAL */}
      <section className="mx-auto max-w-[720px] px-5 pt-12">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {T("How it works", "कैसे काम करता है")}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { i: Send, en: "You submit anonymously", hi: "आप गुमनाम भेजते हैं" },
            { i: ShieldCheck, en: "Verified expert reviews", hi: "विशेषज्ञ समीक्षा करते हैं" },
            { i: Sparkles, en: "Published for everyone", hi: "सबके लिए प्रकाशित" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <s.i className="h-5 w-5" style={{ color: "var(--terracotta)" }} />
              <p className="mt-2 text-sm font-medium">{T(s.en, s.hi)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — ANSWERED QUESTIONS */}
      <section className="mx-auto max-w-[720px] px-5 pt-12 pb-10">
        <h3 className="text-xl font-semibold">
          {T("Answered questions", "जवाब दिए गए सवाल")}
        </h3>

        <div className="mt-4 -mx-1 flex flex-wrap gap-2">
          {[{ slug: "all", en: "All", hi: "सभी" }, ...CATEGORIES.map((c) => ({ slug: c.slug, en: c.en, hi: c.hi }))].map(
            (c) => {
              const active = filter === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setFilter(c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active ? "border-transparent text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { backgroundColor: "var(--terracotta)" } : undefined}
                >
                  {lang === "hi" ? c.hi : c.en}
                </button>
              );
            },
          )}
        </div>

        <div className="mt-5 grid gap-4">
          {publishedQ.isLoading && (
            <p className="text-sm text-muted-foreground">…</p>
          )}
          {!publishedQ.isLoading && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
              {T(
                "No published answers in this topic yet. Be the first to ask.",
                "इस विषय में अभी कोई जवाब प्रकाशित नहीं। पहला सवाल आप पूछें।",
              )}
            </p>
          )}
          {filtered.map((q) => {
            const question = lang === "hi" ? q.question_hi ?? q.question_en : q.question_en ?? q.question_hi;
            const answer = lang === "hi" ? q.answer_hi ?? q.answer_en : q.answer_en ?? q.answer_hi;
            return (
              <article key={q.id} className="rounded-2xl border border-border bg-card p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {categoryLabel(q.topic_category, lang)}
                </span>
                <p className="mt-2 italic text-foreground/90">“{question}”</p>
                {answer && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90 line-clamp-6">
                    {answer}
                  </p>
                )}
                {q.experts && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    — <span className="font-semibold text-foreground">{q.experts.name}</span>
                    {q.experts.credentials ? `, ${q.experts.credentials}` : null}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 5 — CRISIS SUPPORT */}
      <section className="mx-auto max-w-[720px] px-5 pb-16">
        <aside
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: "color-mix(in oklab, var(--sage) 14%, var(--background))",
            borderColor: "color-mix(in oklab, var(--sage) 40%, transparent)",
          }}
        >
          <div className="flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 mt-0.5" style={{ color: "var(--sage)" }} />
            <div className="flex-1">
              <h3 className="text-base font-semibold" style={{ color: "var(--sage)" }}>
                {T("Need to talk to someone right now?", "अभी किसी से बात करनी है?")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {T(
                  "Speakeasy is an educational platform, not a crisis service. These free Indian helplines are trained to support you.",
                  "Speakeasy एक शैक्षिक मंच है, संकट सेवा नहीं। ये निःशुल्क भारतीय हेल्पलाइन आपकी मदद के लिए हैं।",
                )}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
                <a href="tel:9152987821" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--sage)" }}>
                  <Phone className="h-4 w-4" /> iCall — 9152987821
                </a>
                <a href="tel:18602662345" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--sage)" }}>
                  <Phone className="h-4 w-4" /> Vandrevala — 1860-2662-345
                </a>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
