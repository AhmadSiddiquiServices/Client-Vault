"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type {
  ClientListItem,
  ClientStatus,
  ClientsResponse,
} from "@/types/client";

const avatarClasses = [
  "bg-emerald-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-violet-500",
];

type StatusFilter = "All Status" | "Active" | "Inactive" | "Archived";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All Status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteClient, setDeleteClient] = useState<ClientListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchClients() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "All Status") {
        params.set("status", status.toLowerCase());
      }

      const queryString = params.toString();

      const response = await fetch(
        queryString ? `/api/clients?${queryString}` : "/api/clients",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result: ClientsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to load clients.");
      }

      setClients(result.clients);
    } catch (error) {
      console.error("Clients fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load clients.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient() {
    if (!deleteClient || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/clients/${deleteClient._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete client.");
      }

      toast.success("Client deleted successfully.");

      setDeleteClient(null);
      setOpenMenuId(null);

      // Refresh the real list from the API
      await fetchClients();
    } catch (error) {
      console.error("Delete client error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the client.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /**
   * Fetch when filters change.
   *
   * For the current MVP we use a short debounce for search
   * so the API isn't called on every keystroke.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status]);

  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuId(null);
    }

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const filteredClients = useMemo(() => {
    return clients;
  }, [clients]);

  const showingCount = filteredClients.length;

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
            Clients
          </h1>

          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Manage all your clients in one place.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-[14px] text-[#041109] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add Client
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex h-10 w-full max-w-[340px] items-center gap-2.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
          <Search size={15} className="shrink-0 text-[#65727a]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-[#59656d]"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="h-10 min-w-[130px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Archived</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Filter */}
        <button
          type="button"
          aria-label="Filter clients"
          title="Filter clients"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[#78858d] transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          <Filter size={15} />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <ClientsTableSkeleton />
      ) : error ? (
        /* Error */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-16 text-center">
          <p className="text-[13px] font-medium text-red-400">{error}</p>

          <button
            type="button"
            onClick={fetchClients}
            className="mt-4 text-[11px] font-medium text-white transition-colors hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                    Projects
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                    Credentials
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Last Activity
                  </th>

                  <th className="w-12 px-3 py-4" />
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client, index) => {
                  const initials = getInitials(client.name);
                  const statusLabel = capitalizeStatus(client.status);

                  return (
                    <tr
                      key={client._id}
                      className="group border-b border-white/[0.035] transition-colors last:border-0 hover:bg-white/[0.018]"
                    >
                      {/* Client */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/clients/${client._id}`}
                          className="flex items-center gap-3"
                        >
                          <span
                            className={[
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                              avatarClasses[index % avatarClasses.length],
                              "text-[12px] font-semibold text-white",
                            ].join(" ")}
                          >
                            {initials}
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-medium text-[#dce1e4] transition-colors hover:text-white">
                              {client.name}
                            </span>

                            {client.company && (
                              <span className="mt-0.5 block truncate text-[10px] text-[#59656d]">
                                {client.company}
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-[#78858d]">
                          {client.email || "—"}
                        </span>
                      </td>

                      {/* Projects */}
                      <td className="px-5 py-4 text-center text-[12px] text-[#aab4b9]">
                        {client.projectsCount}
                      </td>

                      {/* Credentials */}
                      <td className="px-5 py-4 text-center text-[12px] text-[#aab4b9]">
                        {client.credentialsCount}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-md px-2.5 py-1.5 text-[10px] font-medium",
                            getStatusClass(client.status),
                          ].join(" ")}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="px-5 py-4 text-[12px] text-[#78858d]">
                        {formatRelativeTime(client.lastActivityAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <Link
                            href={`/clients/${client._id}/edit`}
                            aria-label={`Edit ${client.name}`}
                            title={`Edit ${client.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] transition-colors hover:bg-white/[0.05] hover:text-white"
                          >
                            <Pencil size={14} strokeWidth={1.8} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            aria-label={`Delete ${client.name}`}
                            title={`Delete ${client.name}`}
                            onClick={() => setDeleteClient(client)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] transition-colors hover:bg-red-500/[0.06] hover:text-red-400"
                          >
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty */}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      {search || status !== "All Status" ? (
                        <>
                          <p className="text-[12px] font-medium text-[#8b969d]">
                            No clients found
                          </p>

                          <p className="mt-1 text-[10px] text-[#59656d]">
                            Try changing your search or status filter.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[12px] font-medium text-[#8b969d]">
                            No clients yet
                          </p>

                          <p className="mt-1 text-[10px] text-[#59656d]">
                            Add your first client to get started.
                          </p>

                          <Link
                            href="/clients/new"
                            className="mt-3 inline-flex text-[11px] font-medium text-[var(--primary)] transition-colors hover:text-white"
                          >
                            Add client
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
            <span className="text-[11px] text-[#65727a]">
              Showing {showingCount} {showingCount === 1 ? "client" : "clients"}
            </span>

            {/* Pagination placeholder */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#4f5a61] transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--primary)] bg-[var(--primary-soft)] text-[11px] font-medium text-[var(--primary)]"
              >
                1
              </button>

              <button
                type="button"
                disabled
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#4f5a61] transition-colors disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close delete dialog"
            onClick={() => {
              if (!isDeleting) {
                setDeleteClient(null);
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-[#11181e] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Trash2 size={18} className="text-red-400" />
                </div>

                <h2 className="text-[16px] font-semibold text-white">
                  Delete Client?
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-medium text-white">
                    {deleteClient.name}
                  </span>
                  ?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setDeleteClient(null);
                  }
                }}
                disabled={isDeleting}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-red-500/15 bg-red-500/[0.04] px-3.5 py-3">
              <p className="text-[10px] leading-5 text-red-300/80">
                This will also permanently delete the client's projects,
                credentials, and related activity. This action cannot be undone.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteClient(null)}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-[11px] font-medium text-[var(--muted)] transition-colors hover:bg-white/[0.03] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-red-500 px-4 text-[11px] font-semibold text-white transition-colors hover:bg-red-500/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

function capitalizeStatus(status: ClientStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status: ClientStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400";

    case "inactive":
      return "bg-white/[0.06] text-[#7d8991]";

    case "archived":
      return "bg-orange-500/10 text-orange-400";

    default:
      return "bg-white/[0.06] text-[#7d8991]";
  }
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

function ClientsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {[
                "Client",
                "Contact",
                "Projects",
                "Credentials",
                "Status",
                "Last Activity",
                "",
              ].map((label, index) => (
                <th
                  key={`${label}-${index}`}
                  className={[
                    "px-5 py-4 text-left text-[11px] font-medium text-[#65727a]",
                    index === 2 || index === 3 ? "text-center" : "",
                  ].join(" ")}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="animate-pulse border-b border-white/[0.035]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/[0.06]" />

                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-white/[0.06]" />
                      <div className="h-2 w-20 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="h-3 w-36 rounded bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="mx-auto h-3 w-5 rounded bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="mx-auto h-3 w-5 rounded bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-6 w-16 rounded-md bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-3 w-20 rounded bg-white/[0.05]" />
                </td>

                <td className="px-3 py-4">
                  <div className="h-8 w-8 rounded-md bg-white/[0.04]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.05]" />

        <div className="flex gap-1.5">
          <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.04]" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.05]" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
