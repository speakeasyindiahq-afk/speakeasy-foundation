import {
  Activity, HandHeart, ShieldCheck, Heart, Sparkles, Users, Brain, Baby,
  type LucideIcon,
} from "lucide-react";

export type CategoryDef = {
  slug: string;
  en: string;
  hi: string;
  desc_en: string;
  desc_hi: string;
  icon: LucideIcon;
  subcategories: { slug: string; en: string; hi: string }[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "bodies",
    en: "Bodies & anatomy", hi: "शरीर रचना",
    desc_en: "How the body actually works.",
    desc_hi: "शरीर वास्तव में कैसे काम करता है।",
    icon: Activity,
    subcategories: [
      { slug: "anatomy", en: "Anatomy", hi: "रचना" },
      { slug: "puberty", en: "Puberty", hi: "किशोरावस्था" },
      { slug: "menstruation", en: "Menstruation", hi: "मासिक धर्म" },
    ],
  },
  {
    slug: "consent",
    en: "Consent", hi: "सहमति",
    desc_en: "What yes really means.",
    desc_hi: "हाँ का असली मतलब।",
    icon: HandHeart,
    subcategories: [
      { slug: "basics", en: "Basics", hi: "मूल बातें" },
      { slug: "communication", en: "Communication", hi: "बातचीत" },
    ],
  },
  {
    slug: "contraception",
    en: "Contraception", hi: "गर्भनिरोध",
    desc_en: "Options, myths, and facts.",
    desc_hi: "विकल्प, मिथक और तथ्य।",
    icon: ShieldCheck,
    subcategories: [
      { slug: "condoms", en: "Condoms", hi: "कंडोम" },
      { slug: "pills", en: "Pills", hi: "गोलियाँ" },
      { slug: "iuds", en: "IUDs", hi: "आईयूडी" },
      { slug: "emergency", en: "Emergency", hi: "आपातकालीन" },
    ],
  },
  {
    slug: "relationships",
    en: "Relationships", hi: "रिश्ते",
    desc_en: "Healthy partnerships and boundaries.",
    desc_hi: "स्वस्थ रिश्ते और सीमाएँ।",
    icon: Heart,
    subcategories: [
      { slug: "communication", en: "Communication", hi: "बातचीत" },
      { slug: "boundaries", en: "Boundaries", hi: "सीमाएँ" },
    ],
  },
  {
    slug: "sexual-health",
    en: "Sexual health", hi: "यौन स्वास्थ्य",
    desc_en: "STIs, screenings, hygiene.",
    desc_hi: "एसटीआई, जाँच, स्वच्छता।",
    icon: Sparkles,
    subcategories: [
      { slug: "stis", en: "STIs", hi: "एसटीआई" },
      { slug: "screenings", en: "Screenings", hi: "जाँच" },
    ],
  },
  {
    slug: "identity",
    en: "Identity & orientation", hi: "पहचान व रुझान",
    desc_en: "Understanding self, with respect.",
    desc_hi: "स्वयं को आदर के साथ समझना।",
    icon: Users,
    subcategories: [
      { slug: "lgbtq", en: "LGBTQ+", hi: "एलजीबीटीक्यू+" },
      { slug: "gender", en: "Gender", hi: "लिंग पहचान" },
    ],
  },
  {
    slug: "mental-wellness",
    en: "Mental wellness", hi: "मानसिक कल्याण",
    desc_en: "Mind, mood, and intimacy.",
    desc_hi: "मन, मनोदशा और निकटता।",
    icon: Brain,
    subcategories: [
      { slug: "anxiety", en: "Anxiety", hi: "चिंता" },
      { slug: "self-esteem", en: "Self-esteem", hi: "आत्म-सम्मान" },
    ],
  },
  {
    slug: "pregnancy",
    en: "Pregnancy & parenting", hi: "गर्भावस्था व पालन",
    desc_en: "Planning, prenatal, and early care.",
    desc_hi: "योजना, गर्भावस्था और शुरुआती देखभाल।",
    icon: Baby,
    subcategories: [
      { slug: "planning", en: "Planning", hi: "योजना" },
      { slug: "prenatal", en: "Prenatal", hi: "प्रसवपूर्व" },
    ],
  },
];

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const categoryLabel = (slug: string | null | undefined, lang: "en" | "hi") => {
  if (!slug) return "";
  const c = getCategory(slug);
  return c ? (lang === "hi" ? c.hi : c.en) : slug;
};