import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AdminLog } from "@/lib/admin-logs";
import { BookOpen, AlertCircle, Headphones, MessageSquare, Clock, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Counts = {
  articlesPublished: number;
  articlesDraft: number;
  myths: number;
  audio: number;
  qaPending: number;
  qaStale: number; // > 7 days
};

function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [aPub, aDr, m, au, qaP, qaStale, logsRes] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("myths").select("id", { count: "exact", head: true }),
        supabase.from("audio_episodes").select("id", { count: "exact", head: true }),
        supabase.from("qa_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("qa_submissions").select("id", { count: "exact", head: true }).eq("status", "pending").lt("submitted_at", sevenDaysAgo),
        supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      if (cancelled) return;
      setCounts({
        articlesPublished: aPub.count ?? 0,
        articlesDraft: aDr.count ?? 0,
        myths: m.count ?? 0,
        audio: au.count ?? 0,
        qaPending: qaP.count ?? 0,
        qaStale: qaStale.count ?? 0,
      });
      setLogs((logsRes.data as AdminLog[] | null) ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { label: "Published articles", value: counts?.articlesPublished, icon: BookOpen, to: "/admin/content/articles" },
    { label: "Draft articles", value: counts?.articlesDraft, icon: BookOpen, to: "/admin/content/articles" },
    { label: "Myths", value: counts?.myths, icon: AlertCircle, to: "/admin/content/myths" },
    { label: "Audio episodes", value: counts?.audio, icon: Headphones, to: "/admin/audio" },
    { label: "Pending Q&A", value: counts?.qaPending, icon: MessageSquare, to: "/admin/qa" },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl">Operations</h1>
      <p className="mt-2 text-muted-foreground">Calm overview of publishing, moderation, and trust.</p>

      {counts && counts.qaStale > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900">
          <Clock className="mt-0.5 h-5 w-5" />
          <div className="text-sm">
            <div className="font-semibold">{counts.qaStale} pending question{counts.qaStale === 1 ? "" : "s"} waiting over 7 days</div>
            <Link to="/admin/qa" className="underline">Open Q&A moderation</Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "…" : c.value ?? 0}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Recent activity</h2>
          <Link to="/admin/settings" className="text-xs text-muted-foreground underline">Settings</Link>
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-card">
          {loading && <div className="p-5 text-sm text-muted-foreground">Loading…</div>}
          {!loading && logs.length === 0 && (
            <div className="p-5 text-sm text-muted-foreground">No admin actions logged yet.</div>
          )}
          {logs.map((l) => (
            <div key={l.id} className="flex items-start justify-between gap-3 border-b border-border p-4 last:border-b-0">
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {l.action}
                  {l.entity_type && <span className="ml-2 text-muted-foreground">· {l.entity_type}</span>}
                </div>
                {l.reason && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{l.reason}</div>}
              </div>
              <div className="text-right text-xs text-muted-foreground shrink-0">
                <div>{new Date(l.created_at).toLocaleString()}</div>
                <div>{l.actor_email ?? "system"}</div>
                {l.severity !== "info" && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                    <ShieldAlert className="h-3 w-3" /> {l.severity}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}