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
  "home.search.placeholder": { en: "What are you looking for?", hi: "क्या ढूंढ रहे हो?" },
  "home.topics.title": { en: "Explore topics", hi: "विषय खोजें" },
  "home.topics.subtitle": { en: "Bite-sized lessons across the essentials.", hi: "ज़रूरी विषयों पर छोटे-छोटे पाठ।" },
  "home.topics.bodies": { en: "Bodies & anatomy", hi: "शरीर रचना" },
  "home.topics.consent": { en: "Consent", hi: "सहमति" },
  "home.topics.contraception": { en: "Contraception", hi: "गर्भनिरोध" },
  "home.topics.relationships": { en: "Relationships", hi: "रिश्ते" },
  "home.topics.health": { en: "Sexual health", hi: "यौन स्वास्थ्य" },
  "home.topics.identity": { en: "Identity & orientation", hi: "पहचान व रुझान" },
  "home.featured.title": { en: "Today's reading", hi: "आज की पढ़ाई" },
  "home.featured.subtitle": { en: "Fresh, medically-reviewed pieces.", hi: "नई, चिकित्सकीय रूप से समीक्षित सामग्री।" },
  "home.featured.read": { en: "Read", hi: "पढ़ें" },
  "home.myth.eyebrow": { en: "Myth of the week", hi: "इस हफ़्ते का मिथक" },
  "home.myth.myth": { en: "Myth", hi: "भ्रांति" },
  "home.myth.fact": { en: "Truth", hi: "सच" },
  "home.qa.eyebrow": { en: "Anonymous Q&A", hi: "गुमनाम प्रश्नोत्तर" },
  "home.qa.title": { en: "Send your question", hi: "अपना सवाल भेजो" },
  "home.qa.body": { en: "No name, no number, no email. Doctors answer within 48 hours.", hi: "न नाम, न नंबर, न ईमेल। डॉक्टर 48 घंटे में जवाब देते हैं।" },
  "home.qa.cta": { en: "Ask anonymously", hi: "गुमनाम पूछें" },
  "home.qa.privacy1": { en: "End-to-end private", hi: "पूरी तरह निजी" },
  "home.qa.privacy2": { en: "No tracking", hi: "कोई ट्रैकिंग नहीं" },
  "home.qa.privacy3": { en: "Doctor-reviewed", hi: "डॉक्टर-समीक्षित" },
  "home.audio.title": { en: "Listen & learn", hi: "सुनके सीखो" },
  "home.audio.subtitle": { en: "Private audio lessons. Headphones recommended.", hi: "निजी ऑडियो पाठ। हेडफ़ोन की सिफारिश।" },
  "home.audio.minutes": { en: "min", hi: "मिनट" },
  "home.trust.eyebrow": { en: "Trust", hi: "विश्वास" },
  "home.trust.title": { en: "Every piece is expert-reviewed", hi: "हर सामग्री विशेषज्ञ-समीक्षित है" },
  "home.trust.body": { en: "Doctors, counsellors, and educators review our content before publishing.", hi: "हमारे डॉक्टर, परामर्शदाता और शिक्षक प्रकाशन से पहले हर सामग्री की समीक्षा करते हैं।" },
  "home.wa.eyebrow": { en: "WhatsApp channel", hi: "व्हाट्सऐप चैनल" },
  "home.wa.title": { en: "Learn one new thing daily", hi: "रोज़ाना एक नई बात सीखो" },
  "home.wa.body": { en: "A short, private daily lesson on WhatsApp.", hi: "व्हाट्सऐप पर एक छोटा, निजी रोज़ाना पाठ।" },
  "home.wa.sticky": { en: "Join WhatsApp channel", hi: "व्हाट्सऐप चैनल जॉइन करें" },

  "learn.hub.title": { en: "Learn", hi: "सीखें" },
  "learn.hub.subtitle": { en: "Medically-reviewed lessons across every essential topic.", hi: "हर ज़रूरी विषय पर चिकित्सकीय रूप से समीक्षित पाठ।" },
  "learn.search": { en: "Search lessons…", hi: "पाठ खोजें…" },
  "learn.recent": { en: "Recently added", hi: "नवीनतम" },
  "learn.popular": { en: "Most read", hi: "सबसे ज़्यादा पढ़े गए" },
  "learn.allTopics": { en: "All topics", hi: "सभी विषय" },
  "learn.articleCount.one": { en: "article", hi: "लेख" },
  "learn.articleCount.many": { en: "articles", hi: "लेख" },
  "learn.empty": { en: "No articles yet in this topic. Check back soon.", hi: "इस विषय में अभी कोई लेख नहीं है। जल्द ही देखें।" },
  "learn.breadcrumb.home": { en: "Home", hi: "मुख्य" },
  "learn.breadcrumb.learn": { en: "Learn", hi: "सीखें" },
  "learn.allSubcats": { en: "All", hi: "सभी" },
  "article.reviewedBy": { en: "Reviewed by", hi: "समीक्षक" },
  "article.reviewedOn": { en: "Reviewed on", hi: "समीक्षा तिथि" },
  "article.expertInsight": { en: "Expert insight", hi: "विशेषज्ञ की राय" },
  "article.sources": { en: "Sources", hi: "स्रोत" },
  "article.helpful.q": { en: "Was this helpful?", hi: "क्या यह सहायक था?" },
  "article.helpful.yes": { en: "Yes, helpful", hi: "हाँ, सहायक" },
  "article.helpful.no": { en: "Not really", hi: "बहुत नहीं" },
  "article.helpful.thanks": { en: "Thank you for your feedback.", hi: "आपकी प्रतिक्रिया के लिए धन्यवाद।" },
  "article.share.wa": { en: "Share on WhatsApp", hi: "व्हाट्सऐप पर साझा करें" },
  "article.related": { en: "Related reading", hi: "संबंधित लेख" },
  "article.disclaimer": {
    en: "This content is for education only and is not a substitute for medical advice. For personal concerns, consult a qualified clinician.",
    hi: "यह सामग्री केवल शिक्षा के लिए है और चिकित्सीय सलाह का विकल्प नहीं है। व्यक्तिगत समस्याओं के लिए योग्य चिकित्सक से परामर्श करें।",
  },
  "article.cw.title": { en: "Sensitive content ahead", hi: "आगे संवेदनशील सामग्री" },
  "article.cw.body": {
    en: "This article discusses sensitive topics. You can continue or step away — your choice.",
    hi: "यह लेख संवेदनशील विषयों पर चर्चा करता है। आप जारी रख सकते हैं या रुक सकते हैं — चुनाव आपका है।",
  },
  "article.notfound": { en: "Article not found.", hi: "लेख नहीं मिला।" },
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