import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Speakeasy India" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-[680px] px-5 pt-8">
      <h1 className="text-3xl">{lang === "hi" ? "खोज" : "Search"}</h1>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input type="search" placeholder={lang === "hi" ? "प्रश्न खोजें…" : "Search topics…"} className="flex-1 bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}