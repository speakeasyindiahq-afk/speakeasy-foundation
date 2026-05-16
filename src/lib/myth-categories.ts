export type MythCategory = { slug: string; en: string; hi: string };

export const MYTH_CATEGORIES: MythCategory[] = [
  { slug: "all", en: "All", hi: "सब" },
  { slug: "sehat", en: "Health", hi: "सेहत" },
  { slug: "shareer", en: "Body", hi: "शरीर" },
  { slug: "rishte", en: "Relationships", hi: "रिश्ते" },
  { slug: "purush", en: "Men", hi: "पुरुष" },
  { slug: "mahila", en: "Women", hi: "महिला" },
  { slug: "lgbtqia", en: "LGBTQIA+", hi: "LGBTQIA+" },
];

export const mythCategoryLabel = (slug: string | null | undefined, lang: "en" | "hi") => {
  if (!slug) return "";
  const c = MYTH_CATEGORIES.find((x) => x.slug === slug);
  return c ? (lang === "hi" ? c.hi : c.en) : slug;
};