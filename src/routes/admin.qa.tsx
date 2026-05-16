import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Inbox, BookOpenCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import type { Expert } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/qa")({
  head: () => ({
    meta: [{ title: "Q&A — Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminQA,
});

type QARow = {
  id: string;
  question_en: string | null;
  question_hi: string | null;
  answer_en: string | null;
  answer_hi: string | null;
  topic_category: string | null;
  language: "en" | "hi";
  status: "pending" | "approved" | "published" | "rejected";
  expert_id: string | null;
  moderation_notes: string | null;
  seo_slug: string | null;
  seo_title_en: string | null;
  seo_title_hi: string | null;
  seo_description_en: string | null;
  seo_description_hi: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  published_at: string | null;
};

function AdminQA() {
  const [tab, setTab] = useState<"inbox" | "published">("inbox");
  const [rows, setRows] = useState<QARow[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [draft, setDraft] = useState<QARow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const [q, e] = await Promise.all([
      supabase.from("qa_submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("experts").select("*").eq("active", true),
    ]);
    setRows((q.data ?? []) as QARow[]);
    setExperts((e.data ?? []) as Expert[]);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  const inbox = useMemo(() => rows.filter((r) => r.status === "pending" || r.status === "approved" || r.status === "rejected"), [rows]);
  const published = useMemo(() => rows.filter((r) => r.status === "published"), [rows]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMsg(null);
    const payload: Partial<QARow> = {
      ...draft,
      reviewed_at: draft.status !== "pending" ? draft.reviewed_at ?? new Date().toISOString() : draft.reviewed_at,
      published_at:
        draft.status === "published" ? draft.published_at ?? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("qa_submissions").update(payload).eq("id", draft.id);
    setSaving(false);
    if (error) setMsg(error.message);
    else {
      setMsg("Saved.");
      await refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("qa_submissions").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    refresh();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const list = tab === "inbox" ? inbox : published;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Anonymous Q&A</h1>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-border bg-card p-1 text-sm">
        <button
          onClick={() => { setTab("inbox"); setDraft(null); }}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium ${tab === "inbox" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Inbox className="h-4 w-4" /> Inbox ({inbox.length})
        </button>
        <button
          onClick={() => { setTab("published"); setDraft(null); }}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-medium ${tab === "published" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <BookOpenCheck className="h-4 w-4" /> Published ({published.length})
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Question</th>
                <th className="px-3 py-2 text-left">Topic</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    Nothing here yet.
                  </td>
                </tr>
              )}
              {list.map((r) => {
                const q = r.question_en ?? r.question_hi ?? "(empty)";
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-3 py-2">
                      <button onClick={() => setDraft(r)} className="text-left font-medium hover:text-primary">
                        {q.slice(0, 80)}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs">{r.topic_category ?? "—"}</td>
                    <td className="px-3 py-2"><StatusBadge s={r.status} /></td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {draft && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Review submission</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Submitted {new Date(draft.submitted_at).toLocaleString()} · Anonymous · Lang: {draft.language}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Question (EN)" full>
                <T value={draft.question_en ?? ""} onChange={(v) => setDraft({ ...draft, question_en: v })} rows={3} />
              </F>
              <F label="Question (HI)" full>
                <T value={draft.question_hi ?? ""} onChange={(v) => setDraft({ ...draft, question_hi: v })} rows={3} />
              </F>
              <F label="Answer (EN)" full>
                <T value={draft.answer_en ?? ""} onChange={(v) => setDraft({ ...draft, answer_en: v })} rows={6} />
              </F>
              <F label="Answer (HI)" full>
                <T value={draft.answer_hi ?? ""} onChange={(v) => setDraft({ ...draft, answer_hi: v })} rows={6} />
              </F>
              <F label="Topic">
                <select
                  className="ta"
                  value={draft.topic_category ?? ""}
                  onChange={(e) => setDraft({ ...draft, topic_category: e.target.value })}
                >
                  <option value="">—</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.en}</option>
                  ))}
                </select>
              </F>
              <F label="Expert">
                <select
                  className="ta"
                  value={draft.expert_id ?? ""}
                  onChange={(e) => setDraft({ ...draft, expert_id: e.target.value || null })}
                >
                  <option value="">—</option>
                  {experts.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </select>
              </F>
              <F label="Status">
                <select
                  className="ta"
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as QARow["status"] })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              </F>
              <F label="SEO slug">
                <I value={draft.seo_slug ?? ""} onChange={(v) => setDraft({ ...draft, seo_slug: v })} />
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
              <F label="Moderation notes" full>
                <T value={draft.moderation_notes ?? ""} onChange={(v) => setDraft({ ...draft, moderation_notes: v })} rows={3} />
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
                Close
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
  return <input className="ta" type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" />;
}
function T({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea className="ta" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function StatusBadge({ s }: { s: string }) {
  const colors: Record<string, string> = {
    published: "color-mix(in oklab, var(--sage) 18%, transparent)",
    pending: "color-mix(in oklab, var(--terracotta) 18%, transparent)",
    approved: "color-mix(in oklab, var(--primary) 18%, transparent)",
    rejected: "color-mix(in oklab, var(--destructive) 18%, transparent)",
  };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: colors[s] }}
    >
      {s}
    </span>
  );
}
