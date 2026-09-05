"use client";

import {
  Activity,
  ChevronRight,
  CircleUserRound,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { ClientStatus } from "@/types/client";
import toast from "react-hot-toast";

interface ClientDetail {
  _id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: ClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectItem {
  _id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface CredentialItem {
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
  url?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
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

interface ClientDetailResponse {
  success: boolean;
  message?: string;
  client: ClientDetail;
  stats: {
    projects: number;
    credentials: number;
    categories: number;
  };
  projects: ProjectItem[];
  credentials: CredentialItem[];
  activity: ActivityItem[];
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        size={16}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[#75828a]"
      />

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#65727a]">{label}</p>

        <div className="mt-1.5 text-[12px] leading-[1.5] text-[#d7dde0]">
          {children}
        </div>
      </div>
    </div>
  );
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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params.clientId as string;
  const [data, setData] = useState<ClientDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchClient() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/clients/${clientId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ClientDetailResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load client.");
      }

      setData(result);
    } catch (error) {
      console.error("Client detail fetch error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load client.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient() {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/clients/${client._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete client.");
      }

      toast.success("Client deleted successfully.");

      router.push("/clients");
      router.refresh();
    } catch (error) {
      console.error("Delete client error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete client.",
      );

      setIsDeleting(false);
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  if (loading) {
    return <ClientDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-16 text-center">
          <p className="text-[13px] font-medium text-red-400">
            {error || "Client could not be loaded."}
          </p>

          <button
            type="button"
            onClick={fetchClient}
            className="mt-4 text-[11px] font-medium text-white transition-colors hover:text-[var(--primary)]"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.push("/clients")}
            className="mt-3 block w-full text-[11px] text-[var(--muted)] transition-colors hover:text-white"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const { client, stats, projects, credentials, activity } = data;

  const initials = getInitials(client.name);

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-[11px] text-[#59656d]">
        <Link href="/clients" className="transition-colors hover:text-white">
          Clients
        </Link>

        <ChevronRight size={12} />

        <span className="text-[#89949b]">{client.name}</span>
      </div>

      {/* Client Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[14px] font-semibold text-white">
            {initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                {client.name}
              </h1>

              <span
                className={[
                  "rounded-md px-2.5 py-1 text-[10px] font-medium",
                  client.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : client.status === "inactive"
                      ? "bg-white/[0.06] text-[#7d8991]"
                      : "bg-orange-500/10 text-orange-400",
                ].join(" ")}
              >
                {capitalizeStatus(client.status)}
              </span>
            </div>

            <p className="mt-1 text-[12px] text-[#65727a]">
              {client.company || "Client overview and management"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client._id}/edit`}
            className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] font-medium text-[#aab4b9] transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            <Edit3 size={14} />
            Edit Client
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-red-500/20 bg-red-500/[0.04] px-3.5 text-[14px] font-medium text-red-400 transition-colors hover:bg-red-500/[0.08]"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-7 border-b border-[var(--border)]">
        <span className="relative pb-3 text-[13px] font-medium text-[var(--primary)]">
          Overview
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
        </span>

        <Link
          href={`/projects?client=${client._id}`}
          className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white"
        >
          Projects
        </Link>

        <Link
          href={`/credentials?client=${client._id}`}
          className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white"
        >
          Credentials
        </Link>

        <Link
          href={`/activity?entity=client&entityId=${client._id}`}
          className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white"
        >
          Activity
        </Link>

        <span className="pb-3 text-[13px] text-[#68747c]">Notes</span>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Client Information */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <SectionHeader title="Client Information" />

          <div className="space-y-6 p-5">
            <InfoItem icon={CircleUserRound} label="Contact Person">
              {client.contactPerson || "—"}
            </InfoItem>

            <InfoItem icon={Mail} label="Email">
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="transition-colors hover:text-[var(--primary)]"
                >
                  {client.email}
                </a>
              ) : (
                "—"
              )}
            </InfoItem>

            <InfoItem icon={Phone} label="Phone">
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="transition-colors hover:text-[var(--primary)]"
                >
                  {client.phone}
                </a>
              ) : (
                "—"
              )}
            </InfoItem>

            <InfoItem icon={Globe} label="Website">
              {client.website ? (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--primary)]"
                >
                  {stripProtocol(client.website)}

                  <ExternalLink size={11} />
                </a>
              ) : (
                "—"
              )}
            </InfoItem>

            <InfoItem icon={MapPin} label="Address">
              {client.address ? (
                <span className="whitespace-pre-line">{client.address}</span>
              ) : (
                "—"
              )}
            </InfoItem>

            <InfoItem icon={FileText} label="Notes">
              {client.notes || "No notes added."}
            </InfoItem>
          </div>
        </div>

        {/* Right Content */}
        <div className="min-w-0 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Projects" value={stats.projects} />

            <StatCard label="Credentials" value={stats.credentials} />

            <StatCard label="Categories" value={stats.categories} />
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              title="Recent Projects"
              action="View all"
              href={`/projects?client=${client._id}`}
            />

            <div className="px-3 py-2">
              {projects.length === 0 ? (
                <EmptySection
                  text="No projects have been added for this client yet."
                  href={`/projects/new?client=${client._id}`}
                  action="Add project"
                />
              ) : (
                projects.slice(0, 5).map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="group flex items-center gap-3 rounded-lg px-3 py-3.5 transition-colors hover:bg-white/[0.025]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Globe size={16} className="text-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-[#dce1e4]">
                        {project.name}
                      </p>

                      <p className="mt-1 text-[11px] text-[#65727a]">
                        {formatProjectType(project.type)}
                      </p>
                    </div>

                    <span
                      className={[
                        "rounded-md px-2.5 py-1.5 text-[10px] font-medium",
                        project.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : project.status === "completed"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/[0.06] text-[#7d8991]",
                      ].join(" ")}
                    >
                      {capitalizeStatus(project.status)}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-[#4f5a61] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              title="Recent Credentials"
              action="View all"
              href={`/credentials?client=${client._id}`}
            />

            <div className="px-3 py-2">
              {credentials.length === 0 ? (
                <EmptySection
                  text="No credentials have been added for this client yet."
                  href={`/credentials/new?client=${client._id}`}
                  action="Add credential"
                />
              ) : (
                credentials.slice(0, 5).map((credential) => (
                  <Link
                    key={credential._id}
                    href={`/credentials/${credential._id}`}
                    className="group flex items-center gap-3 rounded-lg px-3 py-3.5 transition-colors hover:bg-white/[0.025]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                      <ShieldCheck
                        size={16}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-[#dce1e4]">
                        {credential.name}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-[#65727a]">
                        {credential.category?.name || "Uncategorized"}
                        {credential.username ? ` · ${credential.username}` : ""}
                      </p>
                    </div>

                    {credential.isShared && (
                      <span className="hidden rounded-md bg-blue-500/10 px-2 py-1 text-[9px] font-medium text-blue-400 sm:block">
                        Shared
                      </span>
                    )}

                    {credential.isFavorite && (
                      <span className="text-[var(--primary)]">★</span>
                    )}

                    <ChevronRight
                      size={14}
                      className="text-[#4f5a61] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              title="Recent Activity"
              action="View all"
              href={`/activity?entity=client&entityId=${client._id}`}
            />

            <div className="px-4 py-2">
              {activity.length === 0 ? (
                <div className="px-3 py-7 text-center">
                  <p className="text-[11px] text-[#65727a]">
                    No activity has been recorded for this client yet.
                  </p>
                </div>
              ) : (
                activity.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 border-b border-white/[0.035] py-3 last:border-0"
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

          {/* Created */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
            <div>
              <p className="text-[11px] text-[#65727a]">Client created</p>

              <p className="mt-1 text-[12px] font-medium text-white">
                {formatDate(client.createdAt)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-[#65727a]">Last updated</p>

              <p className="mt-1 text-[12px] font-medium text-white">
                {formatDate(client.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-4 flex justify-end">
        <Link
          href={`/credentials/new?client=${client._id}`}
          className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-[12px] font-medium text-[#8b969d] transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          <Plus size={14} />
          Add Credential
        </Link>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close delete dialog"
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteDialog(false);
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
                  <span className="font-medium text-white">{client.name}</span>?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteDialog(false);
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
                This will also permanently delete this client&apos;s projects,
                credentials, and related activity. This action cannot be undone.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-[11px] font-medium text-[#65727a]">{label}</p>

      <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function EmptySection({
  text,
  href,
  action,
}: {
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="px-3 py-7 text-center">
      <p className="text-[11px] text-[#65727a]">{text}</p>

      <Link
        href={href}
        className="mt-2 inline-flex text-[11px] font-medium text-[var(--primary)] transition-colors hover:text-white"
      >
        {action}
      </Link>
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

function capitalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function formatProjectType(type: string) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  const actionLabel = capitalizeStatus(action);
  const entityLabel = capitalizeStatus(entity);

  return `${entityLabel} ${actionLabel.toLowerCase()}`;
}

function ClientDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse">
      <div className="mb-4 h-3 w-24 rounded bg-white/[0.05]" />

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-full bg-white/[0.06]" />

          <div>
            <div className="h-7 w-40 rounded bg-white/[0.06]" />
            <div className="mt-2 h-3 w-48 rounded bg-white/[0.04]" />
          </div>
        </div>

        <div className="h-9 w-28 rounded-md bg-white/[0.05]" />
      </div>

      <div className="mb-5 h-10 rounded border-b border-[var(--border)] bg-white/[0.015]" />

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="h-4 w-32 rounded bg-white/[0.06]" />

          <div className="mt-6 space-y-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-4 w-4 rounded bg-white/[0.05]" />

                <div className="flex-1">
                  <div className="h-3 w-20 rounded bg-white/[0.04]" />
                  <div className="mt-2 h-3 w-40 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
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

          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="h-4 w-32 rounded bg-white/[0.06]" />

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
