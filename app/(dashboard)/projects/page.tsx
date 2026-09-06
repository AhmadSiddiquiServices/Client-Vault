"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import type {
  ProjectListItem,
  ProjectStatus,
  ProjectType,
  ProjectsResponse,
  ProjectClientsResponse,
} from "@/types/project";

const projectTypes: {
  value: ProjectType;
  label: string;
}[] = [
  { value: "website", label: "Website" },
  { value: "shopify-store", label: "Shopify Store" },
  { value: "mobile-app", label: "Mobile App" },
  { value: "api", label: "API" },
  { value: "saas", label: "SaaS" },
  { value: "internal-system", label: "Internal System" },
  { value: "server", label: "Server" },
  { value: "other", label: "Other" },
];

export default function ProjectsPage() {
  const searchParams = useSearchParams();

  const initialClientId = searchParams.get("client") || "all";

  const [projects, setProjects] = useState<ProjectListItem[]>([]);

  const [clients, setClients] = useState<ProjectClientsResponse["clients"]>([]);

  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState(initialClientId);
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [type, setType] = useState<"all" | ProjectType>("all");

  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState("");

  const [deleteProject, setDeleteProject] = useState<ProjectListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  /*
   * Keep the client filter synchronized with:
   * /projects?client=CLIENT_ID
   */
  useEffect(() => {
    setClientId(initialClientId);
  }, [initialClientId]);

  /*
   * Load clients for the filter dropdown.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchClients() {
      try {
        setLoadingClients(true);

        const response = await fetch("/api/clients", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result: ProjectClientsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Failed to load clients.");
        }

        if (!cancelled) {
          setClients(result.clients);
        }
      } catch (error) {
        console.error("Project clients fetch error:", error);
      } finally {
        if (!cancelled) {
          setLoadingClients(false);
        }
      }
    }

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load projects whenever filters change.
   */
  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (clientId !== "all") {
          params.set("client", clientId);
        }

        if (status !== "all") {
          params.set("status", status);
        }

        if (type !== "all") {
          params.set("type", type);
        }

        const query = params.toString();

        const response = await fetch(
          query ? `/api/projects?${query}` : "/api/projects",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const result: ProjectsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load projects.");
        }

        if (!cancelled) {
          setProjects(result.projects);
        }
      } catch (error) {
        console.error("Projects fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load projects.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, clientId, status, type]);

  async function handleDeleteProject() {
    if (!deleteProject || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/projects/${deleteProject._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete project.");
      }

      toast.success("Project deleted successfully.");

      setDeleteProject(null);

      /*
       * Refresh real data.
       */
      await refreshProjects();
    } catch (error) {
      console.error("Delete project error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete project.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function refreshProjects() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (clientId !== "all") {
        params.set("client", clientId);
      }

      if (status !== "all") {
        params.set("status", status);
      }

      if (type !== "all") {
        params.set("type", type);
      }

      const query = params.toString();

      const response = await fetch(
        query ? `/api/projects?${query}` : "/api/projects",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result: ProjectsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load projects.");
      }

      setProjects(result.projects);
    } catch (error) {
      console.error("Projects refresh error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
            Projects
          </h1>

          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Manage projects and websites across all your clients.
          </p>
        </div>

        <Link
          href={
            clientId !== "all"
              ? `/projects/new?client=${clientId}`
              : "/projects/new"
          }
          className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-[14px] text-[#041109] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add Project
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
            placeholder="Search projects..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-[#59656d]"
          />
        </div>

        {/* Client */}
        <div className="relative">
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            disabled={loadingClients}
            className="h-10 min-w-[170px] max-w-[220px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="all">
              {loadingClients ? "Loading Clients..." : "All Clients"}
            </option>

            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Type */}
        <div className="relative">
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "all" | ProjectType)
            }
            className="h-10 min-w-[145px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Types</option>

            {projectTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | ProjectStatus)
            }
            className="h-10 min-w-[130px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Filter indicator */}
        <button
          type="button"
          aria-label="Project filters"
          title="Project filters"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[#78858d] transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          <Filter size={15} />
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
          <p className="text-[11px] text-red-400">{error}</p>

          <button
            type="button"
            onClick={refreshProjects}
            className="shrink-0 text-[11px] font-medium text-white hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Projects Table */}
      {loading ? (
        <ProjectsTableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Project
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Website / URL
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                    Credentials
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                    Last Updated
                  </th>

                  <th className="w-20 px-3 py-4 text-right text-[11px] font-medium text-[#65727a]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="group border-b border-white/[0.035] transition-colors last:border-0 hover:bg-white/[0.018]"
                  >
                    {/* Project */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/projects/${project._id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                          <FolderKanban
                            size={16}
                            strokeWidth={1.7}
                            className="text-emerald-400"
                          />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-medium text-[#dce1e4] transition-colors hover:text-white">
                            {project.name}
                          </span>

                          {project.description && (
                            <span className="mt-0.5 block max-w-[250px] truncate text-[10px] text-[#59656d]">
                              {project.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-4">
                      {project.client ? (
                        <Link
                          href={`/clients/${project.client._id}`}
                          className="text-[12px] text-[#aab4b9] transition-colors hover:text-[var(--primary)]"
                        >
                          {project.client.name}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-[#59656d]">—</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-white/[0.045] px-2.5 py-1.5 text-[10px] font-medium text-[#9ca7ad]">
                        {formatProjectType(project.type)}
                      </span>
                    </td>

                    {/* URL */}
                    <td className="px-5 py-4">
                      {project.url ? (
                        <a
                          href={normalizeUrl(project.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-[220px] items-center gap-1.5 truncate text-[12px] text-[#78858d] transition-colors hover:text-[var(--primary)]"
                        >
                          <span className="truncate">
                            {stripProtocol(project.url)}
                          </span>

                          <ExternalLink size={11} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[12px] text-[#59656d]">—</span>
                      )}
                    </td>

                    {/* Credentials */}
                    <td className="px-5 py-4 text-center">
                      <span className="text-[12px] font-medium text-[#aab4b9]">
                        —
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-md px-2.5 py-1.5 text-[10px] font-medium",
                          getStatusClass(project.status),
                        ].join(" ")}
                      >
                        {capitalizeStatus(project.status)}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="px-5 py-4 text-[12px] text-[#78858d]">
                      {formatRelativeTime(project.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/projects/${project._id}/edit`}
                          aria-label={`Edit ${project.name}`}
                          title={`Edit ${project.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          <Pencil size={14} strokeWidth={1.8} />
                        </Link>

                        <button
                          type="button"
                          aria-label={`Delete ${project.name}`}
                          title={`Delete ${project.name}`}
                          onClick={() => setDeleteProject(project)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] transition-colors hover:bg-red-500/[0.06] hover:text-red-400"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty */}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      {search ||
                      clientId !== "all" ||
                      status !== "all" ||
                      type !== "all" ? (
                        <>
                          <p className="text-[12px] font-medium text-[#8b969d]">
                            No projects found
                          </p>

                          <p className="mt-1 text-[10px] text-[#59656d]">
                            Try changing your search or filters.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[12px] font-medium text-[#8b969d]">
                            No projects yet
                          </p>

                          <p className="mt-1 text-[10px] text-[#59656d]">
                            Add your first project to get started.
                          </p>

                          <Link
                            href="/projects/new"
                            className="mt-3 inline-flex text-[11px] font-medium text-[var(--primary)] hover:text-white"
                          >
                            Add project
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
            <span className="text-[11px] text-[#65727a]">
              Showing {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#4f5a61] disabled:opacity-50"
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#4f5a61] disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete dialog"
            onClick={() => {
              if (!isDeleting) {
                setDeleteProject(null);
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-[#11181e] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Trash2 size={18} className="text-red-400" />
                </div>

                <h2 className="text-[16px] font-semibold text-white">
                  Delete Project?
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-medium text-white">
                    {deleteProject.name}
                  </span>
                  ?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-red-500/15 bg-red-500/[0.04] px-3.5 py-3">
              <p className="text-[10px] leading-5 text-red-300/80">
                This will remove the project and its related project data. This
                action cannot be undone.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteProject(null)}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-[11px] font-medium text-[var(--muted)] transition-colors hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-red-500 px-4 text-[11px] font-semibold text-white transition-colors hover:bg-red-500/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatProjectType(type: ProjectType) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function capitalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400";

    case "completed":
      return "bg-blue-500/10 text-blue-400";

    case "archived":
      return "bg-orange-500/10 text-orange-400";

    default:
      return "bg-white/[0.06] text-[#7d8991]";
  }
}

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
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

function ProjectsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {[
                "Project",
                "Client",
                "Type",
                "Website / URL",
                "Credentials",
                "Status",
                "Last Updated",
                "Actions",
              ].map((label) => (
                <th
                  key={label}
                  className={[
                    "px-5 py-4 text-left text-[11px] font-medium text-[#65727a]",
                    label === "Credentials" ? "text-center" : "",
                    label === "Actions" ? "text-right" : "",
                  ].join(" ")}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <tr
                key={index}
                className="animate-pulse border-b border-white/[0.035]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />

                    <div>
                      <div className="h-3 w-40 rounded bg-white/[0.06]" />
                      <div className="mt-1.5 h-2 w-24 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="h-3 w-28 rounded bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-6 w-24 rounded-md bg-white/[0.05]" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-3 w-32 rounded bg-white/[0.05]" />
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
                  <div className="ml-auto h-8 w-16 rounded bg-white/[0.04]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
        <div className="h-3 w-28 rounded bg-white/[0.05]" />

        <div className="flex gap-1.5">
          <div className="h-8 w-8 rounded-md bg-white/[0.04]" />
          <div className="h-8 w-8 rounded-md bg-white/[0.05]" />
          <div className="h-8 w-8 rounded-md bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
