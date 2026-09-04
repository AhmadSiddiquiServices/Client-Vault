import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  positive?: boolean;
  href?: string;
}

export function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  positive = true,
  href,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#78858d]">{title}</p>

          <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          <Icon size={16} strokeWidth={1.8} className="text-[var(--primary)]" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {change && (
          <span
            className={[
              "flex items-center gap-0.5 text-[11px] font-medium",
              positive ? "text-[var(--primary)]" : "text-red-400",
            ].join(" ")}
          >
            <ArrowUpRight size={11} />
            {change}
          </span>
        )}

        {description && (
          <span className="text-[11px] text-[#5f6b73]">{description}</span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 transition-colors hover:border-[var(--border-hover)]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 transition-colors hover:border-[var(--border-hover)]">
      {content}
    </div>
  );
}
