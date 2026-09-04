import {
  ChevronRight,
  GitBranch,
  Cloud,
  Database,
  ShoppingBag,
  Server,
} from "lucide-react";
import Link from "next/link";

const credentials = [
  {
    id: "github-main-account",
    name: "GitHub - Main Account",
    client: "GumJoy",
    time: "2h ago",
    icon: GitBranch,
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    client: "Wilder Side of Sports",
    time: "5h ago",
    icon: Cloud,
  },
  {
    id: "mongodb-production",
    name: "MongoDB Production",
    client: "Wilder Side of Sports",
    time: "1d ago",
    icon: Database,
  },
  {
    id: "shopify-admin",
    name: "Shopify Admin",
    client: "GumJoy",
    time: "1d ago",
    icon: ShoppingBag,
  },
  {
    id: "cpanel-hosting",
    name: "cPanel Hosting",
    client: "GumJoy",
    time: "2d ago",
    icon: Server,
  },
];

export function RecentCredentials() {
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
        {credentials.map((credential) => {
          const Icon = credential.icon;

          return (
            <Link
              key={credential.id}
              href={`/credentials/${credential.id}`}
              className="group flex h-10 items-center gap-2 rounded-lg px-2 transition-colors hover:bg-white/[0.025]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05]">
                <Icon size={13} className="text-[#b7c1c7]" strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[#dce1e4]">
                  {credential.name}
                </p>
              </div>

              <span className="hidden text-[10px] text-[#626e76] sm:block">
                {credential.client}
              </span>

              <span className="w-10 text-right text-[10px] text-[#626e76]">
                {credential.time}
              </span>

              <ChevronRight
                size={12}
                className="text-[#4e5a62] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
