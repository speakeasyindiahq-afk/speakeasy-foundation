import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Phase 1 admin shell. Content management arrives in Phase 2.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Content", "Myths", "Audio", "Q&A", "SEO", "Trust"].map((s) => (
          <div key={s} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold">{s}</h3>
            <p className="mt-1 text-sm text-muted-foreground">No items yet.</p>
          </div>
        ))}
      </div>
    </div>
  );
}