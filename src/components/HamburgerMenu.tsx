import { useState } from "react";
import { Menu, X, BookOpen, AlertCircle, Headphones, MessageSquare, Search, Shield, Info, Lock, LifeBuoy, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function HamburgerMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const padhai: Array<{ to: string; key: Parameters<typeof t>[0]; Icon: typeof BookOpen }> = [
    { to: "/learn", key: "nav.learn", Icon: BookOpen },
    { to: "/myth", key: "nav.myths", Icon: AlertCircle },
    { to: "/audio", key: "nav.audio", Icon: Headphones },
  ];
  const aur: Array<{ to: string; key: Parameters<typeof t>[0]; Icon: typeof BookOpen }> = [
    { to: "/sawal-jawab", key: "nav.qa", Icon: MessageSquare },
    { to: "/search", key: "nav.search", Icon: Search },
  ];
  const trust: Array<{ to: string; key: Parameters<typeof t>[0]; Icon: typeof BookOpen }> = [
    { to: "/about", key: "nav.about", Icon: Info },
    { to: "/privacy", key: "nav.privacy", Icon: Lock },
    { to: "/resources", key: "nav.resources", Icon: LifeBuoy },
    { to: "/contact", key: "nav.contact", Icon: Mail },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[8000]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-charcoal/50" style={{ backgroundColor: "color-mix(in oklab, var(--charcoal) 50%, transparent)" }} />
          <aside
            className="absolute left-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                  style={{ backgroundColor: "var(--terracotta)" }}
                >S</span>
                <span className="font-display text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Speakeasy</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Section label={t("menu.padhai")} items={padhai} onNav={() => setOpen(false)} />
            <Section label={t("menu.aur")} items={aur} onNav={() => setOpen(false)} />

            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("menu.language")}</span>
              <LanguageToggle />
            </div>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "#25D366" }}
            >
              {t("wa.cta")}
            </a>

            <Section label={t("menu.trust")} items={trust} onNav={() => setOpen(false)} />

            <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
              {t("menu.footnote")}
            </p>
          </aside>
        </div>
      )}
    </>
  );
}

function Section({
  label,
  items,
  onNav,
}: {
  label: string;
  items: Array<{ to: string; key: string; Icon: typeof BookOpen }>;
  onNav: () => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</h3>
      <nav className="mt-2 flex flex-col gap-0.5">
        {items.map(({ to, key, Icon }) => (
          <MenuLink key={to} to={to} onClick={onNav} Icon={Icon} labelKey={key} />
        ))}
      </nav>
    </div>
  );
}

function MenuLink({ to, onClick, Icon, labelKey }: { to: string; onClick: () => void; Icon: typeof BookOpen; labelKey: string }) {
  const { t } = useI18n();
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {t(labelKey as Parameters<typeof t>[0])}
    </Link>
  );
}