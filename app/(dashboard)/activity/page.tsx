"use client";

import Link from "next/link";
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
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ActivityAction =
  | "created"
  | "updated"
  | "viewed"
  | "deleted"
  | "copied"
  | "archived"
  | "restored";

type ActivityEntity = "credential" | "project" | "client" | "category" | "tag";

type ApiActivityItem = {
  _id: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  resourceName: string;
  description?: string;
  metadata?: Record<string, unknown>;

  actor: {
    name: string;
    initials: string;
  };

  createdAt: string;
  updatedAt: string;
};

type ActivityItem = {
  id: string;
  action: ActivityAction;
  resourceType: ActivityEntity;
  entityId: string;
  resource: string;
  description: string;
  user: string;
  userInitials: string;
  timestamp: string;
  date: string;
  createdAt: string;
};

type ActivityApiResponse = {
  success: boolean;
  message?: string;

  activities: ApiActivityItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  summary: {
    today: number;
    credential: number;
    security: number;
  };
};

const actionFilters = [
  { label: "All Actions", value: "" },
  { label: "Created", value: "created" },
  { label: "Updated", value: "updated" },
  { label: "Viewed", value: "viewed" },
  { label: "Copied", value: "copied" },
  { label: "Deleted", value: "deleted" },
  { label: "Archived", value: "archived" },
  { label: "Restored", value: "restored" },
];

const resourceFilters = [
  { label: "All Resources", value: "" },
  { label: "Credential", value: "credential" },
  { label: "Project", value: "project" },
  { label: "Client", value: "client" },
  { label: "Category", value: "category" },
  { label: "Tag", value: "tag" },
];

