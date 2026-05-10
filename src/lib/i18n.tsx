import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const dict: Dict = {
  "nav.home": { en: "Home", hi: "मुख्य" },
  "nav.learn": { en: "Learn", hi: "सीखें" },
  "nav.qa": { en: "Q&A", hi: "प्रश्नोत्तर" },
  "nav.audio": { en: "Audio", hi: "ऑडियो" },
  "nav.search": { en: "Search", hi: "खोज" },
  "nav.myths": { en: "Myths", hi: "भ्रांतियाँ" },
  "nav.about": { en: "About", hi: "हमारे बारे में" },
  "nav.trust": { en: "Trust & Safety", hi: "विश्वास व सुरक्षा" },
  "exit": { en: "Exit", hi: "बाहर" },
  "lang.toggle": { en: "हिंदी", hi: "English" },
  "warn.title": { en: "Sensitive education content", hi: "संवेदनशील शैक्षिक सामग्री" },
  "warn.body": {
    en: "This page contains medically-reviewed sexual health education for adults. Continue only if you are 18+.",
    hi: "इस पृष्ठ पर वयस्कों के लिए चिकित्सकीय रूप से समीक्षित यौन स्वास्थ्य शिक्षा है। केवल 18+ होने पर जारी रखें।",
  },
  "warn.continue": { en: "Continue", hi: "जारी रखें" },
  "warn.back": { en: "Go back", hi: "वापस जाएँ" },
  "crisis.title": { en: "Need someone to talk to?", hi: "किसी से बात करनी है?" },
  "crisis.body": {
    en: "Free, confidential support from trained counsellors.",
    hi: "प्रशिक्षित परामर्शदाताओं से मुफ़्त, गोपनीय सहायता।",
  },
  "crisis.icall": { en: "iCall: 9152987821", hi: "iCall: 9152987821" },
  "crisis.vandrevala": { en: "Vandrevala: 1860 2662 345", hi: "वंद्रेवाला: 1860 2662 345" },
  "wa.cta": { en: "Join our WhatsApp channel", hi: "हमारा WhatsApp चैनल जॉइन करें" },
  "privacy.chip": { en: "Private & anonymous", hi: "निजी और गुमनाम" },
  "footer.tagline": {
    en: "Trust-first sexual wellness education for India.",
    hi: "भारत के लिए विश्वास-केंद्रित यौन कल्याण शिक्षा।",
  },
  "footer.learn": { en: "Learn", hi: "सीखें" },
  "footer.support": { en: "Support", hi: "सहायता" },
  "footer.about": { en: "About", hi: "बारे में" },
  "footer.icall": { en: "iCall helpline: 9152987821", hi: "iCall हेल्पलाइन: 9152987821" },
  "footer.copyright": {
    en: "© Speakeasy India. Education only. Not medical advice.",
    hi: "© Speakeasy India. केवल शिक्षा। चिकित्सीय सलाह नहीं।",
  },
  "home.eyebrow": { en: "Education-first", hi: "शिक्षा-प्रथम" },
  "home.title": {
    en: "Honest answers about sexual wellness.",
    hi: "यौन कल्याण के बारे में ईमानदार उत्तर।",
  },
  "home.subtitle": {
    en: "Medically-reviewed, judgement-free, in your language.",
    hi: "चिकित्सकीय रूप से समीक्षित, बिना निर्णय, आपकी भाषा में।",
  },
  "home.cta.learn": { en: "Start learning", hi: "सीखना शुरू करें" },
  "home.cta.qa": { en: "Ask anonymously", hi: "गुमनाम पूछें" },
  "home.feat.myths": { en: "Myth busters", hi: "भ्रांति निवारण" },
  "home.feat.myths.body": {
    en: "Common myths corrected by clinicians.",
    hi: "चिकित्सकों द्वारा सही की गई आम भ्रांतियाँ।",
  },
  "home.feat.audio": { en: "Audio lessons", hi: "ऑडियो पाठ" },
  "home.feat.audio.body": {
    en: "Listen privately. No video, no judgement.",
    hi: "निजी रूप से सुनें। न वीडियो, न निर्णय।",
  },
  "home.feat.qa": { en: "Anonymous Q&A", hi: "गुमनाम प्रश्नोत्तर" },
  "home.feat.qa.body": {
    en: "Ask anything. We protect your identity.",
    hi: "कुछ भी पूछें। हम आपकी पहचान सुरक्षित रखते हैं।",
  },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict[k]?.en ?? String(k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (stored === "en" || stored === "hi") setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.classList.toggle("lang-hi", lang === "hi");
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? dict[k]?.en ?? String(k);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);