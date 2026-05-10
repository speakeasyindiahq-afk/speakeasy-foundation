import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, MessageSquare, Headphones, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BottomTabBar() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/", icon: Home, key: "nav.home" as const },
    { to: "/learn", icon: BookOpen, key: "nav.learn" as const },
    { to: "/qa", icon: MessageSquare, key: "nav.qa" as const },
    { to: "/audio", icon: Headphones, key: "nav.audio" as const },
    { to: "/search", icon: Search, key: "nav.search" as const },
  ];

  // Hide on admin routes
  if (path.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-[680px] items-stretch justify-between px-2 py-1.5">
        {tabs.map(({ to, icon: Icon, key }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="h-5 w-5" />
                <span>{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}