import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings } from "@/lib/site-settings";
import { useI18n } from "@/lib/i18n";
import { Phone, ExternalLink, HeartHandshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Helplines — Speakeasy India" },
      { name: "description", content: "Crisis helplines, sexual health support, LGBTQIA+ resources, and abuse support across India." },
      { property: "og:title", content: "Resources — Speakeasy India" },
      { property: "og:description", content: "Helplines and support across India." },
      { property: "og:url", content: "/resources" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: ResourcesPage,
});

type Crisis = { name: string; name_hi?: string; phone: string; hours?: string; hours_hi?: string; desc?: string; desc_hi?: string };
type Link = { name: string; url: string; desc?: string };

function ResourcesPage() {
  const { lang } = useI18n();
  const settingsQ = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
  const s = settingsQ.data ?? {};

  const crisisKeys = ["crisis_icall", "crisis_vandrevala", "crisis_pcvc", "crisis_ncw", "crisis_childline"];
  const crisis = crisisKeys.map((k) => s[k] as Crisis | undefined).filter(Boolean) as Crisis[];
  const lgbtq = (s["resource_lgbtq"] as Link[]) ?? [];
  const repro = (s["resource_reproductive_health"] as Link[]) ?? [];

  return (
    <main className="mx-auto max-w-[880px] px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sage)" }}>
          {lang === "hi" ? "संसाधन व सहायता" : "Resources & Support"}
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {lang === "hi" ? "जब आपको किसी की ज़रूरत हो।" : "When you need someone."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {lang === "hi"
            ? "प्रशिक्षित परामर्शदाताओं और सत्यापित संगठनों से मुफ़्त, गोपनीय सहायता।"
            : "Free, confidential support from trained counsellors and verified organisations."}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          <HeartHandshake className="h-6 w-6" style={{ color: "var(--sage)" }} />
          {lang === "hi" ? "संकट हेल्पलाइन" : "Crisis helplines"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {crisis.map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone}`}
              className="block rounded-2xl border p-4 transition hover:shadow-md"
              style={{
                backgroundColor: "color-mix(in oklab, var(--sage) 8%, var(--background))",
                borderColor: "color-mix(in oklab, var(--sage) 30%, transparent)",
              }}
            >
              <p className="font-semibold" style={{ color: "var(--sage)" }}>{lang === "hi" ? c.name_hi || c.name : c.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                <Phone className="h-4 w-4" />{c.phone}
              </p>
              {(c.hours || c.hours_hi) && (
                <p className="mt-1 text-xs text-muted-foreground">{lang === "hi" ? c.hours_hi || c.hours : c.hours}</p>
              )}
              {(c.desc || c.desc_hi) && (
                <p className="mt-1 text-sm">{lang === "hi" ? c.desc_hi || c.desc : c.desc}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      <LinkSection title={lang === "hi" ? "LGBTQIA+ सहायता" : "LGBTQIA+ support"} items={lgbtq} />
      <LinkSection title={lang === "hi" ? "यौन व प्रजनन स्वास्थ्य" : "Sexual & reproductive health"} items={repro} />

      <p className="mt-12 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        {lang === "hi"
          ? "यदि कोई नंबर पुराना दिखे, कृपया हमें बताएँ। हम सूची नियमित रूप से अद्यतन करते हैं।"
          : "If a number looks out of date, please let us know. We update this list regularly."}
      </p>
    </main>
  );
}

function LinkSection({ title, items }: { title: string; items: Link[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener"
            className="block rounded-xl border border-border bg-card p-4 transition hover:shadow-md">
            <p className="flex items-center gap-1.5 font-semibold">{l.name}<ExternalLink className="h-3.5 w-3.5" /></p>
            {l.desc && <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}