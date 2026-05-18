import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSiteSettings, upsertSetting, settingString } from "@/lib/site-settings";
import { Save, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/trust")({
  head: () => ({ meta: [{ title: "Trust Operations — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminTrust,
});

type Crisis = { name: string; name_hi?: string; phone: string; hours?: string; hours_hi?: string; desc?: string; desc_hi?: string };

const textKeys = [
  { k: "about_mission_en", label: "About — Mission (EN)", area: true },
  { k: "about_mission_hi", label: "About — Mission (HI)", area: true },
  { k: "founder_note_en", label: "Founder Note (EN)", area: true },
  { k: "founder_note_hi", label: "Founder Note (HI)", area: true },
  { k: "privacy_intro_en", label: "Privacy intro (EN)", area: true },
  { k: "privacy_intro_hi", label: "Privacy intro (HI)", area: true },
  { k: "privacy_data_use_en", label: "Privacy — Data use (EN)", area: true },
  { k: "privacy_data_use_hi", label: "Privacy — Data use (HI)", area: true },
  { k: "disclaimer_en", label: "Disclaimer (EN)", area: true },
  { k: "disclaimer_hi", label: "Disclaimer (HI)", area: true },
  { k: "contact_general_email", label: "Contact — General email", area: false },
  { k: "contact_press_email", label: "Contact — Press email", area: false },
  { k: "contact_expert_email", label: "Contact — Expert email", area: false },
  { k: "contact_privacy_email", label: "Contact — Privacy email", area: false },
] as const;

const crisisKeys = ["crisis_icall", "crisis_vandrevala", "crisis_pcvc", "crisis_ncw", "crisis_childline"] as const;

function AdminTrust() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [crisis, setCrisis] = useState<Record<string, Crisis>>({});

  useEffect(() => {
    (async () => {
      const s = await fetchSiteSettings();
      const v: Record<string, string> = {};
      for (const t of textKeys) v[t.k] = settingString(s, t.k);
      setValues(v);
      const c: Record<string, Crisis> = {};
      for (const k of crisisKeys) c[k] = (s[k] as Crisis) ?? { name: "", phone: "" };
      setCrisis(c);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const tasks: Promise<unknown>[] = [];
      for (const t of textKeys) tasks.push(upsertSetting(t.k, values[t.k] ?? ""));
      for (const k of crisisKeys) tasks.push(upsertSetting(k, crisis[k]));
      await Promise.all(tasks);
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trust Operations</h1>
          <p className="text-sm text-muted-foreground">Edit About, Privacy, Disclaimer, Resources, Contact, and Crisis numbers.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          <Save className="h-4 w-4" />{saving ? "Saving…" : "Save all"}
        </button>
      </header>
      {msg && <p className="mb-4 text-sm text-muted-foreground">{msg}</p>}

      {/* Crisis numbers — high visual priority */}
      <section
        className="mb-8 rounded-2xl border-2 p-5"
        style={{ borderColor: "#ea580c", backgroundColor: "color-mix(in oklab, #ea580c 6%, var(--background))" }}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "#ea580c" }}>
          <AlertTriangle className="h-5 w-5" /> Update Crisis Numbers
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">These appear on /resources. Verify accuracy before saving.</p>
        <div className="space-y-4">
          {crisisKeys.map((k) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-mono text-muted-foreground mb-2">{k}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["name", "name_hi", "phone", "hours", "hours_hi", "desc", "desc_hi"] as const).map((f) => (
                  <label key={f} className="text-xs">
                    <span className="font-medium">{f}</span>
                    <input
                      type="text"
                      value={crisis[k]?.[f] ?? ""}
                      onChange={(e) => setCrisis({ ...crisis, [k]: { ...crisis[k], [f]: e.target.value } })}
                      className="mt-1 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Text settings */}
      <section className="space-y-4">
        {textKeys.map((t) => (
          <label key={t.k} className="block">
            <span className="text-sm font-medium">{t.label}</span>
            {t.area ? (
              <textarea
                value={values[t.k] ?? ""}
                onChange={(e) => setValues({ ...values, [t.k]: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            ) : (
              <input
                type="text"
                value={values[t.k] ?? ""}
                onChange={(e) => setValues({ ...values, [t.k]: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Resource link lists (LGBTQIA+, reproductive health) and "What we are not" / "Never collect" lists are stored as JSON in
        site_settings (<code>resource_lgbtq</code>, <code>resource_reproductive_health</code>, <code>what_we_are_not_*</code>,
        <code>privacy_never_collect_*</code>). Edit via SQL until the JSON editor ships.
      </p>
    </div>
  );
}