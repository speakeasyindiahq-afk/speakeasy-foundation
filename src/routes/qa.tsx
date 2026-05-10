import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PrivacyChip } from "@/components/PrivacyChip";

export const Route = createFileRoute("/qa")({
  head: () => ({ meta: [{ title: "Anonymous Q&A — Speakeasy India" }] }),
  component: QA,
});

function QA() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-[680px] px-5 pt-8">
      <PrivacyChip />
      <h1 className="mt-3 text-3xl">{lang === "hi" ? "गुमनाम प्रश्नोत्तर" : "Anonymous Q&A"}</h1>
      <p className="mt-3 text-muted-foreground">{lang === "hi" ? "जल्द ही उपलब्ध।" : "Coming soon."}</p>
    </div>
  );
}