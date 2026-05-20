import { supabase } from "./supabase";

export type AdminLogSeverity = "info" | "warning" | "critical";

export type AdminLogInput = {
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  reason?: string | null;
  severity?: AdminLogSeverity;
  metadata?: Record<string, unknown> | null;
};

export async function logAdminAction(input: AdminLogInput) {
  try {
    const { data: u } = await supabase.auth.getUser();
    const actor = u.user;
    await supabase.from("admin_logs").insert({
      actor_id: actor?.id ?? null,
      actor_email: actor?.email ?? null,
      action: input.action,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      reason: input.reason ?? null,
      severity: input.severity ?? "info",
      metadata: input.metadata ?? null,
    });
  } catch (e) {
    // Logging must never break the action.
    console.warn("[admin-logs] failed to log action", e);
  }
}

export type AdminLog = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  reason: string | null;
  severity: AdminLogSeverity;
  created_at: string;
};
