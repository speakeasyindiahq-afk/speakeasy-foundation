import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — Speakeasy India" }, { name: "description", content: "Medically-reviewed sexual health lessons and myth busters." }] }),
  component: Learn,
});

function Learn() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-[680px] px-5 pt-8">
      <h1 className="text-3xl">{lang === "hi" ? "सीखें" : "Learn"}</h1>
      <p className="mt-3 text-muted-foreground">
        {lang === "hi"
          ? "जल्द ही: चिकित्सकीय रूप से समीक्षित पाठ और भ्रांति निवारण।"
          : "Coming soon: clinician-reviewed lessons and myth busters."}
      </p>
    </div>
  );
}