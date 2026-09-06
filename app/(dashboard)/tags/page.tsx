"use client";

import {
  ChevronLeft,
  ChevronRight,
  Hash,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { TagListItem, TagsResponse } from "@/types/tag";

export default function TagsPage() {
  const [tags, setTags] = useState<TagListItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTag, setDeleteTag] = useState<TagListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchTags() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const query = params.toString();

      const response = await fetch(query ? `/api/tags?${query}` : "/api/tags", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: TagsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load tags.");
      }

      setTags(result.tags);
    } catch (error) {
      console.error("Tags fetch error:", error);

      setError(error instanceof Error ? error.message : "Failed to load tags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const totalUsage = useMemo(
    () => tags.reduce((total, tag) => total + tag.usage, 0),
    [tags],
  );

  const mostUsedTag = useMemo(() => {
    if (tags.length === 0) return null;

    return tags.reduce((current, tag) =>
      tag.usage > current.usage ? tag : current,
    );
  }, [tags]);

  async function handleDeleteTag() {
    if (!deleteTag || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/tags/${deleteTag._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete tag.");
      }

      toast.success("Tag deleted successfully.");

      setDeleteTag(null);

      await fetchTags();
    } catch (error) {
      console.error("Delete tag error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete tag.",
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
              <Hash size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Tags
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Organize credentials with flexible tags.
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
          value={mostUsedTag ? `#${mostUsedTag.name}` : "—"}
          icon={<Hash size={16} />}
          textValue
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tags..."
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
            onClick={fetchTags}
            className="shrink-0 text-[11px] font-medium text-white transition-colors hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Tags */}
      {loading ? (
        <TagsSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_180px_180px_86px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] lg:grid">
            <div>Tag</div>
            <div>Usage</div>
            <div>Updated</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          {tags.length > 0 ? (
            <div>
              {tags.map((tag) => (
                <TagRow
                  key={tag._id}
                  tag={tag}
                  onDelete={() => setDeleteTag(tag)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <Hash size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                {search ? "No tags found" : "No tags yet"}
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                {search
                  ? "Try changing your search to find the tag you are looking for."
                  : "Create your first tag to start organizing credentials."}
              </p>

              {!search && (
                <Link
                  href="/tags/new"
                  className="mt-3 text-[11px] font-medium text-[var(--primary)] hover:text-white"
                >
                  Add tag
                </Link>
              )}
            </div>
          )}

          {/* Footer */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[var(--muted)]">
                Showing{" "}
                <span className="font-medium text-white">{tags.length}</span>{" "}
                {tags.length === 1 ? "tag" : "tags"}
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

      {/* Delete dialog */}
      {deleteTag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete dialog"
            onClick={() => {
              if (!isDeleting) {
                setDeleteTag(null);
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
                Delete Tag?
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-white">
                  #{deleteTag.name}
                </span>
                ?
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-red-500/15 bg-red-500/[0.04] px-3.5 py-3">
              <p className="text-[10px] leading-5 text-red-300/80">
                This will remove the tag from any credentials using it.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTag(null)}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-[11px] font-medium text-[var(--muted)] transition-colors hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTag}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-red-500 px-4 text-[11px] font-semibold text-white transition-colors hover:bg-red-500/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Tag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------
   Tag Row
----------------------------------------- */

function TagRow({ tag, onDelete }: { tag: TagListItem; onDelete: () => void }) {
  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] lg:grid-cols-[2fr_180px_180px_86px] lg:items-center">
      {/* Tag */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/10">
            <Hash size={15} className="text-[var(--primary)]" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-mono text-[12px] font-medium text-white">
              #{tag.name}
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)] lg:hidden">
              {tag.usage} {tag.usage === 1 ? "credential" : "credentials"}
            </p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-white">
          {tag.usage} {tag.usage === 1 ? "credential" : "credentials"}
        </span>
      </div>

      {/* Updated */}
      <div>
        <span className="text-[10px] text-[var(--muted)]">
          {formatRelativeTime(tag.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/tags/${tag._id}/edit`}
          aria-label={`Edit ${tag.name}`}
          title={`Edit ${tag.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white"
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Link>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${tag.name}`}
          title={`Delete ${tag.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile usage */}
      <div className="lg:hidden">
        <span className="text-[11px] text-[var(--muted)]">
          Used by {tag.usage} {tag.usage === 1 ? "credential" : "credentials"}
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

function TagsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="animate-pulse">
        <div className="hidden h-12 border-b border-[var(--border)] bg-white/[0.015] lg:block" />

        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border-b border-[var(--border)] px-5 py-4 lg:grid-cols-[2fr_180px_180px_86px]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/[0.05]" />
              <div className="h-3 w-28 rounded bg-white/[0.06]" />
            </div>

            <div className="h-6 w-24 rounded-md bg-white/[0.05]" />

            <div className="h-3 w-20 rounded bg-white/[0.04]" />

            <div className="ml-auto h-8 w-16 rounded-md bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
