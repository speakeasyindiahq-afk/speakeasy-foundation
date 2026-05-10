import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function WhatsAppCTA({ href = "https://whatsapp.com/channel/your-channel", className = "" }: { href?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.98] ${className}`}
      style={{ backgroundColor: "#25D366" }}
    >
      <MessageCircle className="h-4 w-4" />
      {t("wa.cta")}
    </a>
  );
}