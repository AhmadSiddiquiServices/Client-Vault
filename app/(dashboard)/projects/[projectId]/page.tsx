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
  MoreVertical,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";

const project = {
  id: "1",
  name: "GumJoy E-Commerce Website",
  type: "Shopify Store",
  status: "Active",
  client: "GumJoy",
  clientId: "1",
  url: "https://gumjoy.co.uk",
  description:
    "GumJoy's main e-commerce website built on Shopify for selling fruit juice gummy sweets.",
  credentials: 12,
  categories: 4,
  tags: ["shopify", "e-commerce", "production"],
  created: "May 15, 2024",
  lastUpdated: "May 29, 2024",
};

const credentials = [
  {
    id: "1",
    name: "Shopify Admin",
    category: "E-Commerce",
    username: "admin@gumjoy.co.uk",
    updated: "2 hours ago",
  },
  {
    id: "2",
    name: "Cloudinary",
    category: "Storage / Media",
    username: "gumjoy-media",
    updated: "5 hours ago",
  },
  {
    id: "3",
    name: "Google Analytics",
    category: "Analytics",
    username: "admin@gumjoy.co.uk",
    updated: "1 day ago",
  },
  {
    id: "4",
    name: "GitHub - Main Account",
    category: "Development",
    username: "gumjoy-dev",
    updated: "1 day ago",
  },
];

const activity = [
  {
    title: "Shopify Admin credential updated",
    time: "2 hours ago",
    icon: KeyRound,
  },
  {
    title: "Project information updated",
    time: "5 hours ago",
    icon: Edit3,
  },
  {
    title: "Cloudinary credential viewed",
    time: "1 day ago",
    icon: KeyRound,
  },
  {
    title: "Project created",
    time: "May 15, 2024",
    icon: FolderKanban,
  },
];

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>

      {action && (
        <button className="flex items-center gap-1 text-[12px] text-[#78858d] transition-colors hover:text-white">
          {action}
          <ChevronRight size={13} />
        </button>
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
  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-[11px] text-[#59656d]">
        <span>Clients</span>

        <ChevronRight size={12} />

        <span>{project.client}</span>

        <ChevronRight size={12} />

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

              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                {project.status}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#65727a]">
              <span>{project.type}</span>

              <span className="text-[#3e494f]">•</span>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--primary)]"
              >
                {project.url}
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] text-[#aab4b9] transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            <Edit3 size={14} />
            Edit Project
          </Link>

          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[#78858d] transition-colors hover:bg-white/[0.03] hover:text-white">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-7 border-b border-[var(--border)]">
        <button className="relative pb-3 text-[13px] font-medium text-[var(--primary)]">
          Overview
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
        </button>

        <button className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white">
          Credentials
        </button>

        <button className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white">
          Activity
        </button>

        <button className="pb-3 text-[13px] text-[#68747c] transition-colors hover:text-white">
          Notes
        </button>
      </div>

      {/* Main */}
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Information */}
        <div className="space-y-4">
          {/* Project Information */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Project Information" />

            <div className="space-y-6 p-5">
              <InfoRow icon={Users} label="Client">
                <a
                  href={`/clients/${project.clientId}`}
                  className="transition-colors hover:text-[var(--primary)]"
                >
                  {project.client}
                </a>
              </InfoRow>

              <InfoRow icon={FolderKanban} label="Project Type">
                {project.type}
              </InfoRow>

              <InfoRow icon={Globe} label="Website / URL">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 break-all transition-colors hover:text-[var(--primary)]"
                >
                  {project.url}
                  <ExternalLink size={11} />
                </a>
              </InfoRow>

              <InfoRow icon={Activity} label="Description">
                {project.description}
              </InfoRow>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Tags" />

            <div className="flex flex-wrap gap-2 p-5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-medium text-emerald-400"
                >
                  {tag}
                </span>
              ))}

              <button className="flex items-center gap-1 rounded-md border border-dashed border-[var(--border)] px-2.5 py-1.5 text-[10px] text-[#65727a] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]">
                <Plus size={11} />
                Add Tag
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Information" />

            <div className="space-y-5 p-5">
              <InfoRow icon={Clock3} label="Created">
                {project.created}
              </InfoRow>

              <InfoRow icon={Activity} label="Last Updated">
                {project.lastUpdated}
              </InfoRow>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="min-w-0 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#65727a]">
                  Credentials
                </p>

                <KeyRound size={16} className="text-[var(--primary)]" />
              </div>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                {project.credentials}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#65727a]">
                  Categories
                </p>

                <Tag size={16} className="text-[var(--primary)]" />
              </div>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                {project.categories}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#65727a]">Status</p>

                <CircleCheck size={16} className="text-emerald-400" />
              </div>

              <p className="mt-2 text-[18px] font-semibold leading-none text-emerald-400">
                {project.status}
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

              <button className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3.5 text-[11px] font-semibold text-[#041109] transition-colors hover:bg-[var(--primary-hover)]">
                <Plus size={14} />
                Add Credential
              </button>
            </div>

            <div className="divide-y divide-white/[0.035]">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.018]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                    <KeyRound size={16} className="text-[var(--primary)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-[#dce1e4]">
                      {credential.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-[#65727a]">
                        {credential.category}
                      </span>

                      <span className="text-[#39444a]">•</span>

                      <span className="text-[11px] text-[#65727a]">
                        {credential.username}
                      </span>
                    </div>
                  </div>

                  <span className="hidden text-[11px] text-[#65727a] md:block">
                    {credential.updated}
                  </span>

                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] transition-colors hover:bg-white/[0.05] hover:text-white">
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-4">
              <button className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--primary)] hover:text-emerald-300">
                View all credentials
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Recent Activity" />

            <div className="px-5 py-2">
              {activity.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 border-b border-white/[0.035] py-3.5 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                      <Icon size={14} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-[#cbd3d7]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[11px] text-[#65727a]">
                        {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
