"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FolderOpen,
  Globe,
  HardDrive,
  Mail,
  Pencil,
  Plus,
  Search,
  Server,
  Settings2,
  Share2,
  Shield,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { CategoriesResponse, CategoryListItem } from "@/types/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteCategory, setDeleteCategory] = useState<CategoryListItem | null>(
    null,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const query = params.toString();

      const response = await fetch(
        query ? `/api/categories?${query}` : "/api/categories",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result: CategoriesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load categories.");
      }

      setCategories(result.categories);
    } catch (error) {
      console.error("Categories fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Debounced category search.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /*
   * Derived summary values.
   */
  const totalCredentials = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + category.credentialsCount,
        0,
      ),
    [categories],
  );

  /*
   * Categories do not currently have a separate
   * active/inactive status field.
   *
   * Therefore every existing category is considered
   * active for this summary.
   */
  const activeCategories = categories.length;

  async function handleDeleteCategory() {
    if (!deleteCategory || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/categories/${deleteCategory._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete category.");
      }

      toast.success("Category deleted successfully.");

      setDeleteCategory(null);

      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete category.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
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
          value={activeCategories}
          icon={<FolderOpen size={16} />}
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

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
          <p className="text-[11px] text-red-400">{error}</p>

          <button
            type="button"
            onClick={fetchCategories}
            className="shrink-0 text-[11px] font-medium text-white transition-colors hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Categories */}
      {loading ? (
        <CategoriesSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {/* Desktop header */}
          <div className="hidden grid-cols-[2fr_2.6fr_160px_130px_86px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] lg:grid">
            <div>Category</div>
            <div>Description</div>
            <div>Credentials</div>
            <div>Updated</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          {categories.length > 0 ? (
            <div>
              {categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  category={category}
                  onDelete={() => setDeleteCategory(category)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <FolderOpen size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                {search ? "No categories found" : "No categories yet"}
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                {search
                  ? "Try changing your search to find the category you are looking for."
                  : "Create your first category to start organizing credentials."}
              </p>

              {!search && (
                <Link
                  href="/categories/new"
                  className="mt-3 text-[11px] font-medium text-[var(--primary)] hover:text-white"
                >
                  Add category
                </Link>
              )}
            </div>
          )}

          {/* Footer */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[var(--muted)]">
                Showing{" "}
                <span className="font-medium text-white">
                  {categories.length}
                </span>{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled
                  aria-label="Previous page"
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
                  disabled
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete dialog"
            onClick={() => {
              if (!isDeleting) {
                setDeleteCategory(null);
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-[#11181e] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Trash2 size={18} className="text-red-400" />
              </div>

              <h2 className="text-[16px] font-semibold text-white">
                Delete Category?
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-white">
                  {deleteCategory.name}
                </span>
                ?
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-red-500/15 bg-red-500/[0.04] px-3.5 py-3">
              <p className="text-[10px] leading-5 text-red-300/80">
                Categories currently used by credentials cannot be deleted.
                Remove the category from those credentials first.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-[11px] font-medium text-[var(--muted)] transition-colors hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-red-500 px-4 text-[11px] font-semibold text-white transition-colors hover:bg-red-500/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------
   Category Row
----------------------------------------- */
function CategoryRow({
  category,
  onDelete,
}: {
  category: CategoryListItem;
  onDelete: () => void;
}) {
  const presentation = getCategoryPresentation(category.name);

  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] lg:grid-cols-[2fr_2.6fr_160px_130px_86px] lg:items-center">
      {/* Category */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CategoryIcon icon={presentation.icon} color={category.color} />

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">
              {category.name}
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)] lg:hidden">
              {category.credentialsCount}{" "}
              {category.credentialsCount === 1 ? "credential" : "credentials"}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="min-w-0">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {category.description || "No description provided."}
        </p>
      </div>

      {/* Credentials */}
      <div>
        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-white">
          {category.credentialsCount}{" "}
          {category.credentialsCount === 1 ? "credential" : "credentials"}
        </span>
      </div>

      {/* Updated */}
      <div>
        <span className="text-[10px] text-[var(--muted)]">
          {formatRelativeTime(category.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/categories/${category._id}/edit`}
          aria-label={`Edit ${category.name}`}
          title={`Edit ${category.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white"
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Link>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${category.name}`}
          title={`Delete ${category.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile description */}
      <div className="lg:hidden">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {category.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Category Presentation
----------------------------------------- */
function getCategoryPresentation(name: string) {
  const value = name.toLowerCase();

  if (value.includes("e-commerce") || value.includes("commerce")) {
    return {
      icon: "shopping",
    };
  }

  if (
    value.includes("development") ||
    value.includes("dev") ||
    value.includes("code")
  ) {
    return {
      icon: "code",
    };
  }

  if (value.includes("hosting")) {
    return {
      icon: "server",
    };
  }

  if (value.includes("database")) {
    return {
      icon: "database",
    };
  }

  if (value.includes("domain") || value.includes("dns")) {
    return {
      icon: "globe",
    };
  }

  if (value.includes("analytics")) {
    return {
      icon: "analytics",
    };
  }

  if (value.includes("cms")) {
    return {
      icon: "folder",
    };
  }

  if (value.includes("email")) {
    return {
      icon: "mail",
    };
  }

  if (value.includes("social") || value.includes("media social")) {
    return {
      icon: "social",
    };
  }

  if (value.includes("storage") || value.includes("media")) {
    return {
      icon: "storage",
    };
  }

  if (value.includes("security")) {
    return {
      icon: "security",
    };
  }

  if (value.includes("api")) {
    return {
      icon: "settings",
    };
  }

  return {
    icon: "folder",
  };
}

/* ----------------------------------------
   Category Icon
---------------------------------------- */
function CategoryIcon({ icon, color }: { icon: string; color?: string }) {
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

  const resolvedColor = color || "#00e676";

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
      style={{
        borderColor: `${resolvedColor}33`,
        backgroundColor: `${resolvedColor}14`,
        color: resolvedColor,
      }}
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

/* ----------------------------------------
   Helpers
----------------------------------------- */
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return "—";
  }

  if (diffMs < 0) {
    return "Just now";
  }

  const minutes = Math.floor(diffMs / 1000 / 60);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/* ----------------------------------------
   Skeleton
----------------------------------------- */
function CategoriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="animate-pulse">
        <div className="hidden h-12 border-b border-[var(--border)] bg-white/[0.015] lg:block" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border-b border-[var(--border)] px-5 py-4 lg:grid-cols-[2fr_2.6fr_160px_130px_86px]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/[0.05]" />

              <div className="h-3 w-28 rounded bg-white/[0.06]" />
            </div>

            <div className="h-3 w-full rounded bg-white/[0.04]" />

            <div className="h-6 w-24 rounded-md bg-white/[0.05]" />

            <div className="h-3 w-20 rounded bg-white/[0.04]" />

            <div className="ml-auto h-8 w-16 rounded-md bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
