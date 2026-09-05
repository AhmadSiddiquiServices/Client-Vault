import {
  ChevronRight,
  GitBranch,
  Cloud,
  Database,
  ShoppingBag,
  Server,
} from "lucide-react";
import Link from "next/link";

import type { DashboardCredential } from "@/types/dashboard";

interface RecentCredentialsProps {
  credentials: DashboardCredential[];
}

const credentialIcons = [GitBranch, Cloud, Database, ShoppingBag, Server];

export function RecentCredentials({ credentials }: RecentCredentialsProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-3">
        <h2 className="text-[14px] font-semibold text-white">
          Recent Credentials
        </h2>

        <Link
          href="/credentials"
          className="flex items-center gap-1 text-[12px] text-[#78858d] transition-colors hover:text-white"
        >
          View all
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Credentials */}
      <div className="px-1.5 py-1.5">
        {credentials.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
            <p className="text-[12px] font-medium text-[#8b969d]">
              No credentials yet
            </p>

            <p className="mt-1 text-[10px] text-[#59656d]">
              Add your first credential to see it here.
            </p>

            <Link
              href="/credentials/new"
              className="mt-3 text-[11px] font-medium text-[var(--primary)] transition-colors hover:text-white"
            >
              Add credential
            </Link>
          </div>
        ) : (
          credentials.map((credential, index) => {
            const Icon = credentialIcons[index % credentialIcons.length];

            const clientName = credential.client?.name ?? "Unknown client";

            return (
              <Link
                key={credential._id}
                href={`/credentials/${credential._id}`}
                className="group flex h-10 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-white/[0.025]"
              >
                {/* Icon */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05]">
                  <Icon
                    size={13}
                    className="text-[#b7c1c7]"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-[#dce1e4]">
                    {credential.name}
                  </p>
                </div>

                {/* Client */}
                <span className="hidden max-w-[120px] truncate text-[10px] text-[#626e76] sm:block">
                  {clientName}
                </span>

                {/* Updated */}
                <span className="w-16 text-right text-[10px] text-[#626e76]">
                  {formatRelativeTime(credential.updatedAt)}
                </span>

                {/* Arrow */}
                <ChevronRight
                  size={12}
                  className="text-[#4e5a62] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diff = Date.now() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}
