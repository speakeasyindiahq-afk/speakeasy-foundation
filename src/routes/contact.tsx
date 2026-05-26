import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, settingString } from "@/lib/site-settings";
import { useI18n } from "@/lib/i18n";
import { Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Speakeasy India" },
      { name: "description", content: "Reach Speakeasy India for general, press, expert collaboration, or privacy questions." },
      { property: "og:title", content: "Contact — Speakeasy India" },
      { property: "og:description", content: "Get in touch with our team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useI18n();
  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const s = settingsQ.data ?? {};

  const items = [
    { key: "contact_general_email", label: lang === "hi" ? "सामान्य पूछताछ" : "General inquiries", desc: lang === "hi" ? "मंच के बारे में प्रश्न या प्रतिक्रिया" : "Questions or feedback about the platform" },
    { key: "contact_press_email", label: lang === "hi" ? "मीडिया" : "Press", desc: lang === "hi" ? "साक्षात्कार और मीडिया अनुरोध" : "Interviews and media requests" },
    { key: "contact_expert_email", label: lang === "hi" ? "विशेषज्ञ सहयोग" : "Expert collaboration", desc: lang === "hi" ? "चिकित्सक और सलाहकार साझेदारी" : "Clinician and advisor partnerships" },
    { key: "contact_privacy_email", label: lang === "hi" ? "गोपनीयता" : "Privacy", desc: lang === "hi" ? "डेटा अनुरोध और गोपनीयता प्रश्न" : "Data requests and privacy questions" },
  ];

  return (
    <main className="mx-auto max-w-[760px] px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
          {lang === "hi" ? "संपर्क" : "Contact"}
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "हमसे बात करें।" : "Talk to us."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {lang === "hi"
            ? "हम आमतौर पर 3–5 कार्य दिवसों में उत्तर देते हैं। हमारे पास फ़ोन सहायता नहीं है।"
            : "We typically reply within 3–5 working days. We do not offer phone support."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const email = settingString(s, it.key, "");
          if (!email) return null;
          return (
            <a key={it.key} href={`mailto:${email}`} className="block rounded-2xl border border-border bg-card p-5 transition hover:shadow-md">
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
                <Mail className="h-4 w-4" />{it.label}
              </p>
              <p className="mt-2 font-mono text-sm break-all">{email}</p>
              <p className="mt-2 text-xs text-muted-foreground">{it.desc}</p>
            </a>
          );
        })}
      </div>

      <p className="mt-10 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        {lang === "hi"
          ? "संकट या आपातकाल के लिए, कृपया संसाधन पृष्ठ पर हेल्पलाइन देखें।"
          : "For crisis or emergencies, please see the helplines on our Resources page."}
      </p>
    </main>
  );
}