export type AudioCategory = { slug: string; en: string; hi: string };

export const AUDIO_CATEGORIES: AudioCategory[] = [
  { slug: "all", en: "All", hi: "सब" },
  { slug: "sehat", en: "Sehat", hi: "सेहत" },
  { slug: "rishte", en: "Rishte", hi: "रिश्ते" },
  { slug: "myths", en: "Myths", hi: "भ्रांतियाँ" },
  { slug: "lgbtqia", en: "LGBTQIA+", hi: "LGBTQIA+" },
  { slug: "beginners", en: "Beginners", hi: "शुरुआती" },
];

export const audioCategoryLabel = (slug: string | null | undefined, lang: "en" | "hi") => {
  if (!slug) return "";
  const c = AUDIO_CATEGORIES.find((x) => x.slug === slug);
  return c ? (lang === "hi" ? c.hi : c.en) : slug;
};