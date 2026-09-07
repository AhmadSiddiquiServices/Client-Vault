"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type {
  CredentialListItem,
  CredentialsResponse,
} from "@/types/credential";

import type { CategoriesResponse, CategoryListItem } from "@/types/category";

import type { ClientsResponse, ClientListItem } from "@/types/client";

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<CredentialListItem[]>([]);

  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  const [clients, setClients] = useState<ClientListItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [client, setClient] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Fetch categories and clients used by the filters.
   */
  async function fetchFilterData() {
    try {
      setFilterLoading(true);

      const [categoriesResponse, clientsResponse] = await Promise.all([
        fetch("/api/categories", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),

        fetch("/api/clients", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const categoriesResult: CategoriesResponse =
        await categoriesResponse.json();

      const clientsResult: ClientsResponse = await clientsResponse.json();

      if (categoriesResponse.ok && categoriesResult.success) {
        setCategories(categoriesResult.categories);
      }

      if (clientsResponse.ok && clientsResult.success) {
        setClients(clientsResult.clients);
      }
    } catch (error) {
      console.error("Credential filter data error:", error);
    } finally {
      setFilterLoading(false);
    }
  }

  async function fetchCredentials() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      if (client) {
        params.set("client", client);
      }

      if (favoritesOnly) {
        params.set("favorite", "true");
      }

      const query = params.toString();

      const response = await fetch(
        query ? `/api/credentials?${query}` : "/api/credentials",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      /*
       * Read the response as text first.
       * This prevents `response.json()` from throwing
       * when the API accidentally returns an empty body.
       */
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error(
          `Credentials API returned an empty response (HTTP ${response.status}).`,
        );
      }

      let result: CredentialsResponse;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "Invalid credentials API response:",
          responseText,
          parseError,
        );

        throw new Error(
          `Credentials API returned invalid JSON (HTTP ${response.status}).`,
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to load credentials (HTTP ${response.status}).`,
        );
      }

      setCredentials(result.credentials);
    } catch (error) {
      console.error("Credentials fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Load filter data once.
   */
  useEffect(() => {
    fetchFilterData();
  }, []);

  /*
   * Debounce server-side credential filtering.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCredentials();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, category, client, favoritesOnly]);

  /*
   * Delete is intentionally kept ready here.
   * The confirmation UI can be expanded when the
   * DELETE endpoint is finalized.
   */
  async function handleDeleteCredential(credential: CredentialListItem) {
    const confirmed = window.confirm(
      `Delete "${credential.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/${credential._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete credential.");
      }

      toast.success("Credential deleted successfully.");

      await fetchCredentials();
    } catch (error) {
      console.error("Delete credential error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete credential.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <KeyRound size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Credentials
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Securely manage credentials across all clients and projects.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/credentials/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[14px] text-black transition hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} />
          Add Credential
        </Link>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          <ShieldCheck size={16} className="text-[var(--primary)]" />
        </div>

        <div className="min-w-0">
          <p className="text-[12px] font-medium text-white">
            Your credentials are protected
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            Sensitive values are hidden by default and should only be revealed
            when needed.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search credentials, clients, projects, tags..."
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
            />
          </div>

          {/* Category */}
          <FilterSelect
            value={category}
            options={[
              {
                value: "",
                label: "All Categories",
              },
              ...categories.map((item) => ({
                value: item._id,
                label: item.name,
              })),
            ]}
            onChange={setCategory}
            disabled={filterLoading}
          />

          {/* Client */}
          <FilterSelect
            value={client}
            options={[
              {
                value: "",
                label: "All Clients",
              },
              ...clients.map((item) => ({
                value: item._id,
                label: item.name,
              })),
            ]}
            onChange={setClient}
            disabled={filterLoading}
          />

          {/* Favorites */}
          <button
            type="button"
            onClick={() => setFavoritesOnly((current) => !current)}
            className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-medium transition ${
              favoritesOnly
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-white"
            }`}
          >
            <Star size={14} fill={favoritesOnly ? "currentColor" : "none"} />
            Favorites
          </button>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
          <p className="text-[11px] text-red-400">{error}</p>

          <button
            type="button"
            onClick={fetchCredentials}
            className="shrink-0 text-[11px] font-medium text-white transition hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <CredentialsSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {/* Header */}
          <div className="hidden grid-cols-[2fr_1.15fr_1.5fr_1.4fr_1.2fr_100px_86px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] lg:grid">
            <div>Credential</div>
            <div>Category</div>
            <div>Client</div>
            <div>Project</div>
            <div>Username</div>
            <div>Updated</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          {credentials.length > 0 ? (
            <div>
              {credentials.map((credential) => (
                <CredentialRow
                  key={credential._id}
                  credential={credential}
                  onDelete={() => handleDeleteCredential(credential)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <KeyRound size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                No credentials found
              </h3>

              <p className="mt-1 max-w-sm text-[11px] leading-5 text-[var(--muted)]">
                Try changing your search or filters to find the credential you
                are looking for.
              </p>

              {!search && !category && !client && !favoritesOnly && (
                <Link
                  href="/credentials/new"
                  className="mt-3 text-[11px] font-medium text-[var(--primary)] transition hover:text-white"
                >
                  Add credential
                </Link>
              )}
            </div>
          )}

          {/* Footer */}
          {credentials.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[var(--muted)]">
                Showing{" "}
                <span className="font-medium text-white">
                  {credentials.length}
                </span>{" "}
                {credentials.length === 1 ? "credential" : "credentials"}
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
    </div>
  );
}

/* ----------------------------------------
   Credential Row
----------------------------------------- */

function CredentialRow({
  credential,
  onDelete,
}: {
  credential: CredentialListItem;
  onDelete: () => void;
}) {
  const primaryProject = credential.projects[0] ?? null;

  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] lg:grid-cols-[2fr_1.15fr_1.5fr_1.4fr_1.2fr_100px_86px] lg:items-center">
      {/* Credential */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <KeyRound size={15} className="text-[var(--primary)]" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/credentials/${credential._id}`}
              className="block truncate text-[12px] font-semibold text-white transition hover:text-[var(--primary)]"
            >
              {credential.name}
            </Link>

            <div className="mt-1 flex items-center gap-2">
              {credential.isFavorite && (
                <Star
                  size={11}
                  fill="currentColor"
                  className="text-[var(--primary)]"
                />
              )}

              {credential.isShared && (
                <span className="text-[10px] text-[var(--muted)]">Shared</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <span className="inline-flex max-w-full truncate rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[10px] font-medium text-[var(--muted)]">
          {credential.category?.name || "—"}
        </span>
      </div>

      {/* Client */}
      <div className="min-w-0">
        {credential.client ? (
          <Link
            href={`/clients/${credential.client._id}`}
            className="block truncate text-[12px] font-medium text-white transition hover:text-[var(--primary)]"
          >
            {credential.client.name}
          </Link>
        ) : (
          <span className="text-[11px] text-[var(--muted)]">—</span>
        )}
      </div>

      {/* Project */}
      <div className="min-w-0">
        {primaryProject ? (
          <Link
            href={`/projects/${primaryProject._id}`}
            className="block truncate text-[11px] text-[var(--muted)] transition hover:text-white"
          >
            {primaryProject.name}

            {credential.projects.length > 1 && (
              <span className="ml-1 text-[10px] text-[var(--muted)]">
                +{credential.projects.length - 1}
              </span>
            )}
          </Link>
        ) : (
          <span className="text-[11px] text-[var(--muted)]">
            Shared / No project
          </span>
        )}
      </div>

      {/* Username */}
      <div className="min-w-0">
        <p className="truncate text-[11px] text-white">
          {credential.username || "—"}
        </p>

        <p className="mt-1 font-mono text-[10px] tracking-wider text-[var(--muted)]">
          ••••••••••••
        </p>
      </div>

      {/* Updated */}
      <div>
        <span className="text-[10px] text-[var(--muted)]">
          {formatRelativeTime(credential.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/credentials/${credential._id}/edit`}
          aria-label={`Edit ${credential.name}`}
          title={`Edit ${credential.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white"
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Link>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${credential.name}`}
          title={`Delete ${credential.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-500/[0.06] hover:text-red-400"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile Tags */}
      {credential.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 lg:hidden">
          {credential.tags.map((tag) => (
            <span
              key={tag._id}
              className="rounded-md bg-[var(--background)] px-2 py-1 font-mono text-[10px] text-[var(--muted)]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------
   Filter Select
----------------------------------------- */

function FilterSelect({
  value,
  options,
  onChange,
  disabled = false,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-9 min-w-[170px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
  );
}

/* ----------------------------------------
   Relative Time
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

function CredentialsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="animate-pulse">
        <div className="hidden h-12 border-b border-[var(--border)] bg-white/[0.015] lg:block" />

        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border-b border-[var(--border)] px-5 py-4 lg:grid-cols-[2fr_1.15fr_1.5fr_1.4fr_1.2fr_100px_86px]"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/[0.05]" />

              <div className="h-3 w-28 rounded bg-white/[0.06]" />
            </div>

            <div className="h-6 w-20 rounded-md bg-white/[0.05]" />

            <div className="h-3 w-24 rounded bg-white/[0.04]" />

            <div className="h-3 w-28 rounded bg-white/[0.04]" />

            <div className="h-3 w-24 rounded bg-white/[0.04]" />

            <div className="h-3 w-16 rounded bg-white/[0.04]" />

            <div className="ml-auto h-8 w-16 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
