"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Dumbbell, LayoutDashboard, LogOut, Target } from "lucide-react";

type AppShellProps = {
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/goals", label: "Goals", icon: Target }
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-ink/10 bg-white px-5 py-6 lg:block">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-fern text-white">
            <Activity aria-hidden size={23} />
          </span>
          <span>
            <span className="block text-lg font-semibold text-ink">Fitness Tracker</span>
            <span className="block text-xs text-ink/50">Training dashboard</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`focus-ring flex items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-medium transition ${
                  active ? "bg-fern text-white" : "text-ink/70 hover:bg-mist hover:text-ink"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-[8px] border border-ink/10 bg-mist p-4">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="mt-1 truncate text-xs text-ink/55">{user.email}</p>
          <button
            className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-wheat"
            onClick={logout}
            type="button"
          >
            <LogOut aria-hidden size={16} />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-2 font-semibold text-ink" href="/dashboard">
            <Activity aria-hidden size={22} />
            Fitness Tracker
          </Link>
          <button className="focus-ring rounded-[8px] border border-ink/10 p-2 text-ink" onClick={logout} type="button">
            <LogOut aria-hidden size={18} />
          </button>
        </div>
        <nav className="mt-3 grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`focus-ring flex items-center justify-center gap-2 rounded-[8px] px-2 py-2 text-xs font-semibold ${
                  active ? "bg-fern text-white" : "bg-mist text-ink/70"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
