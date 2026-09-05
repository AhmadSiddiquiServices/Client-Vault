"use client";

import { useEffect, useState } from "react";
import { FolderKanban, KeyRound, Users } from "lucide-react";

import { ActivityOverview } from "@/components/dashboard/ActivityOverview";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentCredentials } from "@/components/dashboard/RecentCredentials";
import { StatCard } from "@/components/dashboard/StatCard";
import type { DashboardResponse } from "@/types/dashboard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load dashboard.");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
          Dashboard
        </h1>

        <p className="mt-1.5 text-[12px] text-[var(--muted)]">
          Welcome back, Ahmad! Here&apos;s what&apos;s happening with your
          vault.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3">
          <p className="text-[12px] text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 text-[11px] font-medium text-white transition hover:text-[var(--primary)]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard
          title="Clients"
          value={data?.stats.clients.toString() ?? "—"}
          icon={Users}
          href="/clients"
        />

        <StatCard
          title="Projects"
          value={data?.stats.projects.toString() ?? "—"}
          icon={FolderKanban}
          href="/projects"
        />

        <StatCard
          title="Credentials"
          value={data?.stats.credentials.toString() ?? "—"}
          icon={KeyRound}
          href="/credentials"
        />
      </div>

      {/* Overview + Recent Credentials */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.9fr)]">
        <OverviewChart />

        <RecentCredentials credentials={data?.recentCredentials ?? []} />
      </div>

      {/* Activity */}
      <div className="mt-3">
        <ActivityOverview />
      </div>
    </div>
  );
}
