import { Phone, HeartHandshake } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CrisisSupport() {
  const { t } = useI18n();
  return (
    <aside
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "color-mix(in oklab, var(--sage) 14%, var(--background))",
        borderColor: "color-mix(in oklab, var(--sage) 40%, transparent)",
      }}
    >
      <div className="flex items-start gap-3">
        <HeartHandshake className="h-5 w-5 mt-0.5" style={{ color: "var(--sage)" }} />
        <div className="flex-1">
          <h3 className="text-base font-semibold" style={{ color: "var(--sage)" }}>
            {t("crisis.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("crisis.body")}</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href="tel:9152987821" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--sage)" }}>
              <Phone className="h-4 w-4" /> {t("crisis.icall")}
            </a>
            <a href="tel:18602662345" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--sage)" }}>
              <Phone className="h-4 w-4" /> {t("crisis.vandrevala")}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}