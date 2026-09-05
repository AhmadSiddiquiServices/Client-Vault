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
  LogOut,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Load current authenticated user
  useEffect(() => {
    let cancelled = false;

    async function fetchCurrentUser() {
      try {
        setUserLoading(true);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load current user.");
        }

        if (!cancelled) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("Current user fetch error:", error);

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    }

    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown with Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to logout.");
      }

      setProfileOpen(false);
      setUser(null);

      toast.success("Logged out successfully.");

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging out.",
      );

      setLoggingOut(false);
    }
  }

  const displayName = user?.name || "Loading...";
  const displayEmail = user?.email || "";

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "";

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
      </nav>

      {/* User */}
      <div
        ref={profileRef}
        className="relative border-t border-[var(--border)] p-2.5"
      >
        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute bottom-[58px] left-2.5 right-2.5 z-50 overflow-hidden rounded-lg border border-[var(--border)] bg-[#11181e] shadow-[0_12px_35px_rgba(0,0,0,0.4)]">
            {/* User info */}
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="truncate text-[11px] font-medium text-white">
                {user?.name || "Account"}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-[var(--muted)]">
                {user?.email || ""}
              </p>
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              className="flex h-9 items-center gap-2 px-3 text-[11px] font-medium text-[#aeb8be] transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <Settings size={13} strokeWidth={1.8} />
              <span>Settings</span>
            </Link>

            <div className="mx-2 h-px bg-[var(--border)]" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-9 w-full items-center gap-2 px-3 text-left text-[11px] font-medium text-[#aeb8be] transition-colors hover:bg-red-500/[0.06] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={13} strokeWidth={1.8} />

              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        )}

        {/* Profile Button */}
        <button
          type="button"
          onClick={() => setProfileOpen((current) => !current)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed"
        >
          {/* Avatar */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#27323a]">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : initials ? (
              <span className="text-[9px] font-semibold text-[#d8e0e4]">
                {initials}
              </span>
            ) : (
              <CircleUserRound size={15} className="text-[#cbd3d8]" />
            )}
          </div>

          {/* User name/email */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium text-white">
              {userLoading ? "Loading..." : displayName}
            </p>

            <p className="truncate text-[9px] text-[var(--muted)]">
              {userLoading ? "" : displayEmail}
            </p>
          </div>

          <ChevronDown
            size={12}
            className={[
              "shrink-0 text-[var(--muted)] transition-transform",
              profileOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>
    </aside>
  );
}
