"use client";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileEdit,
  Filter,
  KeyRound,
  LogIn,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

type ActivityItem = {
  id: string;
  action: "Created" | "Updated" | "Viewed" | "Deleted" | "Logged In";
  resourceType: "Credential" | "Project" | "Client" | "Category" | "Account";
  resource: string;
  description: string;
  user: string;
  userInitials: string;
  timestamp: string;
  date: string;
  ip: string;
};

const activities: ActivityItem[] = [
  {
    id: "activity-1",
    action: "Updated",
    resourceType: "Credential",
    resource: "Shopify Admin",
    description: "Credential password was updated.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "2 hours ago",
    date: "Today",
    ip: "192.168.1.24",
  },
  {
    id: "activity-2",
    action: "Viewed",
    resourceType: "Credential",
    resource: "Cloudinary",
    description: "Credential details were viewed.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "5 hours ago",
    date: "Today",
    ip: "192.168.1.24",
  },
  {
    id: "activity-3",
    action: "Updated",
    resourceType: "Project",
    resource: "GumJoy E-Commerce Website",
    description: "Project information was updated.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "6 hours ago",
    date: "Today",
    ip: "192.168.1.24",
  },
  {
    id: "activity-4",
    action: "Created",
    resourceType: "Credential",
    resource: "Google Analytics",
    description: "New credential was added to the project.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "Yesterday",
    date: "Yesterday",
    ip: "192.168.1.24",
  },
  {
    id: "activity-5",
    action: "Updated",
    resourceType: "Client",
    resource: "GumJoy",
    description: "Client contact information was updated.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "Yesterday",
    date: "Yesterday",
    ip: "192.168.1.24",
  },
  {
    id: "activity-6",
    action: "Viewed",
    resourceType: "Project",
    resource: "SyncSurge Website",
    description: "Project details were viewed.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "2 days ago",
    date: "Aug 31, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-7",
    action: "Created",
    resourceType: "Project",
    resource: "Afrosmile Website",
    description: "New project was created.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "3 days ago",
    date: "Aug 30, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-8",
    action: "Updated",
    resourceType: "Category",
    resource: "Development",
    description: "Category information was updated.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "4 days ago",
    date: "Aug 29, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-9",
    action: "Deleted",
    resourceType: "Credential",
    resource: "Old Hosting Account",
    description: "Credential was permanently removed.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "5 days ago",
    date: "Aug 28, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-10",
    action: "Logged In",
    resourceType: "Account",
    resource: "ClientVault",
    description: "Successful account login.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "6 days ago",
    date: "Aug 27, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-11",
    action: "Updated",
    resourceType: "Credential",
    resource: "GitHub - Main Account",
    description: "Credential details were updated.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "1 week ago",
    date: "Aug 26, 2026",
    ip: "192.168.1.24",
  },
  {
    id: "activity-12",
    action: "Created",
    resourceType: "Client",
    resource: "Eastern Kitchenware",
    description: "New client was added.",
    user: "Ahmad",
    userInitials: "AS",
    timestamp: "1 week ago",
    date: "Aug 25, 2026",
    ip: "192.168.1.24",
  },
];

const actionFilters = [
  "All Actions",
  "Created",
  "Updated",
  "Viewed",
  "Deleted",
  "Logged In",
];

