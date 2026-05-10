import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/audio")({
  head: () => ({ meta: [{ title: "Audio — Speakeasy India" }] }),
  component: Audio,
});

function Audio() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-[680px] px-5 pt-8">
      <h1 className="text-3xl">{lang === "hi" ? "ऑडियो पाठ" : "Audio lessons"}</h1>
      <p className="mt-3 text-muted-foreground">{lang === "hi" ? "निजी रूप से सुनें।" : "Listen privately."}</p>
    </div>
  );
}