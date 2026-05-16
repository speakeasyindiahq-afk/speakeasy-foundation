import { supabase } from "./supabase";

export type SiteSettings = Record<string, unknown>;

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from("site_settings").select("key,value");
    if (error || !data) return {};
    return Object.fromEntries(data.map((r: { key: string; value: unknown }) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export function settingString(s: SiteSettings, key: string, fallback = ""): string {
  const v = s[key];
  return typeof v === "string" ? v : fallback;
}

export async function upsertSetting(key: string, value: unknown) {
  return supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

export type Article = {
  id: string; slug?: string | null; title: string; title_hi?: string | null;
  excerpt?: string | null; excerpt_hi?: string | null; cover_url?: string | null;
  category?: string | null; created_at: string;
};
export type Myth = {
  id: string; myth: string; myth_hi?: string | null; fact: string; fact_hi?: string | null;
  created_at: string;
};
export type AudioEpisode = {
  id: string; title: string; title_hi?: string | null; description?: string | null;
  duration_minutes?: number | null; audio_url?: string | null; cover_url?: string | null;
  created_at: string;
};
export type Expert = {
  id: string; name: string; credentials?: string | null; avatar_url?: string | null;
};