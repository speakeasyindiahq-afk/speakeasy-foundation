import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings, settingString, type Expert } from "@/lib/site-settings";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Speakeasy India" },
      { name: "description", content: "Our mission, founder note, advisory board, and values. India-first sexual wellness education." },
      { property: "og:title", content: "About — Speakeasy India" },
      { property: "og:description", content: "Trust-first, India-first sexual wellness education." },
      { property: "og:url", content: "https://speakeasyindia.online/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "About — Speakeasy India" },
      { name: "twitter:description", content: "Our mission, founder note, advisory board, and values." },
    ],
    links: [{ rel: "canonical", href: "https://speakeasyindia.online/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { lang } = useI18n();
  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const expertsQ = useQuery({
    queryKey: ["experts", "active_details"],
    queryFn: async () => {
      const { data } = await supabase
        .from("experts")
        .select("id,name,credentials,city,bio,avatar_url")
        .eq("active", true);
      return (data ?? []) as Expert[];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  const s = settingsQ.data ?? {};
  const experts = expertsQ.data ?? [];
  const loading = settingsQ.isLoading || expertsQ.isLoading;

  const mission = settingString(s, lang === "hi" ? "about_mission_hi" : "about_mission_en");
  const founder = settingString(s, lang === "hi" ? "founder_note_hi" : "founder_note_en");
  const notList = (s[lang === "hi" ? "what_we_are_not_hi" : "what_we_are_not_en"] as string[]) ?? [];
  const press = settingString(s, "contact_press_email", "press@speakeasyindia.org");

  const values = lang === "hi"
    ? [
        { t: "गोपनीयता", d: "आपकी पहचान सुरक्षित। न्यूनतम डेटा।" },
        { t: "सटीकता", d: "चिकित्सकीय रूप से समीक्षित सामग्री।" },
        { t: "बिना शर्म", d: "निर्णय-मुक्त, सम्मानजनक भाषा।" },
        { t: "सुलभता", d: "द्विभाषी, कम बैंडविड्थ, मोबाइल-पहले।" },
        { t: "भारत-प्रथम", d: "हमारी संस्कृति के लिए प्रासंगिक।" },
      ]
    : [
        { t: "Privacy", d: "Your identity protected. Minimal data." },
        { t: "Accuracy", d: "Clinician-reviewed content." },
        { t: "No shame", d: "Judgement-free, respectful language." },
        { t: "Accessibility", d: "Bilingual, low-bandwidth, mobile-first." },
        { t: "India-first", d: "Relevant to our cultural context." },
      ];

  return (
    <main className="mx-auto max-w-[880px] px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
          {lang === "hi" ? "हमारे बारे में" : "About"}
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "ईमानदार शिक्षा। बिना शर्म।" : "Honest education. Without shame."}
        </h1>
      </header>

      <Section title={lang === "hi" ? "हमारा मिशन" : "Our mission"}>
        <p className="text-lg leading-relaxed text-foreground/90">{mission}</p>
      </Section>

      <Section title={lang === "hi" ? "संस्थापक का संदेश" : "A note from the founder"}>
        <blockquote
          className="rounded-2xl border p-6 text-lg leading-relaxed italic"
          style={{
            backgroundColor: "color-mix(in oklab, var(--terracotta) 8%, var(--background))",
            borderColor: "color-mix(in oklab, var(--terracotta) 30%, transparent)",
          }}
        >
          {founder}
        </blockquote>
      </Section>

      <Section title={lang === "hi" ? "सलाहकार बोर्ड" : "Advisory & expert board"}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-4 animate-pulse">
                <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3.5 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : experts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {lang === "hi" ? "जल्द ही जोड़ा जा रहा है।" : "Being added soon."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {experts.map((ex) => (
              <div key={ex.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                  {ex.avatar_url && <img src={ex.avatar_url} alt={ex.name} className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div>
                  <p className="font-semibold">{ex.name}</p>
                  {ex.credentials && <p className="text-xs text-muted-foreground">{ex.credentials}</p>}
                  {ex.city && <p className="mt-1 text-xs text-muted-foreground">{ex.city}</p>}
                  {ex.bio && <p className="mt-2 text-sm">{ex.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={lang === "hi" ? "हमारे मूल्य" : "Our values"}>
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.t} className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold" style={{ color: "var(--sage)" }}>{v.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={lang === "hi" ? "हम क्या नहीं हैं" : "What we are not"}>
        <ul className="space-y-2">
          {notList.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <span className="mt-0.5 text-red-600">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={lang === "hi" ? "मीडिया संपर्क" : "Press contact"}>
        <p className="text-sm text-muted-foreground">
          {lang === "hi" ? "मीडिया पूछताछ के लिए: " : "For press inquiries: "}
          <a href={`mailto:${press}`} className="font-semibold" style={{ color: "var(--terracotta)" }}>{press}</a>
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      {children}
    </section>
  );
}