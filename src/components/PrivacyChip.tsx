import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PrivacyChip({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 text-xs font-medium text-secondary ${className}`}
      style={{ backgroundColor: "color-mix(in oklab, var(--sage) 14%, transparent)", color: "var(--sage)" }}
    >
      <Lock className="h-3 w-3" />
      {t("privacy.chip")}
    </span>
  );
}