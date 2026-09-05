"use client";

import { Eye, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type ActivityPeriod = "this-week" | "this-month" | "this-year";

type ActivityType = "viewed" | "created" | "updated" | "deleted";

interface ActivityItem {
  type: ActivityType;
  count: number;
}

interface ActivityResponse {
  success: boolean;
  period: ActivityPeriod;
  total: number;
  activities: ActivityItem[];
}

const activityConfig: Record<
  ActivityType,
  {
    label: string;
    icon: typeof Eye;
  }
> = {
  viewed: {
    label: "Viewed",
    icon: Eye,
  },
  created: {
    label: "Created",
    icon: FilePlus2,
  },
  updated: {
    label: "Updated",
    icon: Pencil,
  },
  deleted: {
    label: "Deleted",
    icon: Trash2,
  },
};

const periods: {
  value: ActivityPeriod;
  label: string;
}[] = [
  {
    value: "this-week",
    label: "This Week",
  },
  {
    value: "this-month",
    label: "This Month",
  },
  {
    value: "this-year",
    label: "This Year",
  },
];

export function ActivityOverview() {
  const [period, setPeriod] = useState<ActivityPeriod>("this-week");
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/dashboard/activity?period=${period}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load activity.");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("Activity overview fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load activity.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, [period, retryKey]);

  const activities = data?.activities ?? [];

  const total = data?.total ?? 0;

  const hasData = activities.some((activity) => activity.count > 0);

  const percentages = activities.map((activity) => ({
    ...activity,
    percentage: total > 0 ? (activity.count / total) * 100 : 0,
  }));

  const gradientStops = percentages
    .filter((activity) => activity.percentage > 0)
    .reduce((result, activity) => {
      const start = percentages
        .filter((item) => item.percentage > 0)
        .slice(
          0,
          percentages.filter((item) => item.percentage > 0).indexOf(activity),
        )
        .reduce((sum, item) => sum + item.percentage, 0);

      const end = start + activity.percentage;

      const colorMap: Record<ActivityType, string> = {
        viewed: "#00e676",
        created: "#0cae60",
        updated: "#087c49",
        deleted: "#15372a",
      };

      result.push(
        `${colorMap[activity.type]} ${start * 3.6}deg ${end * 3.6}deg`,
      );

      return result;
    }, [] as string[]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-3">
        <h2 className="text-[14px] font-semibold text-white">
          Activity Overview
        </h2>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value as ActivityPeriod)}
          disabled={loading}
          className="h-8 cursor-pointer appearance-none rounded-md border border-[var(--border)] bg-white/[0.02] px-2.5 text-[11px] text-[#78858d] outline-none transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {periods.map((item) => (
            <option
              key={item.value}
              value={item.value}
              className="bg-[#131a20] text-white"
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-[150px] items-center gap-5 px-4 py-3">
        {/* Donut */}
        <div className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: loading
                ? "#15372a"
                : !hasData
                  ? "#15372a"
                  : `conic-gradient(${gradientStops.join(", ")})`,
            }}
          />

          <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-[#0d1318]">
            <span className="text-[20px] font-semibold leading-none text-white">
              {loading ? "—" : total}
            </span>

            <span className="mt-1 text-[9px] text-[#65727a]">Activities</span>
          </div>
        </div>

        {/* Legend / state */}
        <div className="flex flex-1 flex-col gap-2">
          {error ? (
            <div>
              <p className="text-[11px] text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
                className="mt-1 text-[10px] text-white hover:text-[var(--primary)]"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <>
              <div className="h-3 w-full max-w-[170px] rounded bg-white/[0.04]" />
              <div className="h-3 w-full max-w-[150px] rounded bg-white/[0.04]" />
              <div className="h-3 w-full max-w-[160px] rounded bg-white/[0.04]" />
              <div className="h-3 w-full max-w-[140px] rounded bg-white/[0.04]" />
            </>
          ) : !hasData ? (
            <p className="text-[11px] text-[#59656d]">
              No activity during this period.
            </p>
          ) : (
            percentages.map((activity) => {
              const config = activityConfig[activity.type];

              const Icon = config.icon;

              return (
                <div key={activity.type} className="flex items-center gap-2">
                  <Icon size={12} className="text-[var(--primary)]" />

                  <span className="flex-1 text-[11px] text-[#8b969d]">
                    {config.label}
                  </span>

                  <span className="text-[11px] font-medium text-white">
                    {activity.count}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
