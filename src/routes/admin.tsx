import { createFileRoute, Outlet, useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Home, FileText, BookOpen, AlertCircle, Headphones, MessageSquare, Search, Shield, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Speakeasy India" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

const sections = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/content/articles", label: "Articles", icon: BookOpen },
  { to: "/admin/content/myths", label: "Myths", icon: AlertCircle },
  { to: "/admin/dashboard", label: "Content", icon: FileText },
  { to: "/admin/audio", label: "Audio", icon: Headphones },
  { to: "/admin/qa", label: "Q&A", icon: MessageSquare },
  { to: "/admin/dashboard", label: "SEO", icon: Search },
  { to: "/admin/dashboard", label: "Trust", icon: Shield },
  { to: "/admin/dashboard", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const isAuth = !!data.session;
      setAuthed(isAuth);
      setChecked(true);
      if (!isAuth && path !== "/admin/login") {
        navigate({ to: "/admin/login" });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (!session && path !== "/admin/login") navigate({ to: "/admin/login" });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [path, navigate]);

  // Login page renders standalone (no sidebar)
  if (path === "/admin/login") {
    return <div className="min-h-screen bg-background"><Outlet /></div>;
  }

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card p-4">
        <div className="px-2 pb-4">
          <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Speakeasy Admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sections.map((s, i) => (
            <Link
              key={i}
              to={s.to}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
          className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10"><Outlet /></main>
    </div>
  );
}