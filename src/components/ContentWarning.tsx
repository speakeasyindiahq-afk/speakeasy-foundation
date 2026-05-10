import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const KEY = "cw-acknowledged";

export function ContentWarning({ enabled = true }: { enabled?: boolean }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true);
    } catch { setShow(true); }
  }, [enabled]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-charcoal/80 px-4" style={{ backgroundColor: "color-mix(in oklab, var(--charcoal) 80%, transparent)" }}>
      <div className="max-w-md w-full rounded-2xl bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold">{t("warn.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("warn.body")}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={() => window.location.replace("https://www.google.com")}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("warn.back")}
          </button>
          <button
            onClick={() => { try { sessionStorage.setItem(KEY, "1"); } catch {}; setShow(false); }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("warn.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}