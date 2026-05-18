import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PrivacyChip } from "./PrivacyChip";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground" style={{ backgroundColor: "var(--terracotta)" }}>S</span>
              <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Speakeasy India</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>
            <div className="mt-3"><PrivacyChip /></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t("footer.learn")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/learn" className="hover:text-foreground">{t("nav.learn")}</Link></li>
              <li><Link to="/audio" className="hover:text-foreground">{t("nav.audio")}</Link></li>
              <li><Link to="/qa" className="hover:text-foreground">{t("nav.qa")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t("footer.support")}</h4>
            <a
              href="tel:9152987821"
              className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ backgroundColor: "color-mix(in oklab, var(--sage) 14%, transparent)", color: "var(--sage)" }}
            >
              <Phone className="h-4 w-4" /> {t("footer.icall")}
            </a>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/resources" className="hover:text-foreground">Resources</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t("footer.about")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}