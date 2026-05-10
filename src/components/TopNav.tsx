import { Link } from "@tanstack/react-router";
import { LanguageToggle } from "./LanguageToggle";
import { HamburgerMenu } from "./HamburgerMenu";
import { LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function TopNav() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
            style={{ backgroundColor: "var(--terracotta)" }}
          >
            S
          </span>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Speakeasy
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => window.location.replace("https://www.google.com")}
            aria-label={t("exit")}
            className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span aria-hidden>×</span>
          </button>
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}