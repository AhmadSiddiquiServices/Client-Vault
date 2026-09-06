"use client";

import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
  Clock3,
  Edit3,
  ExternalLink,
  FolderKanban,
  Globe,
  KeyRound,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProjectStatus, ProjectType } from "@/types/project";

interface ProjectDetail {
  _id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  client: {
    _id: string;
    name: string;
    company?: string;
  } | null;
  url?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCredential {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  } | null;
  projects: {
    _id: string;
    name: string;
    type: string;
  }[];
  tags: {
    _id: string;
    name: string;
  }[];
  isFavorite: boolean;
  isShared: boolean;
  username?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectActivity {
  _id: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "viewed"
    | "copied"
    | "archived"
    | "restored";
  entity: "client" | "project" | "credential" | "category" | "tag";
  entityId: string;
  description?: string;
  createdAt: string;
}

interface ProjectDetailResponse {
  success: boolean;
  message?: string;
  project: ProjectDetail;
  stats: {
    credentials: number;
    categories: number;
  };
  credentials: ProjectCredential[];
  activity: ProjectActivity[];
}

function SectionHeader({
  title,
  action,
  href,
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>

      {action && href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[12px] text-[#78858d] transition-colors hover:text-white"
        >
          {action}
          <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={16}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[#75828a]"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[#65727a]">{label}</p>

        <div className="mt-1.5 text-[12px] leading-5 text-[#d7dde0]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId as string;

  const [data, setData] = useState<ProjectDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProject() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ProjectDetailResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load project.");
      }

      setData(result);
    } catch (error) {
      console.error("Project detail fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load project.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-16 text-center">
          <p className="text-[13px] font-medium text-red-400">
            {error || "Project could not be loaded."}
          </p>

          <button
            type="button"
            onClick={fetchProject}
            className="mt-4 text-[11px] font-medium text-white transition-colors hover:text-[var(--primary)]"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="mt-3 block w-full text-[11px] text-[var(--muted)] transition-colors hover:text-white"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const { project, stats, credentials, activity } = data;

  const client = project.client;

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-[#59656d]">
        <Link href="/projects" className="transition-colors hover:text-white">
          Projects
        </Link>

        <ChevronRight size={12} />

        {client && (
          <>
            <Link
              href={`/clients/${client._id}`}
              className="transition-colors hover:text-white"
            >
              {client.name}
            </Link>

            <ChevronRight size={12} />
          </>
        )}

        <span className="text-[#89949b]">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Globe size={22} strokeWidth={1.7} className="text-emerald-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                {project.name}
              </h1>

              <span
                className={[
                  "rounded-md px-2.5 py-1 text-[10px] font-medium",
                  getStatusClass(project.status),
                ].join(" ")}
              >
                {capitalizeStatus(project.status)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#65727a]">
              <span>{formatProjectType(project.type)}</span>

              {project.url && (
                <>
                  <span className="text-[#3e494f]">•</span>

                  <a
                    href={normalizeUrl(project.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[420px] items-center gap-1.5 truncate transition-colors hover:text-[var(--primary)]"
                  >
                    <span className="truncate">
                      {stripProtocol(project.url)}
                    </span>

                    <ExternalLink size={11} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project._id}/edit`}
            className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] text-[#aab4b9] transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            <Edit3 size={14} />
            Edit Project
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-7 border-b border-[var(--border)]">
        <span className="relative pb-3 text-[13px] font-medium text-[var(--primary)]">
          Overview
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
        </span>

        <Link
          href={`/credentials?project=${project._id}`}
          className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white"
        >
          Credentials
        </Link>

        <Link
          href={`/activity?entity=project&entityId=${project._id}`}
          className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white"
        >
          Activity
        </Link>

        <span className="pb-3 text-[13px] text-[#68747c]">Notes</span>
      </div>

      {/* Main */}
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left */}
        <div className="space-y-4">
          {/* Project Information */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Project Information" />

            <div className="space-y-6 p-5">
              <InfoRow icon={Users} label="Client">
                {client ? (
                  <Link
                    href={`/clients/${client._id}`}
                    className="transition-colors hover:text-[var(--primary)]"
                  >
                    {client.name}
                  </Link>
                ) : (
                  "—"
                )}
              </InfoRow>

              <InfoRow icon={FolderKanban} label="Project Type">
                {formatProjectType(project.type)}
              </InfoRow>

              <InfoRow icon={Globe} label="Website / URL">
                {project.url ? (
                  <a
                    href={normalizeUrl(project.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all transition-colors hover:text-[var(--primary)]"
                  >
                    {project.url}

                    <ExternalLink size={11} />
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>

              <InfoRow icon={Activity} label="Description">
                {project.description || "No description."}
              </InfoRow>

              <InfoRow icon={Activity} label="Notes">
                {project.notes || "No notes added."}
              </InfoRow>
            </div>
          </div>

          {/* Information */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Information" />

            <div className="space-y-5 p-5">
              <InfoRow icon={Clock3} label="Created">
                {formatDate(project.createdAt)}
              </InfoRow>

              <InfoRow icon={Activity} label="Last Updated">
                {formatDate(project.updatedAt)}
              </InfoRow>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="min-w-0 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Credentials"
              value={stats.credentials}
              icon={<KeyRound size={16} className="text-[var(--primary)]" />}
            />

            <StatCard
              label="Categories"
              value={stats.categories}
              icon={
                <FolderKanban size={16} className="text-[var(--primary)]" />
              }
            />

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#65727a]">Status</p>

                <CircleCheck size={16} className="text-emerald-400" />
              </div>

              <p
                className={[
                  "mt-2 text-[18px] font-semibold leading-none",
                  project.status === "active"
                    ? "text-emerald-400"
                    : project.status === "completed"
                      ? "text-blue-400"
                      : "text-[#aab4b9]",
                ].join(" ")}
              >
                {capitalizeStatus(project.status)}
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Project Credentials
                </h2>

                <p className="mt-1 text-[11px] text-[#65727a]">
                  Credentials associated with this project.
                </p>
              </div>

              <Link
                href={`/credentials/new?project=${project._id}&client=${client?._id ?? ""}`}
                className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3.5 text-[11px] font-semibold text-[#041109] transition-colors hover:bg-[var(--primary-hover)]"
              >
                <Plus size={14} />
                Add Credential
              </Link>
            </div>

            <div className="divide-y divide-white/[0.035]">
              {credentials.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-[12px] font-medium text-[#8b969d]">
                    No credentials yet
                  </p>

                  <p className="mt-1 text-[10px] text-[#59656d]">
                    Add a credential to associate it with this project.
                  </p>
                </div>
              ) : (
                credentials.slice(0, 5).map((credential) => (
                  <Link
                    key={credential._id}
                    href={`/credentials/${credential._id}`}
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.018]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                      <KeyRound size={16} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-[12px] font-medium text-[#dce1e4]">
                          {credential.name}
                        </p>

                        {credential.isShared && (
                          <span className="shrink-0 rounded-md bg-blue-500/10 px-2 py-1 text-[9px] font-medium text-blue-400">
                            Shared
                          </span>
                        )}

                        {credential.isFavorite && (
                          <span className="shrink-0 text-[var(--primary)]">
                            ★
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#65727a]">
                          {credential.category?.name || "Uncategorized"}
                        </span>

                        {credential.username && (
                          <>
                            <span className="text-[#39444a]">•</span>

                            <span className="max-w-[220px] truncate text-[11px] text-[#65727a]">
                              {credential.username}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="hidden text-[11px] text-[#65727a] md:block">
                      {formatRelativeTime(credential.updatedAt)}
                    </span>

                    <ArrowUpRight
                      size={14}
                      className="text-[#65727a] transition-colors group-hover:text-white"
                    />
                  </Link>
                ))
              )}
            </div>

            {credentials.length > 0 && (
              <div className="border-t border-[var(--border)] px-5 py-4">
                <Link
                  href={`/credentials?project=${project._id}`}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--primary)] transition-colors hover:text-emerald-300"
                >
                  View all credentials
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              title="Recent Activity"
              action="View all"
              href={`/activity?entity=project&entityId=${project._id}`}
            />

            <div className="px-5 py-2">
              {activity.length === 0 ? (
                <div className="px-3 py-7 text-center">
                  <p className="text-[11px] text-[#65727a]">
                    No activity has been recorded for this project yet.
                  </p>
                </div>
              ) : (
                activity.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 border-b border-white/[0.035] py-3.5 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                      <Activity size={14} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-[#cbd3d7]">
                        {item.description ||
                          getActivityLabel(item.action, item.entity)}
                      </p>

                      <p className="mt-1 text-[11px] text-[#65727a]">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-[#65727a]">{label}</p>

        {icon}
      </div>

      <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
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

function formatProjectType(type: ProjectType) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

  return formatDate(dateString);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getActivityLabel(action: string, entity: string) {
  return `${capitalizeStatus(entity)} ${action.toLowerCase()}`;
}

function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse">
      <div className="mb-4 h-3 w-40 rounded bg-white/[0.05]" />

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-white/[0.06]" />

          <div>
            <div className="h-7 w-64 rounded bg-white/[0.06]" />
            <div className="mt-2 h-3 w-72 rounded bg-white/[0.04]" />
          </div>
        </div>

        <div className="h-9 w-28 rounded-md bg-white/[0.05]" />
      </div>

      <div className="mb-5 h-10 border-b border-[var(--border)]" />

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="h-4 w-36 rounded bg-white/[0.06]" />

            <div className="mt-6 space-y-7">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-4 w-4 rounded bg-white/[0.05]" />

                  <div className="flex-1">
                    <div className="h-3 w-24 rounded bg-white/[0.04]" />
                    <div className="mt-2 h-3 w-44 rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="h-4 w-24 rounded bg-white/[0.06]" />

            <div className="mt-6 space-y-6">
              <div className="h-3 w-32 rounded bg-white/[0.04]" />
              <div className="h-3 w-36 rounded bg-white/[0.04]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-xl border border-[var(--border)] bg-[var(--card)]"
              />
            ))}
          </div>

          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="h-4 w-40 rounded bg-white/[0.06]" />

              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="h-12 rounded-lg bg-white/[0.04]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
