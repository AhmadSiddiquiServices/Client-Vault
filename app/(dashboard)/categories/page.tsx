"use client";

import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Server,
  ShoppingBag,
  BarChart3,
  Globe,
  Code2,
  Database,
  Mail,
  Share2,
  HardDrive,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  description: string;
  credentials: number;
  color: string;
  icon: string;
  updated: string;
};

const categories: Category[] = [
  {
    id: "cat-1",
    name: "E-Commerce",
    description: "Online stores, shopping platforms and commerce services.",
    credentials: 8,
    color: "emerald",
    icon: "shopping",
    updated: "2 hours ago",
  },
  {
    id: "cat-2",
    name: "Development",
    description: "Git repositories, development tools and coding platforms.",
    credentials: 12,
    color: "blue",
    icon: "code",
    updated: "1 day ago",
  },
  {
    id: "cat-3",
    name: "Hosting",
    description: "Hosting providers, deployment platforms and servers.",
    credentials: 9,
    color: "purple",
    icon: "server",
    updated: "2 days ago",
  },
  {
    id: "cat-4",
    name: "Database",
    description: "Database servers, cloud databases and management tools.",
    credentials: 6,
    color: "cyan",
    icon: "database",
    updated: "3 days ago",
  },
  {
    id: "cat-5",
    name: "Domain / DNS",
    description: "Domains, DNS providers and domain management accounts.",
    credentials: 7,
    color: "orange",
    icon: "globe",
    updated: "4 days ago",
  },
  {
    id: "cat-6",
    name: "Analytics",
    description: "Analytics, tracking and reporting platforms.",
    credentials: 5,
    color: "yellow",
    icon: "analytics",
    updated: "5 days ago",
  },
  {
    id: "cat-7",
    name: "CMS",
    description: "Content management systems and administration accounts.",
    credentials: 4,
    color: "pink",
    icon: "folder",
    updated: "1 week ago",
  },
  {
    id: "cat-8",
    name: "Email",
    description: "Email providers, mailboxes and communication platforms.",
    credentials: 6,
    color: "red",
    icon: "mail",
    updated: "1 week ago",
  },
  {
    id: "cat-9",
    name: "Social Media",
    description: "Social media accounts and management platforms.",
    credentials: 5,
    color: "indigo",
    icon: "social",
    updated: "2 weeks ago",
  },
  {
    id: "cat-10",
    name: "Storage / Media",
    description: "File storage, image hosting and media services.",
    credentials: 4,
    color: "teal",
    icon: "storage",
    updated: "2 weeks ago",
  },
  {
    id: "cat-11",
    name: "Security",
    description: "Security tools, certificates and authentication services.",
    credentials: 3,
    color: "green",
    icon: "security",
    updated: "3 weeks ago",
  },
  {
    id: "cat-12",
    name: "API",
    description: "API credentials, keys, tokens and integrations.",
    credentials: 8,
    color: "slate",
    icon: "settings",
    updated: "3 weeks ago",
  },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term),
    );
  }, [search]);

  const totalCredentials = categories.reduce(
    (total, category) => total + category.credentials,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <FolderOpen size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Categories
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Organize and manage credential categories.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/categories/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[14px] text-black transition hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} />
          Add Category
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Categories"
          value={categories.length}
          icon={<FolderOpen size={16} />}
        />

        <SummaryCard
          label="Total Credentials"
          value={totalCredentials}
          icon={<Shield size={16} />}
        />

        <SummaryCard
          label="Active Categories"
          value={categories.length}
          icon={<Settings2 size={16} />}
        />
      </div>

      {/* Search */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Categories table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {/* Desktop header */}
        <div className="hidden grid-cols-[2fr_2.6fr_130px_130px_44px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] lg:grid">
          <div>Category</div>
          <div>Description</div>
          <div>Credentials</div>
          <div>Updated</div>
          <div />
        </div>

        {/* Rows */}
        <div>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <FolderOpen size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                No categories found
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                Try changing your search to find the category you are looking
                for.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredCategories.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[var(--muted)]">
              Showing{" "}
              <span className="font-medium text-white">
                1–{filteredCategories.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white">
                {filteredCategories.length}
              </span>{" "}
              categories
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
   Category Row
----------------------------------------- */

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] lg:grid-cols-[2fr_2.6fr_130px_130px_44px] lg:items-center">
      {/* Category */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CategoryIcon icon={category.icon} color={category.color} />

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">
              {category.name}
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)] lg:hidden">
              {category.credentials} credentials
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="min-w-0">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {category.description}
        </p>
      </div>

      {/* Credentials */}
      <div>
        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-white">
          {category.credentials}{" "}
          {category.credentials === 1 ? "credential" : "credentials"}
        </span>
      </div>

      {/* Updated */}
      <div>
        <span className="text-[10px] text-[var(--muted)]">
          {category.updated}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          title={`Actions for ${category.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] opacity-100 transition hover:bg-[var(--card)] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Mobile description */}
      <div className="lg:hidden">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {category.description}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Category Icon
----------------------------------------- */

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    shopping: <ShoppingBag size={16} />,
    code: <Code2 size={16} />,
    server: <Server size={16} />,
    database: <Database size={16} />,
    globe: <Globe size={16} />,
    analytics: <BarChart3 size={16} />,
    folder: <FolderOpen size={16} />,
    mail: <Mail size={16} />,
    social: <Share2 size={16} />,
    storage: <HardDrive size={16} />,
    security: <Shield size={16} />,
    settings: <Settings2 size={16} />,
  };

  const colorClasses: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    orange: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    pink: "border-pink-500/20 bg-pink-500/10 text-pink-400",
    red: "border-red-500/20 bg-red-500/10 text-red-400",
    indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
    teal: "border-teal-500/20 bg-teal-500/10 text-teal-400",
    green: "border-green-500/20 bg-green-500/10 text-green-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
        colorClasses[color] ?? colorClasses.emerald
      }`}
    >
      {icons[icon] ?? <FolderOpen size={16} />}
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
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--muted)]">{label}</span>

        <div className="text-[var(--muted)]">{icon}</div>
      </div>

      <p className="mt-2 text-[24px] font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