const resourceFilters = [
  "All Resources",
  "Credential",
  "Project",
  "Client",
  "Category",
  "Account",
];

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All Actions");
  const [resource, setResource] = useState("All Resources");

  const filteredActivities = useMemo(() => {
    const term = search.toLowerCase().trim();

    return activities.filter((item) => {
      const matchesSearch =
        !term ||
        item.action.toLowerCase().includes(term) ||
        item.resource.toLowerCase().includes(term) ||
        item.resourceType.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.user.toLowerCase().includes(term);

      const matchesAction = action === "All Actions" || item.action === action;

      const matchesResource =
        resource === "All Resources" || item.resourceType === resource;

      return matchesSearch && matchesAction && matchesResource;
    });
  }, [search, action, resource]);

  const todayCount = activities.filter((item) => item.date === "Today").length;

  const credentialCount = activities.filter(
    (item) => item.resourceType === "Credential",
  ).length;

  const securityCount = activities.filter(
    (item) => item.action === "Logged In" || item.action === "Deleted",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <Activity size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Activity
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Review activity and audit events across your vault.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-[12px] font-medium text-white transition hover:bg-[var(--background)]"
        >
          <CalendarDays size={14} />
          Date Range
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Security banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          <ShieldCheck size={16} className="text-[var(--primary)]" />
        </div>

        <div>
          <p className="text-[12px] font-medium text-white">Audit trail</p>

          <p className="mt-0.5 text-[11px] leading-5 text-[var(--muted)]">
            Important actions such as credential access, updates, deletions and
            account activity are recorded here.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Today's Activity"
          value={todayCount}
          icon={<Clock3 size={16} />}
        />

        <SummaryCard
          label="Credential Events"
          value={credentialCount}
          icon={<KeyRound size={16} />}
        />

        <SummaryCard
          label="Security Events"
          value={securityCount}
          icon={<ShieldCheck size={16} />}
        />
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity, resources, users..."
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
            />
          </div>

          <FilterSelect
            value={action}
            options={actionFilters}
            onChange={setAction}
          />

          <FilterSelect
            value={resource}
            options={resourceFilters}
            onChange={setResource}
          />

          <div className="hidden items-center gap-2 text-[11px] text-[var(--muted)] xl:flex">
            <Filter size={13} />
            {filteredActivities.length} events
          </div>
        </div>
      </div>

      {/* Activity list */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {/* Desktop header */}
        <div className="hidden grid-cols-[1.35fr_1.6fr_2.4fr_1.1fr_150px_44px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] xl:grid">
          <div>Action</div>
          <div>Resource</div>
          <div>Description</div>
          <div>User</div>
          <div>Time</div>
          <div />
        </div>

        {/* Rows */}
        <div>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <Activity size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                No activity found
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                Try changing your search or filters to find the activity you are
                looking for.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredActivities.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[var(--muted)]">
              Showing{" "}
              <span className="font-medium text-white">
                1–{filteredActivities.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white">
                {filteredActivities.length}
              </span>{" "}
              events
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Activity Row
----------------------------------------- */

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] xl:grid-cols-[1.35fr_1.6fr_2.4fr_1.1fr_150px_44px] xl:items-center">
      {/* Action */}
      <div>
        <div className="flex items-center gap-2.5">
          <ActionIcon action={item.action} />

          <div>
            <p className="text-[12px] font-medium text-white">{item.action}</p>

            <p className="mt-1 text-[10px] text-[var(--muted)] xl:hidden">
              {item.timestamp}
            </p>
          </div>
        </div>
      </div>

      {/* Resource */}
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-white">
          {item.resource}
        </p>

        <span className="mt-1 inline-flex rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[10px] text-[var(--muted)]">
          {item.resourceType}
        </span>
      </div>

      {/* Description */}
      <div className="min-w-0">
        <p className="text-[11px] leading-5 text-[var(--muted)]">
          {item.description}
        </p>
      </div>

      {/* User */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[9px] font-semibold text-white">
            {item.userInitials}
          </div>

          <span className="text-[11px] text-white">{item.user}</span>
        </div>
      </div>

      {/* Time */}
      <div>
        <p className="text-[10px] text-[var(--muted)]">{item.timestamp}</p>

        <p className="mt-1 font-mono text-[9px] text-[var(--muted)]">
          {item.ip}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          type="button"
          title="View activity details"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] opacity-100 transition hover:bg-[var(--card)] hover:text-white xl:opacity-0 xl:group-hover:opacity-100"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Mobile details */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:hidden">
        <div className="flex items-center gap-1.5">
          <UserRound size={12} className="text-[var(--muted)]" />
          <span className="text-[10px] text-[var(--muted)]">{item.user}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock3 size={12} className="text-[var(--muted)]" />
          <span className="text-[10px] text-[var(--muted)]">
            {item.timestamp}
          </span>
        </div>

        <span className="font-mono text-[9px] text-[var(--muted)]">
          {item.ip}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Action Icon
----------------------------------------- */

function ActionIcon({ action }: { action: ActivityItem["action"] }) {
  if (action === "Created") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        <Plus size={14} />
      </div>
    );
  }

  if (action === "Updated") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <FileEdit size={14} />
      </div>
    );
  }

  if (action === "Viewed") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
        <Eye size={14} />
      </div>
    );
  }

  if (action === "Deleted") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
        <Trash2 size={14} />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400">
      <LogIn size={14} />
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
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[155px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
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
   Summary Card
----------------------------------------- */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--muted)]">{label}</span>

        <div className="text-[var(--muted)]">{icon}</div>
      </div>

      <p className="mt-2 text-[24px] font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
