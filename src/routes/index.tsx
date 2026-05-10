import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BookOpen, Headphones, MessageSquare, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CrisisSupport } from "@/components/CrisisSupport";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { PrivacyChip } from "@/components/PrivacyChip";
import { ContentWarning } from "@/components/ContentWarning";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const features = [
    { to: "/learn", icon: BookOpen, title: t("home.feat.myths"), body: t("home.feat.myths.body") },
    { to: "/audio", icon: Headphones, title: t("home.feat.audio"), body: t("home.feat.audio.body") },
    { to: "/qa", icon: MessageSquare, title: t("home.feat.qa"), body: t("home.feat.qa.body") },
  ];
  return (
    <>
      <ContentWarning />
      <div className="mx-auto max-w-[680px] px-5 pt-8">
        <PrivacyChip />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
          {t("home.eyebrow")}
        </p>
        <h1 className="mt-2 text-4xl leading-[1.1] sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t("home.subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95"
          >
            {t("home.cta.learn")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/qa"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
          >
            {t("home.cta.qa")}
          </Link>
        </div>

        <section className="mt-10 grid gap-3">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "color-mix(in oklab, var(--terracotta) 14%, transparent)", color: "var(--terracotta)" }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
              <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </section>

        <div className="mt-8">
          <CrisisSupport />
        </div>

        <div className="mt-6 flex justify-center">
          <WhatsAppCTA />
        </div>
      </div>
    </>
  );
}
