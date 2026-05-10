import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function HamburgerMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links: Array<{ to: string; key: Parameters<typeof t>[0] }> = [
    { to: "/", key: "nav.home" },
    { to: "/learn", key: "nav.learn" },
    { to: "/qa", key: "nav.qa" },
    { to: "/audio", key: "nav.audio" },
    { to: "/search", key: "nav.search" },
    { to: "/learn", key: "nav.myths" },
    { to: "/", key: "nav.about" },
    { to: "/", key: "nav.trust" },
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
            className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Speakeasy</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1">
              {links.map((l, i) => (
                <Link
                  key={i}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted"
                >
                  {t(l.key)}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}