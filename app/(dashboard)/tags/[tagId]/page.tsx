import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  KeyRound,
  MoreVertical,
  Tag,
} from "lucide-react";

const tag = {
  id: "1",
  name: "production",
  description:
    "Used for credentials and projects that are currently running in the production environment.",
  type: "Environment",
  color: "#00e676",
  status: "Active",
  usage: 18,
  credentials: 14,
  projects: 4,
  created: "May 15, 2024",
  updated: "2 hours ago",
};

const relatedCredentials = [
  {
    id: "cred-1",
    name: "Shopify Admin",
    username: "admin@gumjoy.co.uk",
    client: "GumJoy",
    project: "GumJoy E-Commerce Website",
    category: "E-Commerce",
    updated: "2 hours ago",
  },
  {
    id: "cred-2",
    name: "Cloudinary",
    username: "gumjoy-media",
    client: "GumJoy",
    project: "GumJoy E-Commerce Website",
    category: "Storage / Media",
    updated: "5 hours ago",
  },
  {
    id: "cred-3",
    name: "GitHub - Main Account",
    username: "gumjoy-dev",
    client: "GumJoy",
    project: "GumJoy E-Commerce Website",
    category: "Development",
    updated: "1 day ago",
  },
  {
    id: "cred-4",
    name: "Cloudflare",
    username: "admin@gumjoy.co.uk",
    client: "GumJoy",
    project: "GumJoy E-Commerce Website",
    category: "Domain / DNS",
    updated: "2 days ago",
  },
  {
    id: "cred-5",
    name: "Vercel",
    username: "syncsurge-admin",
    client: "SyncSurge Agency",
    project: "SyncSurge Website",
    category: "Hosting",
    updated: "4 days ago",
  },
];

const relatedProjects = [
  {
    id: "1",
    name: "GumJoy E-Commerce Website",
    client: "GumJoy",
    type: "Shopify Store",
    credentials: 8,
    status: "Active",
  },
  {
    id: "2",
    name: "SyncSurge Website",
    client: "SyncSurge Agency",
    type: "Website",
    credentials: 3,
    status: "Active",
  },
  {
    id: "3",
    name: "Wilder Sports Store",
    client: "Wilder Side of Sports",
    type: "Website",
    credentials: 2,
    status: "Active",
  },
  {
    id: "4",
    name: "Afrosmile Website",
    client: "Afrosmile Backpackers",
    type: "Website",
    credentials: 1,
    status: "Active",
  },
];

const recentActivity = [
  {
    action: "Credential updated",
    resource: "Shopify Admin",
    description: "Credential information was updated.",
    time: "2 hours ago",
  },
  {
    action: "Credential viewed",
    resource: "Cloudinary",
    description: "Credential details were viewed.",
    time: "5 hours ago",
  },
  {
    action: "Project updated",
    resource: "GumJoy E-Commerce Website",
    description: "Project information was updated.",
    time: "1 day ago",
  },
  {
    action: "Credential created",
    resource: "GitHub - Main Account",
    description: "A new credential was added with this tag.",
    time: "3 days ago",
  },
];

