import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, upsertSetting, settingString } from "@/lib/site-settings";
import { Save, RefreshCw, ExternalLink, Search as SearchIcon, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/search")({
  head: () => ({ meta: [{ title: "Search Operations — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminSearch,
});

function AdminSearch() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [deployHook, setDeployHook] = useState("");
  const [pagefindEnabled, setPagefindEnabled] = useState("false");
  const [searchPlaceholderEn, setSearchPlaceholderEn] = useState("");
  const [searchPlaceholderHi, setSearchPlaceholderHi] = useState("");
  const [lastRebuildAt, setLastRebuildAt] = useState("");

  useEffect(() => {
    (async () => {
      const s = await fetchSiteSettings();
      setDeployHook(settingString(s, "search_deploy_hook_url"));
      setPagefindEnabled(settingString(s, "search_pagefind_enabled", "false"));
      setSearchPlaceholderEn(settingString(s, "search_placeholder_en"));
      setSearchPlaceholderHi(settingString(s, "search_placeholder_hi"));
      setLastRebuildAt(settingString(s, "search_last_rebuild_at"));
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await Promise.all([
        upsertSetting("search_deploy_hook_url", deployHook),
        upsertSetting("search_pagefind_enabled", pagefindEnabled),
        upsertSetting("search_placeholder_en", searchPlaceholderEn),
        upsertSetting("search_placeholder_hi", searchPlaceholderHi),
      ]);
      setMsg({ kind: "ok", text: "Saved." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message ?? "Save failed." });
    } finally { setSaving(false); }
  };

  const rebuild = async () => {
    if (!deployHook) { setMsg({ kind: "err", text: "Set a deploy hook URL first." }); return; }
    if (!confirm("Trigger a production rebuild now?")) return;
    setRebuilding(true); setMsg(null);
    try {
      const res = await fetch(deployHook, { method: "POST" });
      if (!res.ok) throw new Error(`Deploy hook returned ${res.status}`);
      const now = new Date().toISOString();
      await upsertSetting("search_last_rebuild_at", now);
      setLastRebuildAt(now);
      setMsg({ kind: "ok", text: "Rebuild triggered." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message ?? "Rebuild failed." });
    } finally { setRebuilding(false); }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Search Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global search behavior, placeholder copy, and the Vercel/Cloudflare deploy hook used to rebuild the static index.
          </p>
        </div>
        <SearchIcon className="h-6 w-6 text-muted-foreground" />
      </header>

      {msg && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-green-50 text-green-800" : "bg-destructive/10 text-destructive"}`}>
          {msg.kind === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Placeholder copy</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Placeholder (EN)" value={searchPlaceholderEn} onChange={setSearchPlaceholderEn} placeholder="Search articles, myths…" />
          <Field label="Placeholder (HI)" value={searchPlaceholderHi} onChange={setSearchPlaceholderHi} placeholder="लेख, भ्रांतियाँ खोजें…" />
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Static search (Pagefind)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          When enabled, the client will prefer the static Pagefind index (built post-deploy) and fall back to the live Supabase query.
        </p>
        <label className="mt-3 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pagefindEnabled === "true"}
            onChange={(e) => setPagefindEnabled(e.target.checked ? "true" : "false")}
            className="h-4 w-4"
          />
          Enable Pagefind static index
        </label>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Deploy hook</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste the deploy hook URL (Vercel, Cloudflare Pages, Netlify). Triggering a rebuild here regenerates the static search index.
        </p>
        <Field label="Deploy hook URL" value={deployHook} onChange={setDeployHook} placeholder="https://api.vercel.com/v1/integrations/deploy/…" type="url" />
        {lastRebuildAt && (
          <p className="mt-2 text-xs text-muted-foreground">Last triggered: {new Date(lastRebuildAt).toLocaleString()}</p>
        )}
        <button
          onClick={rebuild}
          disabled={rebuilding || !deployHook}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${rebuilding ? "animate-spin" : ""}`} />
          {rebuilding ? "Triggering…" : "Trigger rebuild"}
        </button>
      </section>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
        <a href="/search" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          Open /search <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
      />
    </label>
  );
}