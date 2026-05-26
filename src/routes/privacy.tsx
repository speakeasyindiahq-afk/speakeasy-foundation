import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, settingString } from "@/lib/site-settings";
import { useI18n } from "@/lib/i18n";
import { Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Speakeasy India" },
      { name: "description", content: "Plain-language privacy practices. What we collect, what we don't, and how to request data deletion." },
      { property: "og:title", content: "Privacy — Speakeasy India" },
      { property: "og:description", content: "Privacy-first. Plain language. Minimal data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const s = settingsQ.data ?? {};

  const intro = settingString(s, lang === "hi" ? "privacy_intro_hi" : "privacy_intro_en");
  const dataUse = settingString(s, lang === "hi" ? "privacy_data_use_hi" : "privacy_data_use_en");
  const never = (s[lang === "hi" ? "privacy_never_collect_hi" : "privacy_never_collect_en"] as string[]) ?? [];
  const privacyEmail = settingString(s, "contact_privacy_email", "privacy@speakeasyindia.org");

  return (
    <main className="mx-auto max-w-[760px] px-6 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sage)" }}>
          {lang === "hi" ? "गोपनीयता" : "Privacy"}
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "आपकी गोपनीयता, सरल भाषा में।" : "Your privacy, in plain words."}
        </h1>
      </header>

      <div
        className="mb-10 flex gap-3 rounded-2xl border p-5"
        style={{
          backgroundColor: "color-mix(in oklab, var(--sage) 12%, var(--background))",
          borderColor: "color-mix(in oklab, var(--sage) 35%, transparent)",
        }}
      >
        <Shield className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--sage)" }} />
        <p className="text-sm leading-relaxed">{intro}</p>
      </div>

      <Section title={lang === "hi" ? "हम क्या एकत्र करते हैं" : "What we collect"}>
        <p>{lang === "hi"
          ? "गुमनाम प्रश्न, बुनियादी पेज विश्लेषण, और यदि आप साझा करें तो ईमेल। बस इतना ही।"
          : "Anonymous questions, basic page analytics, and an email only if you choose to share one. That's it."}</p>
      </Section>

      <Section title={lang === "hi" ? "हम क्या कभी एकत्र नहीं करते" : "What we never collect"}>
        <ul className="space-y-2">
          {never.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <span className="mt-0.5 text-red-600">✕</span><span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={lang === "hi" ? "हम जानकारी का उपयोग कैसे करते हैं" : "How we use information"}>
        <p>{dataUse}</p>
      </Section>

      <Section title={lang === "hi" ? "आपके अधिकार" : "Your rights"}>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li>{lang === "hi" ? "अपने प्रश्न को हटाने का अनुरोध" : "Request deletion of your question"}</li>
          <li>{lang === "hi" ? "अपने डेटा की एक प्रति माँगना" : "Ask for a copy of your data"}</li>
          <li>{lang === "hi" ? "किसी भी समय गलतियाँ ठीक करवाना" : "Correct any mistakes at any time"}</li>
        </ul>
      </Section>

      <Section title={lang === "hi" ? "डेटा हटाने का अनुरोध" : "Data deletion request"}>
        <p>
          {lang === "hi" ? "हमें ईमेल भेजें " : "Email us at "}
          <a href={`mailto:${privacyEmail}`} className="font-semibold" style={{ color: "var(--terracotta)" }}>{privacyEmail}</a>
          {lang === "hi" ? "। हम 14 दिनों के भीतर उत्तर देते हैं।" : ". We respond within 14 days."}
        </p>
      </Section>

      <p className="mt-12 text-xs text-muted-foreground">
        {lang === "hi"
          ? "हम Speakeasy को ज़िम्मेदारी से चलाने के लिए गोपनीयता-सचेत बुनियादी ढाँचे का उपयोग करते हैं।"
          : "We use privacy-conscious infrastructure and aim to protect your information responsibly."}
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}