import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings, upsertSetting, settingString, type Article, type Myth } from "@/lib/site-settings";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({ component: AdminHomepage });

function AdminHomepage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [heroHi, setHeroHi] = useState("");
  const [heroEn, setHeroEn] = useState("");
  const [subHi, setSubHi] = useState("");
  const [subEn, setSubEn] = useState("");
  const [waUrl, setWaUrl] = useState("");
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [mythId, setMythId] = useState<string | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [myths, setMyths] = useState<Myth[]>([]);

  useEffect(() => {
    (async () => {
      const [s, a, m] = await Promise.all([
        fetchSiteSettings(),
        supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("myths").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setHeroHi(settingString(s, "hero_title_hi"));
      setHeroEn(settingString(s, "hero_title_en"));
      setSubHi(settingString(s, "hero_subtitle_hi"));
      setSubEn(settingString(s, "hero_subtitle_en"));
      setWaUrl(settingString(s, "whatsapp_channel_url"));
      const fids = s["featured_article_ids"];
      if (Array.isArray(fids)) setFeaturedIds(fids as string[]);
      const mid = s["myth_of_week_id"];
      if (typeof mid === "string") setMythId(mid);
      setArticles((a.data ?? []) as Article[]);
      setMyths((m.data ?? []) as Myth[]);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        upsertSetting("hero_title_hi", heroHi),
        upsertSetting("hero_title_en", heroEn),
        upsertSetting("hero_subtitle_hi", subHi),
        upsertSetting("hero_subtitle_en", subEn),
        upsertSetting("whatsapp_channel_url", waUrl),
        upsertSetting("featured_article_ids", featuredIds),
        upsertSetting("myth_of_week_id", mythId),
      ]);
      setMsg("Saved.");
    } catch {
      setMsg("Save failed. Check Supabase setup.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl">Homepage</h1>
      <p className="mt-1 text-sm text-muted-foreground">Edit hero copy, featured articles, myth of the week, WhatsApp link.</p>

      <div className="mt-8 space-y-6">
        <Field label="Hero title (Hindi)"><textarea value={heroHi} onChange={(e) => setHeroHi(e.target.value)} rows={2} className="ta" /></Field>
        <Field label="Hero title (English)"><textarea value={heroEn} onChange={(e) => setHeroEn(e.target.value)} rows={2} className="ta" /></Field>
        <Field label="Hero subtitle (Hindi)"><textarea value={subHi} onChange={(e) => setSubHi(e.target.value)} rows={2} className="ta" /></Field>
        <Field label="Hero subtitle (English)"><textarea value={subEn} onChange={(e) => setSubEn(e.target.value)} rows={2} className="ta" /></Field>
        <Field label="WhatsApp channel URL"><input value={waUrl} onChange={(e) => setWaUrl(e.target.value)} className="ta" /></Field>

        <Field label="Featured articles (pick up to 3)">
          <div className="grid gap-2">
            {articles.length === 0 && <p className="text-xs text-muted-foreground">No articles yet.</p>}
            {articles.map((a) => {
              const checked = featuredIds.includes(a.id);
              return (
                <label key={a.id} className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setFeaturedIds((prev) => {
                        if (e.target.checked) return [...prev, a.id].slice(-3);
                        return prev.filter((x) => x !== a.id);
                      });
                    }}
                  />
                  <span>{a.title}{a.title_hi ? ` · ${a.title_hi}` : ""}</span>
                </label>
              );
            })}
          </div>
        </Field>

        <Field label="Myth of the week">
          <select value={mythId ?? ""} onChange={(e) => setMythId(e.target.value || null)} className="ta">
            <option value="">— Auto (latest published) —</option>
            {myths.map((m) => (
              <option key={m.id} value={m.id}>{(m.myth_statement_en ?? m.myth ?? "").slice(0, 80)}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>

      <style>{`.ta{width:100%;border:1px solid var(--border);background:var(--card);border-radius:0.75rem;padding:0.6rem 0.8rem;font-size:0.9rem;outline:none}.ta:focus{border-color:var(--terracotta)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}