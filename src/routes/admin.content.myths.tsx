import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MYTH_CATEGORIES } from "@/lib/myth-categories";
import type { Myth, Expert } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/content/myths")({
  head: () => ({
    meta: [{ title: "Myths — Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: MythsAdmin,
});

type Draft = Partial<Myth>;
const emptyDraft = (): Draft => ({
  slug: "",
  category: MYTH_CATEGORIES[1].slug,
  myth_statement_en: "",
  myth_statement_hi: "",
  truth_statement_en: "",
  truth_statement_hi: "",
  explanation_en: "",
  explanation_hi: "",
  status: "draft",
});

function MythsAdmin() {
  const [list, setList] = useState<Myth[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const [m, e] = await Promise.all([
      supabase.from("myths").select("*").order("created_at", { ascending: false }),
      supabase.from("experts").select("*").eq("active", true),
    ]);
    setList((m.data ?? []) as Myth[]);
    setExperts((e.data ?? []) as Expert[]);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  function startEdit(m: Myth) {
    setDraft({ ...m });
    setMsg(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMsg(null);
    const { experts: _e, ...rest } = draft;
    void _e;
    // Mirror new fields into legacy columns for backward compatibility
    const payload = {
      ...rest,
      myth: rest.myth_statement_en ?? rest.myth ?? "",
      myth_hi: rest.myth_statement_hi ?? rest.myth_hi ?? null,
      fact: rest.truth_statement_en ?? rest.fact ?? "",
      fact_hi: rest.truth_statement_hi ?? rest.fact_hi ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("myths").upsert(payload);
    if (error) setMsg(error.message);
    else {
      setMsg("Saved.");
      await refresh();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this myth?")) return;
    await supabase.from("myths").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    refresh();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Myths</h1>
        <button
          onClick={() => {
            setDraft(emptyDraft());
            setMsg(null);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Myth</th>
                <th className="px-3 py-2 text-left">Cat</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No myths yet.
                  </td>
                </tr>
              )}
              {list.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <button onClick={() => startEdit(m)} className="text-left font-medium hover:text-primary">
                      {(m.myth_statement_en ?? m.myth ?? "(untitled)").slice(0, 60)}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-xs">{m.category ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge s={m.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {draft && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{draft.id ? "Edit myth" : "New myth"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Slug">
                <I value={draft.slug ?? ""} onChange={(v) => setDraft({ ...draft, slug: v })} />
              </F>
              <F label="Category">
                <select
                  className="ta"
                  value={draft.category ?? ""}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {MYTH_CATEGORIES.filter((c) => c.slug !== "all").map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.en}
                    </option>
                  ))}
                </select>
              </F>
              <F label="Myth statement (EN)" full>
                <T value={draft.myth_statement_en ?? ""} onChange={(v) => setDraft({ ...draft, myth_statement_en: v })} rows={2} />
              </F>
              <F label="Myth statement (HI)" full>
                <T value={draft.myth_statement_hi ?? ""} onChange={(v) => setDraft({ ...draft, myth_statement_hi: v })} rows={2} />
              </F>
              <F label="Truth statement (EN)" full>
                <T value={draft.truth_statement_en ?? ""} onChange={(v) => setDraft({ ...draft, truth_statement_en: v })} rows={2} />
              </F>
              <F label="Truth statement (HI)" full>
                <T value={draft.truth_statement_hi ?? ""} onChange={(v) => setDraft({ ...draft, truth_statement_hi: v })} rows={2} />
              </F>
              <F label="Explanation (EN)" full>
                <T value={draft.explanation_en ?? ""} onChange={(v) => setDraft({ ...draft, explanation_en: v })} rows={6} />
              </F>
              <F label="Explanation (HI)" full>
                <T value={draft.explanation_hi ?? ""} onChange={(v) => setDraft({ ...draft, explanation_hi: v })} rows={6} />
              </F>
              <F label="Expert">
                <select
                  className="ta"
                  value={draft.expert_id ?? ""}
                  onChange={(e) => setDraft({ ...draft, expert_id: e.target.value || null })}
                >
                  <option value="">—</option>
                  {experts.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </F>
              <F label="Status">
                <select
                  className="ta"
                  value={draft.status ?? "draft"}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </F>
              <F label="SEO title (EN)">
                <I value={draft.seo_title_en ?? ""} onChange={(v) => setDraft({ ...draft, seo_title_en: v })} />
              </F>
              <F label="SEO title (HI)">
                <I value={draft.seo_title_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_title_hi: v })} />
              </F>
              <F label="SEO description (EN)" full>
                <T value={draft.seo_description_en ?? ""} onChange={(v) => setDraft({ ...draft, seo_description_en: v })} rows={2} />
              </F>
              <F label="SEO description (HI)" full>
                <T value={draft.seo_description_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_description_hi: v })} rows={2} />
              </F>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
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
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: colors[s ?? "draft"] }}
    >
      {s ?? "draft"}
    </span>
  );
}