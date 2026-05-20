import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/seo")({
  head: () => ({ meta: [{ title: "SEO Ops — Speakeasy Admin" }] }),
  component: SEOOps,
});

type Row = {
  id: string;
  type: "article" | "myth" | "audio";
  title: string;
  slug: string | null;
  missing: string[];
  editTo: string;
};

function SEOOps() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, m, au] = await Promise.all([
        supabase.from("articles").select("id,title,slug,seo_title,seo_description,excerpt,status").neq("status", "archived"),
        supabase.from("myths").select("id,myth,myth_statement_en,slug,seo_title_en,seo_description_en,status").neq("status", "archived"),
        supabase.from("audio_episodes").select("id,title,slug,seo_title,seo_description,status").neq("status", "archived"),
      ]);
      const out: Row[] = [];
      (a.data ?? []).forEach((r: Record<string, unknown>) => {
        const missing = [
          !r.slug && "slug",
          !r.seo_title && "SEO title",
          !r.seo_description && !r.excerpt && "description",
        ].filter(Boolean) as string[];
        if (missing.length) out.push({
          id: r.id as string, type: "article",
          title: (r.title as string) ?? "(untitled)",
          slug: (r.slug as string) ?? null, missing,
          editTo: "/admin/content/articles",
        });
      });
      (m.data ?? []).forEach((r: Record<string, unknown>) => {
        const missing = [
          !r.slug && "slug",
          !r.seo_title_en && "SEO title",
          !r.seo_description_en && "SEO description",
        ].filter(Boolean) as string[];
        if (missing.length) out.push({
          id: r.id as string, type: "myth",
          title: ((r.myth_statement_en as string) || (r.myth as string)) ?? "(untitled)",
          slug: (r.slug as string) ?? null, missing,
          editTo: "/admin/content/myths",
        });
      });
      (au.data ?? []).forEach((r: Record<string, unknown>) => {
        const missing = [
          !r.slug && "slug",
          !r.seo_title && "SEO title",
          !r.seo_description && "SEO description",
        ].filter(Boolean) as string[];
        if (missing.length) out.push({
          id: r.id as string, type: "audio",
          title: (r.title as string) ?? "(untitled)",
          slug: (r.slug as string) ?? null, missing,
          editTo: "/admin/audio",
        });
      });
      setRows(out);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl">SEO operations</h1>
      <p className="mt-2 text-muted-foreground">Suggestions only — nothing is overwritten automatically.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          {loading ? "Scanning…" : `${rows.length} item${rows.length === 1 ? "" : "s"} need attention`}
        </div>
        {!loading && rows.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">Everything checks out. Great work.</div>
        )}
        {rows.map((r) => (
          <div key={`${r.type}-${r.id}`} className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 last:border-b-0">
            <div className="min-w-0">
              <div className="text-xs uppercase text-muted-foreground">{r.type}</div>
              <div className="text-sm font-medium">{r.title}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {r.missing.map((m) => (
                  <span key={m} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">Missing {m}</span>
                ))}
              </div>
            </div>
            <Link to={r.editTo} className="text-xs font-medium underline">Open editor</Link>
          </div>
        ))}
      </div>
    </div>
  );
}