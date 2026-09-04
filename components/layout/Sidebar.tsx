"use client";

import {
  Activity,
  Briefcase,
  ChevronDown,
  CircleUserRound,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Credentials",
    href: "/credentials",
    icon: KeyRound,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Briefcase,
  },
  {
    label: "Tags",
    href: "/tags",
    icon: Tags,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
];

const secondaryNavigation = [
  // {
  //   label: "Security",
  //   href: "/security",
  //   icon: ShieldCheck,
  // },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Dashboard should only be active on exactly /dashboard
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // Other navigation items should also be active
    // for their nested routes.
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[156px] border-r border-[var(--border)] bg-[var(--sidebar)] lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-[62px] items-center border-b border-[var(--border)] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
            <LockKeyhole
              size={16}
              strokeWidth={2}
              className="text-[var(--primary)]"
            />
          </div>

          <span className="text-[13px] font-semibold tracking-[-0.02em] text-white">
            ClientVault
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "group flex h-8 items-center gap-2 rounded-md px-2.5",
                  "text-[11px] font-medium transition-colors",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[#87939b] hover:bg-white/[0.03] hover:text-white",
                ].join(" ")}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 h-px bg-[var(--border)]" />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "group flex h-8 items-center gap-2 rounded-md px-2.5",
                  "text-[11px] font-medium transition-colors",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[#87939b] hover:bg-white/[0.03] hover:text-white",
                ].join(" ")}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-[var(--border)] p-2.5">
        <button className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.03]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#27323a]">
            <CircleUserRound size={15} className="text-[#cbd3d8]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium text-white">
              Ahmad Siddiqui
            </p>

            <p className="text-[9px] text-[var(--muted)]">Admin</p>
          </div>

          <ChevronDown size={12} className="shrink-0 text-[var(--muted)]" />
        </button>
      </div>
    </aside>
  );
}
