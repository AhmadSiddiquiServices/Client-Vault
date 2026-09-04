"use client";

import {
  Activity,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const client = {
  id: "1",
  name: "GumJoy",
  status: "Active",
  contactPerson: "John Smith",
  email: "enquiries@gumjoy.co.uk",
  phone: "+44 7377 615576",
  website: "http://gumjoy.co.uk",
  address: "38 Lomond Road, M22 5JD\nUnited Kingdom",
  notes: "Gummies (fruit juice candies) business.",
};

const projects = [
  {
    id: "1",
    name: "GumJoy E-Commerce Website",
    type: "Shopify Store",
    credentials: 12,
    status: "Active",
  },
  {
    id: "2",
    name: "GumJoy Marketing",
    type: "Marketing / Social",
    credentials: 3,
    status: "Active",
  },
];

const renewals = [
  {
    name: "gumjoy.co.uk",
    type: "Domain",
    date: "Oct 18, 2026",
    remaining: "12 days left",
  },
  {
    name: "GumJoy Hosting",
    type: "Hosting",
    date: "Nov 5, 2026",
    remaining: "30 days left",
  },
  {
    name: "SSL Certificate",
    type: "SSL / Security",
    date: "Dec 12, 2026",
    remaining: "67 days left",
  },
];

const recentActivity = [
  {
    title: "Shopify Admin credential updated",
    time: "2 hours ago",
    icon: ShieldCheck,
  },
  {
    title: "GumJoy E-Commerce Website updated",
    time: "5 hours ago",
    icon: Globe,
  },
  {
    title: "Cloudinary credential viewed",
    time: "1 day ago",
    icon: Activity,
  },
];

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

export default function ClientDetailPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-[11px] text-[#59656d]">
        <span>Clients</span>

        <ChevronRight size={12} />

        <span className="text-[#89949b]">{client.name}</span>
      </div>

      {/* Client Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-[14px] font-semibold text-white">
            G
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                {client.name}
              </h1>

              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                {client.status}
              </span>
            </div>

            <p className="mt-1 text-[12px] text-[#65727a]">
              Client overview and management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] font-medium text-[#aab4b9] transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            <Edit3 size={14} />
            Edit Client
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
          Projects
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

      {/* Main Content */}
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Client Information */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <SectionHeader title="Client Information" />

          <div className="space-y-6 p-5">
            <InfoItem icon={CircleUserRound} label="Contact Person">
              {client.contactPerson}
            </InfoItem>

            <InfoItem icon={Mail} label="Email">
              <a
                href={`mailto:${client.email}`}
                className="transition-colors hover:text-[var(--primary)]"
              >
                {client.email}
              </a>
            </InfoItem>

            <InfoItem icon={Phone} label="Phone">
              <a
                href={`tel:${client.phone}`}
                className="transition-colors hover:text-[var(--primary)]"
              >
                {client.phone}
              </a>
            </InfoItem>

            <InfoItem icon={Globe} label="Website">
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--primary)]"
              >
                {client.website.replace("http://", "")}

                <ExternalLink size={11} />
              </a>
            </InfoItem>

            <InfoItem icon={MapPin} label="Address">
              <span className="whitespace-pre-line">{client.address}</span>
            </InfoItem>

            <InfoItem icon={FileText} label="Notes">
              {client.notes}
            </InfoItem>
          </div>
        </div>

        {/* Right Content */}
        <div className="min-w-0 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-[11px] font-medium text-[#65727a]">Projects</p>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                2
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-[11px] font-medium text-[#65727a]">
                Credentials
              </p>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                18
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-[11px] font-medium text-[#65727a]">
                Categories
              </p>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                6
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-[11px] font-medium text-[#65727a]">
                Upcoming Renewals
              </p>

              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                7
              </p>
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Recent Projects" action="View all" />

            <div className="px-3 py-2">
              {projects.map((project) => (
                <div
                  key={project.id}
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
                      {project.type}
                    </p>
                  </div>

                  <span className="hidden text-[11px] text-[#68747c] sm:block">
                    {project.credentials} Credentials
                  </span>

                  <span className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-medium text-emerald-400">
                    {project.status}
                  </span>

                  <ChevronRight size={14} className="text-[#4f5a61]" />
                </div>
              ))}
            </div>
          </div>

          {/* Renewals */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Upcoming Renewals" action="View all" />

            <div className="px-4 py-2">
              {renewals.map((renewal) => (
                <div
                  key={renewal.name}
                  className="flex min-h-12 items-center gap-3 border-b border-white/[0.035] last:border-0"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-yellow-400/10">
                    <CalendarDays size={14} className="text-yellow-400" />
                  </div>

                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#dce1e4]">
                    {renewal.name}
                  </span>

                  <span className="hidden w-24 text-[11px] text-[#68747c] sm:block">
                    {renewal.type}
                  </span>

                  <span className="hidden w-28 text-[11px] text-[#68747c] md:block">
                    {renewal.date}
                  </span>

                  <span className="w-20 text-right text-[11px] font-medium text-yellow-400">
                    {renewal.remaining}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader title="Recent Activity" />

            <div className="px-4 py-2">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.title}
                    className="flex items-center gap-3 border-b border-white/[0.035] py-3 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                      <Icon size={14} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-[#cbd3d7]">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-[11px] text-[#65727a]">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-4 flex justify-end">
        <button className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-[12px] font-medium text-[#8b969d] transition-colors hover:bg-white/[0.03] hover:text-white">
          <Plus size={14} />
          Add Credential
        </button>
      </div>
    </div>
  );
}
