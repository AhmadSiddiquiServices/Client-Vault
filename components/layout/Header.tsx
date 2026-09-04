"use client";

import { Bell, Search, Sun } from "lucide-react";
import { openCommandMenu } from "./CommandMenu";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-[62px] items-center justify-between border-b border-[var(--border)] px-5">
      {/* Search */}
      <button
        type="button"
        onClick={openCommandMenu}
        className="flex h-8 w-[310px] items-center gap-2 rounded-md border border-[var(--border)] bg-white/[0.015] px-2.5 text-left transition-colors hover:border-[var(--border-hover)]"
      >
        <Search size={13} className="shrink-0 text-[var(--muted)]" />

        <span className="min-w-0 flex-1 truncate text-[10px] text-[#59656d]">
          Search clients, projects, credentials...
        </span>

        <kbd className="hidden shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[8px] text-[var(--muted)] sm:block">
          Ctrl K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          aria-label="Settings"
          title="Settings"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <Sun size={15} />
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <Bell size={15} />

          <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-orange-400" />
        </button>

        <button
          type="button"
          aria-label="Account menu"
          title="Account"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#161e24] text-[9px] font-semibold text-white"
        >
          AS
        </button>
      </div>
    </header>
  );
}
