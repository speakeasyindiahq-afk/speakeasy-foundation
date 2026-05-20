import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings, settingString, upsertSetting } from "@/lib/site-settings";
import { logAdminAction } from "@/lib/admin-logs";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Speakeasy Admin" }] }),
  component: SettingsPage,
});

const EMERGENCY_SCOPES = [
  { key: "articles", label: "Articles" },
  { key: "myths", label: "Myths" },
  { key: "audio_episodes", label: "Audio episodes" },
  { key: "qa_submissions", label: "Q&A answers" },
] as const;

function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [deployHook, setDeployHook] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Emergency state
  const [scope, setScope] = useState<string>("");
  const [reason, setReason] = useState("");
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      const s = await fetchSiteSettings();
      setDeployHook(settingString(s, "search_deploy_hook_url", ""));
    })();
  }, []);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) { setPasswordMsg("Use at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordMsg(error.message); return; }
    setNewPassword("");
    setPasswordMsg("Password updated.");
  };

  const saveDeployHook = async () => {
    setSavedMsg(null);
    await upsertSetting("search_deploy_hook_url", deployHook);
    await logAdminAction({ action: "settings_update", entity_type: "settings", entity_id: "search_deploy_hook_url" });
    setSavedMsg("Saved.");
  };

  const triggerRebuild = async () => {
    if (!deployHook) { setSavedMsg("Set a deploy hook URL first."); return; }
    try {
      await fetch(deployHook, { method: "POST" });
      await logAdminAction({ action: "search_rebuild", entity_type: "settings", severity: "info" });
      setSavedMsg("Rebuild triggered.");
    } catch (e) {
      setSavedMsg("Failed to trigger rebuild.");
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); };

  const runEmergencyHide = async () => {
    setEmergencyMsg(null);
    if (!scope) { setEmergencyMsg("Select a content scope."); return; }
    if (reason.trim().length < 10) { setEmergencyMsg("Reason must be at least 10 characters."); return; }
    if (!confirm1 || !confirm2) { setEmergencyMsg("Both confirmations are required."); return; }
    setRunning(true);
    const { data: updated, error } = await supabase
      .from(scope)
      .update({ status: "hidden" })
      .eq("status", "published")
      .select("id");
    const count = updated?.length ?? 0;
    setRunning(false);
    if (error) { setEmergencyMsg(`Failed: ${error.message}`); return; }
    await logAdminAction({
      action: "emergency_hide",
      entity_type: scope,
      reason: reason.trim(),
      severity: "critical",
      metadata: { affected: count ?? null },
    });
    setEmergencyMsg(`Hidden ${count ?? 0} published item${count === 1 ? "" : "s"}. Reversible from the relevant content page.`);
    setReason(""); setConfirm1(false); setConfirm2(false); setScope("");
  };

  return (
    <div className="max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Session, search rebuild controls, and emergency tools.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{email ?? "…"}</span></p>
        <button onClick={signOut} className="mt-4 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Sign out</button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Update password</h2>
        <form onSubmit={updatePassword} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Update</button>
        </form>
        {passwordMsg && <p className="mt-2 text-sm text-muted-foreground">{passwordMsg}</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Deploy hook & search rebuild</h2>
        <label className="mt-3 block text-xs font-medium text-muted-foreground">Deploy hook URL</label>
        <input value={deployHook} onChange={(e) => setDeployHook(e.target.value)} placeholder="https://api.vercel.com/v1/integrations/deploy/..." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <div className="mt-3 flex gap-2">
          <button onClick={saveDeployHook} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Save</button>
          <button onClick={triggerRebuild} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Trigger rebuild</button>
        </div>
        {savedMsg && <p className="mt-2 text-sm text-muted-foreground">{savedMsg}</p>}
      </section>

      <section className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold text-destructive">Emergency visibility control</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Temporarily hides all currently published items in the selected scope. Reversible — trust, admin, and unpublished content are not affected.
            </p>
          </div>
        </div>

        <label className="mt-4 block text-xs font-medium text-muted-foreground">Scope</label>
        <select value={scope} onChange={(e) => setScope(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select content type…</option>
          {EMERGENCY_SCOPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>

        <label className="mt-4 block text-xs font-medium text-muted-foreground">Reason (required, logged)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Why are you taking this action?" />

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={confirm1} onChange={(e) => setConfirm1(e.target.checked)} />
            I understand this hides all published items in scope.
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={confirm2} onChange={(e) => setConfirm2(e.target.checked)} />
            I confirm this action is necessary and will be logged.
          </label>
        </div>

        <button
          disabled={running || !scope || !confirm1 || !confirm2}
          onClick={runEmergencyHide}
          className="mt-4 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
        >
          {running ? "Hiding…" : "Hide all published in scope"}
        </button>
        {emergencyMsg && <p className="mt-2 text-sm">{emergencyMsg}</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Environment diagnostics</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Supabase URL</dt><dd className="truncate">{import.meta.env.VITE_SUPABASE_URL ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground">Mode</dt><dd>{import.meta.env.MODE}</dd></div>
        </dl>
      </section>
    </div>
  );
}