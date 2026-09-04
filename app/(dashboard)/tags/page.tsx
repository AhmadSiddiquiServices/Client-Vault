"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  MoreVertical,
  Plus,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type TagItem = {
  id: string;
  name: string;
  description: string;
  usage: number;
  category: string;
  updated: string;
};

const tags: TagItem[] = [
  {
    id: "tag-1",
    name: "production",
    description:
      "Credentials and resources used in live production environments.",
    usage: 18,
    category: "Environment",
    updated: "2 hours ago",
  },
  {
    id: "tag-2",
    name: "admin",
    description: "Administrator and privileged accounts.",
    usage: 14,
    category: "Access",
    updated: "5 hours ago",
  },
  {
    id: "tag-3",
    name: "development",
    description: "Development environments, tools and developer accounts.",
    usage: 12,
    category: "Environment",
    updated: "1 day ago",
  },
  {
    id: "tag-4",
    name: "hosting",
    description: "Hosting and deployment related credentials.",
    usage: 9,
    category: "Infrastructure",
    updated: "2 days ago",
  },
  {
    id: "tag-5",
    name: "domain",
    description: "Domain registration and management resources.",
    usage: 8,
    category: "Infrastructure",
    updated: "3 days ago",
  },
  {
    id: "tag-6",
    name: "dns",
    description: "DNS providers and domain configuration.",
    usage: 7,
    category: "Infrastructure",
    updated: "3 days ago",
  },
  {
    id: "tag-7",
    name: "shopify",
    description: "Shopify stores, accounts and related credentials.",
    usage: 6,
    category: "Platform",
    updated: "4 days ago",
  },
  {
    id: "tag-8",
    name: "wordpress",
    description: "WordPress websites and administration accounts.",
    usage: 6,
    category: "Platform",
    updated: "5 days ago",
  },
  {
    id: "tag-9",
    name: "database",
    description: "Database servers, services and management accounts.",
    usage: 5,
    category: "Infrastructure",
    updated: "1 week ago",
  },
  {
    id: "tag-10",
    name: "analytics",
    description: "Analytics and tracking services.",
    usage: 5,
    category: "Service",
    updated: "1 week ago",
  },
  {
    id: "tag-11",
    name: "media",
    description: "Image, video and media storage services.",
    usage: 4,
    category: "Service",
    updated: "2 weeks ago",
  },
  {
    id: "tag-12",
    name: "email",
    description: "Email and communication related accounts.",
    usage: 4,
    category: "Service",
    updated: "2 weeks ago",
  },
];

const categories = [
  "All Types",
  "Environment",
  "Access",
  "Infrastructure",
  "Platform",
  "Service",
];

export default function TagsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Types");

  const filteredTags = useMemo(() => {
    const term = search.toLowerCase().trim();

    return tags.filter((tag) => {
      const matchesSearch =
        !term ||
        tag.name.toLowerCase().includes(term) ||
        tag.description.toLowerCase().includes(term) ||
        tag.category.toLowerCase().includes(term);

      const matchesCategory =
        category === "All Types" || tag.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const totalUsage = tags.reduce((sum, tag) => sum + tag.usage, 0);

  const mostUsedTag = tags.reduce((current, tag) =>
    tag.usage > current.usage ? tag : current,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <Hash size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Tags
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Organize credentials and projects with flexible tags.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/tags/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[14px] text-black transition hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} />
          Add Tag
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Tags"
          value={tags.length}
          icon={<Tag size={16} />}
        />

        <SummaryCard
          label="Total Usage"
          value={totalUsage}
          icon={<TrendingUp size={16} />}
        />

        <SummaryCard
          label="Most Used"
          value={`#${mostUsedTag.name}`}
          icon={<Hash size={16} />}
          textValue
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags..."
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
            />
          </div>

          {/* Type filter */}
          <div className="relative shrink-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 min-w-[170px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
          </div>
        </div>
      </div>

      {/* Tags table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {/* Table header */}
        <div className="hidden grid-cols-[1.5fr_2.6fr_140px_120px_120px_44px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] xl:grid">
          <div>Tag</div>
          <div>Description</div>
          <div>Type</div>
          <div>Usage</div>
          <div>Updated</div>
          <div />
        </div>

        {/* Rows */}
        <div>
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => <TagRow key={tag.id} tag={tag} />)
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <Hash size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                No tags found
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                Try changing your search or filter to find the tag you are
                looking for.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredTags.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[var(--muted)]">
              Showing{" "}
              <span className="font-medium text-white">
                1–{filteredTags.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white">
                {filteredTags.length}
              </span>{" "}
              tags
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[var(--primary)] px-2 text-[11px] font-semibold text-black"
              >
                1
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Tag Row
----------------------------------------- */

function TagRow({ tag }: { tag: TagItem }) {
  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] xl:grid-cols-[1.5fr_2.6fr_140px_120px_120px_44px] xl:items-center">
      {/* Tag */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <Hash size={15} className="text-[var(--primary)]" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-mono text-[12px] font-medium text-white">
              #{tag.name}
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)] xl:hidden">
              {tag.usage} {tag.usage === 1 ? "use" : "uses"}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="min-w-0">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {tag.description}
        </p>
      </div>

      {/* Type */}
      <div>
        <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted)]">
          {tag.category}
        </span>
      </div>

      {/* Usage */}
      <div>
        <span className="text-[12px] font-medium text-white">{tag.usage}</span>

        <span className="ml-1 text-[10px] text-[var(--muted)]">
          {tag.usage === 1 ? "use" : "uses"}
        </span>
      </div>

      {/* Updated */}
      <div>
        <span className="text-[10px] text-[var(--muted)]">{tag.updated}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          title={`Actions for #${tag.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] opacity-100 transition hover:bg-[var(--card)] hover:text-white xl:opacity-0 xl:group-hover:opacity-100"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Mobile type */}
      <div className="xl:hidden">
        <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted)]">
          {tag.category}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Summary Card
----------------------------------------- */

function SummaryCard({
  label,
  value,
  icon,
  textValue = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  textValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--muted)]">{label}</span>

        <div className="text-[var(--muted)]">{icon}</div>
      </div>

      <p
        className={`mt-2 font-semibold tracking-tight text-white ${
          textValue ? "truncate font-mono text-[16px]" : "text-[24px]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
