import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AUDIO_CATEGORIES } from "@/lib/audio-categories";
import type { AudioEpisode, Expert } from "@/lib/site-settings";

export const Route = createFileRoute("/admin/audio")({
  head: () => ({ meta: [{ title: "Audio — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AudioAdmin,
});

type Draft = Partial<AudioEpisode>;
const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  title_hi: "",
  description: "",
  description_hi: "",
  transcript_en: "",
  transcript_hi: "",
  category: AUDIO_CATEGORIES[1].slug,
  language: "en",
  duration_seconds: 0,
  audio_url: "",
  status: "draft",
});

function AudioAdmin() {
  const [list, setList] = useState<AudioEpisode[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const [a, e] = await Promise.all([
      supabase.from("audio_episodes").select("*").order("created_at", { ascending: false }),
      supabase.from("experts").select("*").eq("active", true),
    ]);
    setList((a.data ?? []) as AudioEpisode[]);
    setExperts((e.data ?? []) as Expert[]);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function upload(file: File) {
    if (!/audio\/(mpeg|mp4|x-m4a|aac)/.test(file.type) && !/\.(mp3|m4a)$/i.test(file.name)) {
      setMsg("Only MP3 or M4A files allowed.");
      return;
    }
    setUploading(true);
    setMsg(null);
    const ext = file.name.split(".").pop() || "mp3";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("audio").upload(filename, file, {
      contentType: file.type || "audio/mpeg",
      upsert: false,
    });
    if (error) { setMsg(error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("audio").getPublicUrl(filename);
    setDraft((d) => ({ ...(d ?? emptyDraft()), audio_url: pub.publicUrl }));
    // try to extract duration client-side
    try {
      const audio = new Audio(pub.publicUrl);
      audio.addEventListener("loadedmetadata", () => {
        setDraft((d) => ({ ...(d ?? {}), duration_seconds: Math.round(audio.duration) }));
      });
    } catch {}
    setMsg("Uploaded.");
    setUploading(false);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMsg(null);
    const { experts: _e, ...rest } = draft;
    void _e;
    const payload = {
      ...rest,
      slug: rest.slug || (rest.title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("audio_episodes").upsert(payload);
    if (error) setMsg(error.message);
    else { setMsg("Saved."); await refresh(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this episode?")) return;
    await supabase.from("audio_episodes").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    refresh();
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Audio</h1>
        <button
          onClick={() => { setDraft(emptyDraft()); setMsg(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Cat</th><th className="px-3 py-2 text-left">Status</th><th /></tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No episodes yet.</td></tr>
              )}
              {list.map((ep) => (
                <tr key={ep.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <button onClick={() => { setDraft({ ...ep }); setMsg(null); }} className="text-left font-medium hover:text-primary">
                      {(ep.title ?? "(untitled)").slice(0, 60)}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-xs">{ep.category ?? "—"}</td>
                  <td className="px-3 py-2"><StatusBadge s={ep.status} /></td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(ep.id)} className="text-muted-foreground hover:text-destructive">
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
            <h2 className="text-lg font-semibold">{draft.id ? "Edit episode" : "New episode"}</h2>

            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Audio file (MP3 / M4A)</p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                </button>
                {draft.audio_url && (
                  <audio controls src={draft.audio_url} className="h-8" preload="none" />
                )}
              </div>
              {draft.audio_url && (
                <p className="mt-2 break-all text-[10px] text-muted-foreground">{draft.audio_url}</p>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Slug"><I value={draft.slug ?? ""} onChange={(v) => setDraft({ ...draft, slug: v })} /></F>
              <F label="Language">
                <select className="ta" value={draft.language ?? "en"} onChange={(e) => setDraft({ ...draft, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bi">Bilingual</option>
                </select>
              </F>
              <F label="Title (EN)" full><I value={draft.title ?? ""} onChange={(v) => setDraft({ ...draft, title: v })} /></F>
              <F label="Title (HI)" full><I value={draft.title_hi ?? ""} onChange={(v) => setDraft({ ...draft, title_hi: v })} /></F>
              <F label="Description (EN)" full><T rows={3} value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} /></F>
              <F label="Description (HI)" full><T rows={3} value={draft.description_hi ?? ""} onChange={(v) => setDraft({ ...draft, description_hi: v })} /></F>
              <F label="Transcript (EN)" full><T rows={5} value={draft.transcript_en ?? ""} onChange={(v) => setDraft({ ...draft, transcript_en: v })} /></F>
              <F label="Transcript (HI)" full><T rows={5} value={draft.transcript_hi ?? ""} onChange={(v) => setDraft({ ...draft, transcript_hi: v })} /></F>
              <F label="Category">
                <select className="ta" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {AUDIO_CATEGORIES.filter((c) => c.slug !== "all").map((c) => (
                    <option key={c.slug} value={c.slug}>{c.en}</option>
                  ))}
                </select>
              </F>
              <F label="Expert">
                <select className="ta" value={draft.expert_id ?? ""} onChange={(e) => setDraft({ ...draft, expert_id: e.target.value || null })}>
                  <option value="">—</option>
                  {experts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </F>
              <F label="Duration (seconds)">
                <I value={String(draft.duration_seconds ?? "")} onChange={(v) => setDraft({ ...draft, duration_seconds: Number(v) || 0 })} type="number" />
              </F>
              <F label="Status">
                <select className="ta" value={draft.status ?? "draft"} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </F>
              <F label="SEO title (EN)"><I value={draft.seo_title ?? ""} onChange={(v) => setDraft({ ...draft, seo_title: v })} /></F>
              <F label="SEO title (HI)"><I value={draft.seo_title_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_title_hi: v })} /></F>
              <F label="SEO description (EN)" full><T rows={2} value={draft.seo_description ?? ""} onChange={(v) => setDraft({ ...draft, seo_description: v })} /></F>
              <F label="SEO description (HI)" full><T rows={2} value={draft.seo_description_hi ?? ""} onChange={(v) => setDraft({ ...draft, seo_description_hi: v })} /></F>
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