import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground" style={{ backgroundColor: "var(--terracotta)" }}>
            <Lock className="h-4 w-4" />
          </span>
          <h1 className="text-xl">Admin sign in</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Speakeasy India staff only.</p>

        <label className="mt-5 block text-sm font-medium">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <button type="submit" disabled={loading} className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}