export default async function TagDetailPage() {
  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <Link href="/tags" className="transition-colors hover:text-white">
          Tags
        </Link>

        <ChevronRight size={13} />

        <span className="text-white">{tag.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/tags"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
          >
            <ArrowLeft size={15} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                <Tag size={17} />
              </div>

              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                {tag.name}
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                {tag.status}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[var(--muted)]">
              {tag.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-12 lg:pl-0">
          <Link
            href={`/tags/${tag.id}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 text-[12px] font-medium text-white transition-colors hover:border-[var(--border-hover)]"
          >
            <Edit3 size={14} />
            Edit Tag
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Tag size={15} />}
          label="Total Usage"
          value={tag.usage}
        />

        <StatCard
          icon={<KeyRound size={15} />}
          label="Credentials"
          value={tag.credentials}
        />

        <StatCard
          icon={<ArrowUpRight size={15} />}
          label="Projects"
          value={tag.projects}
        />

        <StatCard
          icon={<Clock3 size={15} />}
          label="Last Updated"
          value={tag.updated}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Credentials */}
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Credentials Using This Tag
                </h2>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Credentials currently assigned to this tag.
                </p>
              </div>

              <span className="text-[11px] text-[var(--muted)]">
                {tag.credentials} total
              </span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {relatedCredentials.map((credential) => (
                <Link
                  key={credential.id}
                  href={`/credentials/${credential.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--primary)]">
                      <KeyRound size={14} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-white group-hover:text-[var(--primary)]">
                        {credential.name}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                        {credential.username}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--muted)]">
                        <span>{credential.client}</span>
                        <span>•</span>
                        <span>{credential.project}</span>
                        <span>•</span>
                        <span>{credential.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-[10px] text-[var(--muted)]">Updated</p>

                    <p className="mt-1 text-[10px] text-white">
                      {credential.updated}
                    </p>
                  </div>

                  <ChevronRight
                    size={14}
                    className="shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </Link>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-3">
              <Link
                href="/credentials"
                className="text-[11px] font-medium text-[var(--primary)] transition-colors hover:text-white"
              >
                View all credentials →
              </Link>
            </div>
          </section>

          {/* Projects */}
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Projects Using This Tag
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Projects where this tag is currently being used.
              </p>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-white group-hover:text-[var(--primary)]">
                      {project.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {project.client} • {project.type}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] text-[var(--muted)]">
                        Credentials
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-white">
                        {project.credentials}
                      </p>
                    </div>

                    <span className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2 py-1 text-[10px] text-[var(--primary)]">
                      {project.status}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-[var(--muted)] group-hover:text-white"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Recent Activity
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Recent actions involving resources with this tag.
              </p>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.resource}-${index}`}
                  className="flex gap-3 px-5 py-4"
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${tag.color}12`,
                      color: tag.color,
                    }}
                  >
                    <Clock3 size={13} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white">
                      {activity.action}
                    </p>

                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: tag.color }}
                    >
                      {activity.resource}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {activity.description}
                    </p>

                    <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-3">
              <Link
                href="/activity"
                className="text-[11px] font-medium text-[var(--primary)] transition-colors hover:text-white"
              >
                View all activity →
              </Link>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Tag Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-white">
                Tag Information
              </h2>
            </div>

            <div className="space-y-4 p-4">
              <InfoRow label="Name" value={tag.name} />

              <InfoRow label="Type" value={tag.type} />

              <InfoRow label="Status" value={tag.status} />

              <div>
                <p className="text-[10px] text-[var(--muted)]">Color</p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />

                  <span className="font-mono text-[11px] text-white">
                    {tag.color}
                  </span>
                </div>
              </div>

              <InfoRow label="Created" value={tag.created} />

              <InfoRow label="Last Updated" value={tag.updated} />
            </div>
          </section>

          {/* Usage Breakdown */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-white">
                Usage Breakdown
              </h2>
            </div>

            <div className="space-y-4 p-4">
              <UsageRow
                icon={<KeyRound size={14} />}
                label="Credentials"
                value={tag.credentials}
              />

              <UsageRow
                icon={<ArrowUpRight size={14} />}
                label="Projects"
                value={tag.projects}
              />

              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)]">
                    Total Usage
                  </span>

                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: tag.color }}
                  >
                    {tag.usage}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tag Preview */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Tag size={14} style={{ color: tag.color }} />

              <h2 className="text-[13px] font-semibold text-white">
                Tag Preview
              </h2>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium"
              style={{
                color: tag.color,
                borderColor: `${tag.color}40`,
                backgroundColor: `${tag.color}12`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />

              {tag.name}
            </span>
          </section>

          {/* Info */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${tag.color}12`,
                  color: tag.color,
                }}
              >
                <CheckCircle2 size={14} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-white">
                  Flexible organization
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
                  Tags can be assigned to multiple credentials and projects,
                  making them useful for cross-client filtering.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
        {icon}
      </div>

      <p className="text-[10px] text-[var(--muted)]">{label}</p>

      <p className="mt-1 text-[20px] font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--muted)]">{label}</p>

      <p className="mt-1 text-[11px] font-medium text-white">{value}</p>
    </div>
  );
}

function UsageRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--muted)]">
          {icon}
        </div>

        <span className="text-[11px] text-[var(--muted)]">{label}</span>
      </div>

      <span className="text-[12px] font-semibold text-white">{value}</span>
    </div>
  );
}