export default function ActivityPage() {
  const [search, setSearch] = useState("");

  const [action, setAction] = useState("");

  const [resource, setResource] = useState("");

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [page, setPage] = useState(1);

  const [limit] = useState(20);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [hasNextPage, setHasNextPage] = useState(false);

  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const [summary, setSummary] = useState({
    today: 0,
    credential: 0,
    security: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  /*
   * ----------------------------------------
   * Debounce search
   * ----------------------------------------
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  /*
   * ----------------------------------------
   * Load activities
   * ----------------------------------------
   */
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);

        setError(null);

        const params = new URLSearchParams();

        params.set("page", String(page));

        params.set("limit", String(limit));

        if (search) {
          params.set("search", search);
        }

        if (action) {
          params.set("action", action);
        }

        if (resource) {
          params.set("entity", resource);
        }

        const response = await fetch(`/api/activity?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: ActivityApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load activity.");
        }

        const mappedActivities: ActivityItem[] = data.activities.map(
          (item) => ({
            id: item._id,
            action: item.action,
            resourceType: item.entity,
            entityId: item.entityId,
            resource: item.resourceName,
            description: item.description || `${item.action} ${item.entity}.`,
            user: item.actor.name,
            userInitials: item.actor.initials,
            timestamp: formatRelativeTime(item.createdAt),
            date: formatActivityDate(item.createdAt),
            createdAt: item.createdAt,
          }),
        );

        setActivities(mappedActivities);

        setTotal(data.pagination.total);

        setTotalPages(data.pagination.totalPages);

        setHasNextPage(data.pagination.hasNextPage);

        setHasPreviousPage(data.pagination.hasPreviousPage);

        setSummary(data.summary);
      } catch (error) {
        console.error("Activity page error:", error);

        setActivities([]);

        setTotal(0);

        setTotalPages(0);

        setHasNextPage(false);

        setHasPreviousPage(false);

        setError(
          error instanceof Error ? error.message : "Failed to load activity.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [action, resource, search, page, limit]);

  /*
   * ----------------------------------------
   * Local search isn't needed anymore.
   * Backend now handles the search.
   * ----------------------------------------
   */
  const filteredActivities = useMemo(() => activities, [activities]);

  /*
   * ----------------------------------------
   * Filter changes reset pagination.
   * ----------------------------------------
   */
  const handleActionChange = (value: string) => {
    setAction(value);

    setPage(1);
  };

  const handleResourceChange = (value: string) => {
    setResource(value);

    setPage(1);
  };

  /*
   * ----------------------------------------
   * Resource links
   * ----------------------------------------
   */
  const getResourceHref = (type: ActivityEntity, id: string) => {
    switch (type) {
      case "credential":
        return `/credentials/${id}`;

      case "project":
        return `/projects/${id}`;

      case "client":
        return `/clients/${id}`;

      case "category":
        return "/categories";

      case "tag":
        return "/tags";

      default:
        return null;
    }
  };

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
                Important actions such as credential access, updates, deletions
                and account activity are recorded here.
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-[12px] font-medium text-[var(--muted)] lg:self-auto">
          <CalendarDays size={14} />
          All Activity
          <ChevronDown size={13} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
          <p className="text-[12px] font-medium text-red-400">
            Failed to load activity
          </p>

          <p className="mt-1 text-[11px] text-[var(--muted)]">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-[11px] font-medium text-[var(--primary)] transition hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Today's Activity"
          value={summary.today}
          icon={<Clock3 size={16} />}
        />

        <SummaryCard
          label="Credential Events"
          value={summary.credential}
          icon={<KeyRound size={16} />}
        />

        <SummaryCard
          label="Security Events"
          value={summary.security}
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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search activity, resources, users..."
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
            />
          </div>

          <FilterSelect
            value={action}
            options={actionFilters}
            onChange={handleActionChange}
          />

          <FilterSelect
            value={resource}
            options={resourceFilters}
            onChange={handleResourceChange}
          />

          <div className="hidden items-center gap-2 text-[11px] text-[var(--muted)] xl:flex">
            <Filter size={13} />
            {total} events
          </div>
        </div>
      </div>

      {isLoading ? (
        <ActivityTableSkeleton />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {/* Desktop Header */}
          <div className="hidden grid-cols-[1.35fr_1.6fr_2.4fr_1.2fr_150px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] xl:grid">
            <div>Action</div>
            <div>Resource</div>
            <div>Description</div>
            <div>User</div>
            <div>Time</div>
          </div>

          {/* Rows */}
          <div>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((item) => (
                <ActivityRow
                  key={item.id}
                  item={item}
                  getResourceHref={getResourceHref}
                />
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
                  Try changing your search or filters to find the activity you
                  are looking for.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[var(--muted)]">
                Showing{" "}
                <span className="font-medium text-white">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-medium text-white">{total}</span>{" "}
                events
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={!hasPreviousPage || isLoading}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[var(--primary)] px-2 text-[11px] font-semibold text-black">
                  {page}
                </span>

                <span className="px-1 text-[10px] text-[var(--muted)]">
                  of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={!hasNextPage || isLoading}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
   Activity Row
----------------------------------------- */

function ActivityRow({
  item,
  getResourceHref,
}: {
  item: ActivityItem;
  getResourceHref: (type: ActivityEntity, id: string) => string | null;
}) {
  const resourceHref = getResourceHref(item.resourceType, item.entityId);

  return (
    <div className="group border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)]">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1.6fr_2.4fr_1.2fr_150px] xl:items-center">
        {/* Action */}
        <div>
          <div className="flex items-center gap-2.5">
            <ActionIcon action={item.action} />

            <div>
              <p className="text-[12px] font-medium text-white">
                {formatAction(item.action)}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)] xl:hidden">
                {item.timestamp}
              </p>
            </div>
          </div>
        </div>

        {/* Resource */}
        <div className="min-w-0">
          {resourceHref ? (
            <Link
              href={resourceHref}
              className="block truncate text-[12px] font-medium text-white transition hover:text-[var(--primary)]"
            >
              {item.resource}
            </Link>
          ) : (
            <p className="truncate text-[12px] font-medium text-white">
              {item.resource}
            </p>
          )}

          <span className="mt-1 inline-flex rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[10px] text-[var(--muted)]">
            {formatResourceType(item.resourceType)}
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

            <span className="truncate text-[11px] text-white">{item.user}</span>
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-[10px] text-[var(--muted)]">{item.timestamp}</p>

          <p className="mt-1 text-[9px] text-[var(--muted)]">{item.date}</p>
        </div>

        {/* Mobile Details */}
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
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Action Icon
----------------------------------------- */

function ActionIcon({ action }: { action: ActivityAction }) {
  if (action === "created") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        <Plus size={14} />
      </div>
    );
  }

  if (action === "updated") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <FileEdit size={14} />
      </div>
    );
  }

  if (action === "viewed") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
        <Eye size={14} />
      </div>
    );
  }

  if (action === "copied") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
        <KeyRound size={14} />
      </div>
    );
  }

  if (action === "deleted") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
        <Trash2 size={14} />
      </div>
    );
  }

  if (action === "archived") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400">
        <ShieldCheck size={14} />
      </div>
    );
  }

  if (action === "restored") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-400">
        <ShieldCheck size={14} />
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
   Action Labels
----------------------------------------- */

function formatAction(action: ActivityAction) {
  const labels: Record<ActivityAction, string> = {
    created: "Created",
    updated: "Updated",
    viewed: "Viewed",
    deleted: "Deleted",
    copied: "Copied",
    archived: "Archived",
    restored: "Restored",
  };

  return labels[action];
}

/* ----------------------------------------
   Resource Labels
----------------------------------------- */

function formatResourceType(type: ActivityEntity) {
  const labels: Record<ActivityEntity, string> = {
    credential: "Credential",
    project: "Project",
    client: "Client",
    category: "Category",
    tag: "Tag",
  };

  return labels[type];
}

/* ----------------------------------------
   Relative Time
----------------------------------------- */

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const difference = Date.now() - date.getTime();

  const minute = 60 * 1000;

  const hour = 60 * minute;

  const day = 24 * hour;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    const minutes = Math.floor(difference / minute);

    return `${minutes}m ago`;
  }

  if (difference < day) {
    const hours = Math.floor(difference / hour);

    return `${hours}h ago`;
  }

  if (difference < 7 * day) {
    const days = Math.floor(difference / day);

    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ----------------------------------------
   Activity Date
----------------------------------------- */

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(now);

  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  options: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[155px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
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

/* ----------------------------------------
   Table Skeleton
----------------------------------------- */

function ActivityTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="hidden grid-cols-[1.35fr_1.6fr_2.4fr_1.2fr_150px] gap-4 border-b border-[var(--border)] px-5 py-3 xl:grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded bg-white/[0.05]"
          />
        ))}
      </div>

      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4 border-b border-[var(--border)] px-5 py-5 xl:grid-cols-[1.35fr_1.6fr_2.4fr_1.2fr_150px]"
        >
          <div className="h-8 w-28 animate-pulse rounded bg-white/[0.05]" />

          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-white/[0.05]" />

            <div className="mt-2 h-5 w-20 animate-pulse rounded bg-white/[0.04]" />
          </div>

          <div>
            <div className="h-3 w-full max-w-[250px] animate-pulse rounded bg-white/[0.04]" />

            <div className="mt-2 h-3 w-2/3 max-w-[180px] animate-pulse rounded bg-white/[0.03]" />
          </div>

          <div className="h-7 w-20 animate-pulse rounded-full bg-white/[0.04]" />

          <div>
            <div className="h-3 w-20 animate-pulse rounded bg-white/[0.04]" />

            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}
