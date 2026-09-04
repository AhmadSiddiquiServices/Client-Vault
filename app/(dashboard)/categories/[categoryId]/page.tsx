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

const category = {
  id: "1",
  name: "E-Commerce",
  description:
    "Credentials related to online stores, e-commerce platforms and store administration.",
  color: "#00e676",
  status: "Active",
  credentials: 12,
  projects: 3,
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
    updated: "2 hours ago",
  },
  {
    id: "cred-2",
    name: "WooCommerce Admin",
    username: "admin@example.com",
    client: "Eastern Kitchenware",
    project: "Eastern Kitchenware Website",
    updated: "1 day ago",
  },
  {
    id: "cred-3",
    name: "Stripe Dashboard",
    username: "finance@gumjoy.co.uk",
    client: "GumJoy",
    project: "GumJoy E-Commerce Website",
    updated: "3 days ago",
  },
  {
    id: "cred-4",
    name: "PayPal Business",
    username: "payments@example.com",
    client: "Wilder Side of Sports",
    project: "Wilder Sports Store",
    updated: "5 days ago",
  },
];

const relatedProjects = [
  {
    id: "1",
    name: "GumJoy E-Commerce Website",
    client: "GumJoy",
    credentials: 8,
    status: "Active",
  },
  {
    id: "2",
    name: "Eastern Kitchenware Website",
    client: "Eastern Kitchenware",
    credentials: 3,
    status: "Active",
  },
  {
    id: "3",
    name: "Wilder Sports Store",
    client: "Wilder Side of Sports",
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
    resource: "Stripe Dashboard",
    description: "Credential details were viewed.",
    time: "1 day ago",
  },
  {
    action: "Credential created",
    resource: "PayPal Business",
    description: "New credential was added to this category.",
    time: "5 days ago",
  },
];

export default async function CategoryDetailPage() {
  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <Link href="/categories" className="transition-colors hover:text-white">
          Categories
        </Link>

        <ChevronRight size={13} />

        <span className="text-white">{category.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/categories"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
          >
            <ArrowLeft size={15} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                }}
              >
                <KeyRound size={17} />
              </div>

              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                {category.name}
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                {category.status}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[var(--muted)]">
              {category.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-12 lg:pl-0">
          <Link
            href={`/categories/${category.id}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 text-[12px] font-medium text-white transition-colors hover:border-[var(--border-hover)]"
          >
            <Edit3 size={14} />
            Edit Category
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
          icon={<KeyRound size={15} />}
          label="Credentials"
          value={category.credentials}
        />

        <StatCard
          icon={<ArrowUpRight size={15} />}
          label="Projects"
          value={category.projects}
        />

        <StatCard
          icon={<CheckCircle2 size={15} />}
          label="Status"
          value={category.status}
        />

        <StatCard
          icon={<Clock3 size={15} />}
          label="Last Updated"
          value={category.updated}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Credentials */}
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Credentials
                </h2>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Credentials assigned to this category.
                </p>
              </div>

              <span className="text-[11px] text-[var(--muted)]">
                {category.credentials} total
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
                Related Projects
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Projects currently using credentials from this category.
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
                      {project.client}
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

          {/* Activity */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Recent Activity
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Recent actions involving this category.
              </p>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.resource}-${index}`}
                  className="flex gap-3 px-5 py-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Clock3 size={13} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white">
                      {activity.action}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[var(--primary)]">
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
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Category Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-white">
                Category Information
              </h2>
            </div>

            <div className="space-y-4 p-4">
              <InfoRow label="Name" value={category.name} />

              <div>
                <p className="text-[10px] text-[var(--muted)]">Color</p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />

                  <span className="font-mono text-[11px] text-white">
                    {category.color}
                  </span>
                </div>
              </div>

              <InfoRow label="Status" value={category.status} />

              <InfoRow label="Created" value={category.created} />

              <InfoRow label="Last Updated" value={category.updated} />
            </div>
          </section>

          {/* Category Usage */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-white">Usage</h2>
            </div>

            <div className="space-y-4 p-4">
              <UsageRow
                icon={<KeyRound size={14} />}
                label="Credentials"
                value={category.credentials}
              />

              <UsageRow
                icon={<ArrowUpRight size={14} />}
                label="Projects"
                value={category.projects}
              />
            </div>
          </section>

          {/* Color Preview */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Tag size={14} style={{ color: category.color }} />

              <h2 className="text-[13px] font-semibold text-white">
                Category Label
              </h2>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium"
              style={{
                color: category.color,
                borderColor: `${category.color}40`,
                backgroundColor: `${category.color}12`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />

              {category.name}
            </span>
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
