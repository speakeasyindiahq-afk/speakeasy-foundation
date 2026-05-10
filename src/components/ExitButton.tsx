import { LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ExitButton({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const handleExit = () => {
    window.location.replace("https://www.google.com");
  };
  return (
    <button
      onClick={handleExit}
      aria-label={t("exit")}
      className={`fixed top-3 right-3 z-[9999] inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-lg hover:opacity-90 active:scale-95 transition ${className}`}
    >
      <LogOut className="h-3.5 w-3.5" />
      {t("exit")}
      <span aria-hidden className="ml-1 text-base leading-none">×</span>
    </button>
  );
}