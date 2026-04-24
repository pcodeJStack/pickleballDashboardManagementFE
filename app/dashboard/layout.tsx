"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { navGroups, navItems } from "@/constants/navigation-menu";
type DashboardLayoutProps = {
  children: ReactNode;
};
const isNavItemActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(href + "/");
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const currentNav = navItems.find((item) =>
    isNavItemActive(pathname, item.href),
  );

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/70">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-lime-300 shadow-[0_0_24px_rgba(250,204,21,0.55)]" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-slate-50">
              Pickleball Smart
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Booking Dashboard
            </span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4 text-sm">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {group.title}
              </p>
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-start gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
                      active
                        ? "border-amber-200/20 bg-slate-900 text-slate-50 shadow-[0_0_30px_rgba(250,204,21,0.35)]"
                        : "border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 hover:border-slate-700/80"
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/70 text-slate-300 group-hover:bg-slate-800 group-hover:text-amber-200 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{item.label}</span>

                      <span className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-4 pt-3 border-t border-slate-800/70">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 rounded-xl border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 hover:text-amber-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-2xl">
          <div className="flex h-14 items-center justify-between px-4 md:px-7">
            <div className="flex items-center gap-3 md:hidden">
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-lime-300 shadow-lg shadow-amber-500/30" />
              <span className="text-sm font-semibold tracking-wide">
                Pickleball Smart
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="hidden md:flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Dashboard
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-50">
                    {currentNav?.label ?? "Tổng quan"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    | Pickleball Club
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400">
                <span className="hidden sm:inline">Xin chào, Admin</span>
             
                <div className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100 border border-slate-700">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/80 via-slate-950/95 to-slate-900/90 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <div className="p-4 md:p-6 lg:p-7">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
