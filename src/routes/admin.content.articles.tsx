import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import type { Article, Expert } from "@/lib/site-settings";
import { EditorialBody } from "@/routes/learn.$category.$slug";

export const Route = createFileRoute("/admin/content/articles")({
  head: () => ({ meta: [{ title: "Articles — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ArticlesAdmin,
});

type Draft = Partial<Article> & { sources_text?: string };
const emptyDraft = (): Draft => ({
  title: "", title_hi: "", slug: "", category: CATEGORIES[0].slug,
  status: "draft", sources: [], content_warning: false, sources_text: "",
});

function ArticlesAdmin() {
  const [list, setList] = useState<Article[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeTabEn, setActiveTabEn] = useState<"edit" | "preview">("edit");
  const [activeTabHi, setActiveTabHi] = useState<"edit" | "preview">("edit");

  async function refresh() {
    const [a, e] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("experts").select("*").eq("active", true),
    ]);
    setList((a.data ?? []) as Article[]);
    setExperts((e.data ?? []) as Expert[]);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function startEdit(a: Article) {
    setDraft({
      ...a,
      sources_text: Array.isArray(a.sources) ? a.sources.map((s) => `${s.title} | ${s.url}`).join("\n") : "",
    });
    setMsg(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true); setMsg(null);
    const sources = (draft.sources_text ?? "")
      .split("\n").map((l) => l.trim()).filter(Boolean)
      .map((l) => { const [title, ...rest] = l.split("|"); return { title: title.trim(), url: rest.join("|").trim() }; })
      .filter((s) => s.title && s.url);
    const { sources_text, experts: _experts, ...rest } = draft;
    void sources_text; void _experts;
    const payload = { ...rest, sources, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("articles").upsert(payload);
    if (error) setMsg(error.message); else { setMsg("Saved."); await refresh(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this article?")) return;
    await supabase.from("articles").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    refresh();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Articles</h1>
        <button
          onClick={() => { setDraft(emptyDraft()); setMsg(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Cat</th><th className="px-3 py-2 text-left">Status</th><th /></tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No articles yet.</td></tr>}
              {list.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2"><button onClick={() => startEdit(a)} className="text-left font-medium hover:text-primary">{a.title || "(untitled)"}</button></td>
                  <td className="px-3 py-2 text-xs">{a.category}</td>
                  <td className="px-3 py-2"><StatusBadge s={a.status} /></td>
                  <td className="px-3 py-2 text-right"><button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EDITOR */}
        {draft && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{draft.id ? "Edit article" : "New article"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Title (EN)"><I value={draft.title ?? ""} onChange={(v) => setDraft({ ...draft, title: v })} /></F>
              <F label="Title (HI)"><I value={draft.title_hi ?? ""} onChange={(v) => setDraft({ ...draft, title_hi: v })} /></F>
              <F label="Slug"><I value={draft.slug ?? ""} onChange={(v) => setDraft({ ...draft, slug: v })} /></F>
              <F label="Category">
                <select className="ta" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.en}</option>)}
                </select>
              </F>
              <F label="Sub-category">
                <select className="ta" value={draft.sub_category ?? ""} onChange={(e) => setDraft({ ...draft, sub_category: e.target.value || null })}>
                  <option value="">—</option>
                  {(CATEGORIES.find((c) => c.slug === draft.category)?.subcategories ?? []).map((s) => (
                    <option key={s.slug} value={s.slug}>{s.en}</option>
                  ))}
                </select>
              </F>
              <F label="Expert">
                <select className="ta" value={draft.expert_id ?? ""} onChange={(e) => setDraft({ ...draft, expert_id: e.target.value || null })}>
                  <option value="">—</option>
                  {experts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </F>
              <F label="Review date"><I type="date" value={draft.review_date ?? ""} onChange={(v) => setDraft({ ...draft, review_date: v || null })} /></F>
              <F label="Featured image URL"><I value={draft.cover_url ?? ""} onChange={(v) => setDraft({ ...draft, cover_url: v })} /></F>
              <F label="Content warning">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!draft.content_warning} onChange={(e) => setDraft({ ...draft, content_warning: e.target.checked })} />
                  Show warning gate
                </label>
              </F>
              <F label="Status">
                <select className="ta" value={draft.status ?? "draft"} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </F>
              <F label="Excerpt (EN)" full><T value={draft.excerpt ?? ""} onChange={(v) => setDraft({ ...draft, excerpt: v })} rows={2} /></F>
              <F label="Excerpt (HI)" full><T value={draft.excerpt_hi ?? ""} onChange={(v) => setDraft({ ...draft, excerpt_hi: v })} rows={2} /></F>
              
              <F label="Body (EN) — use ## H2, > quote, !> insight" full>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabEn("edit")}
                    className={`text-xs px-3 py-1 rounded-full border transition ${activeTabEn === "edit" ? "bg-primary text-white border-transparent" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabEn("preview")}
                    className={`text-xs px-3 py-1 rounded-full border transition ${activeTabEn === "preview" ? "bg-primary text-white border-transparent" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
                  >
                    Preview
                  </button>
                </div>
                {activeTabEn === "edit" ? (
                  <T value={draft.body ?? ""} onChange={(v) => setDraft({ ...draft, body: v })} rows={10} />
                ) : (
                  <div className="rounded-xl border border-border bg-card/50 p-5 max-h-[400px] overflow-y-auto mt-1">
                    <EditorialBody body={draft.body ?? ""} lang="en" />
                  </div>
                )}
              </F>

              <F label="Body (HI)" full>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabHi("edit")}
                    className={`text-xs px-3 py-1 rounded-full border transition ${activeTabHi === "edit" ? "bg-primary text-white border-transparent" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabHi("preview")}
                    className={`text-xs px-3 py-1 rounded-full border transition ${activeTabHi === "preview" ? "bg-primary text-white border-transparent" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
                  >
                    Preview
                  </button>
                </div>
                {activeTabHi === "edit" ? (
                  <T value={draft.body_hi ?? ""} onChange={(v) => setDraft({ ...draft, body_hi: v })} rows={10} />
                ) : (
                  <div className="rounded-xl border border-border bg-card/50 p-5 max-h-[400px] overflow-y-auto mt-1">
                    <EditorialBody body={draft.body_hi ?? ""} lang="hi" />
                  </div>
                )}
              </F>
              <F label="Sources — one per line: Title | URL" full><T value={draft.sources_text ?? ""} onChange={(v) => setDraft({ ...draft, sources_text: v })} rows={4} /></F>
              <F label="Focus keyword"><I value={draft.focus_keyword ?? ""} onChange={(v) => setDraft({ ...draft, focus_keyword: v })} /></F>
              <div />
              <F label="SEO title (EN)"><I value={draft.seo_title ?? ""} onChange={(v) => setDraft({ ...draft, seo_title: v })} /></F>
              <F label="SEO title (HI)"><I value={draft.seo_title_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_title_hi: v })} /></F>
              <F label="SEO description (EN)" full><T value={draft.seo_description ?? ""} onChange={(v) => setDraft({ ...draft, seo_description: v })} rows={2} /></F>
              <F label="SEO description (HI)" full><T value={draft.seo_description_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_description_hi: v })} rows={2} /></F>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setDraft(null)} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Cancel</button>
              {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
            </div>
          </div>
        )}
      </div>

      <style>{`.ta{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.625rem;padding:0.5rem 0.7rem;font-size:0.85rem;outline:none}.ta:focus{border-color:var(--terracotta)}`}</style>
    </div>
  );
}

function F({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? "sm:col-span-2 block" : "block"}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function I({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input className="ta" type={type} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function T({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea className="ta" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function StatusBadge({ s }: { s?: string | null }) {
  const colors: Record<string, string> = {
    published: "color-mix(in oklab, var(--sage) 18%, transparent)",
    draft: "color-mix(in oklab, var(--muted) 60%, transparent)",
    archived: "color-mix(in oklab, var(--destructive) 18%, transparent)",
  };
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ backgroundColor: colors[s ?? "draft"] }}>{s ?? "draft"}</span>;
}