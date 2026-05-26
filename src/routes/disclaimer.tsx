import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, settingString } from "@/lib/site-settings";
import { useI18n } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Speakeasy India" },
      { name: "description", content: "Educational content only. Not medical advice. Crisis resources available." },
      { property: "og:title", content: "Disclaimer — Speakeasy India" },
      { property: "og:description", content: "Educational content. Not medical advice." },
      { property: "og:url", content: "https://speakeasyindia.online/disclaimer" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Disclaimer — Speakeasy India" },
      { name: "twitter:description", content: "Educational content only. Not medical advice. Crisis resources available." },
    ],
    links: [{ rel: "canonical", href: "https://speakeasyindia.online/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const { lang } = useI18n();
  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const s = settingsQ.data ?? {};
  const text = settingString(s, lang === "hi" ? "disclaimer_hi" : "disclaimer_en");

  return (
    <main className="mx-auto max-w-[760px] px-6 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
          {lang === "hi" ? "अस्वीकरण" : "Disclaimer"}
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "केवल शिक्षा। चिकित्सीय सलाह नहीं।" : "Education only. Not medical advice."}
        </h1>
      </header>

      <div
        className="flex gap-3 rounded-2xl border p-5"
        style={{
          backgroundColor: "color-mix(in oklab, var(--terracotta) 10%, var(--background))",
          borderColor: "color-mix(in oklab, var(--terracotta) 35%, transparent)",
        }}
      >
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--terracotta)" }} />
        <p className="text-sm leading-relaxed">{text}</p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "संकट में हैं?" : "In a crisis?"}
        </h2>
        <p className="text-sm">
          {lang === "hi" ? "हमारा " : "Visit our "}
          <Link to="/resources" className="font-semibold underline" style={{ color: "var(--sage)" }}>
            {lang === "hi" ? "संसाधन पृष्ठ" : "Resources page"}
          </Link>
          {lang === "hi" ? " देखें — हेल्पलाइन और सहायता समूह।" : " — helplines and support groups."}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "अपने निर्णय का उपयोग करें" : "Use your own judgement"}
        </h2>
        <p className="text-sm leading-relaxed">
          {lang === "hi"
            ? "हमारी सामग्री सामान्य शिक्षा है। अपनी विशिष्ट स्थिति के लिए हमेशा लाइसेंस प्राप्त चिकित्सक से परामर्श करें।"
            : "Our content is general education. Always consult a licensed clinician for your specific situation."}
        </p>
      </section>
    </main>
  );
}