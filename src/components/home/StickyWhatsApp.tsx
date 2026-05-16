import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function StickyWhatsApp({ href }: { href: string }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      setShow(scrolled > 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed left-0 right-0 z-40 px-3 md:hidden" style={{ bottom: "64px" }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex max-w-[680px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle className="h-4 w-4" /> {t("home.wa.sticky")}
      </a>
    </div>
  );
}