import { FolderKanban, KeyRound, Users } from "lucide-react";

import { ActivityOverview } from "@/components/dashboard/ActivityOverview";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentCredentials } from "@/components/dashboard/RecentCredentials";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard
          title="Clients"
          value="24"
          change="+12%"
          description="vs last month"
          icon={Users}
          href="/clients"
        />

        <StatCard
          title="Projects"
          value="38"
          change="+8%"
          description="vs last month"
          icon={FolderKanban}
          href="/projects"
        />

        <StatCard
          title="Credentials"
          value="142"
          change="+18%"
          description="vs last month"
          icon={KeyRound}
          href="/credentials"
        />
      </div>

      {/* Overview + Recent Credentials */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.9fr)]">
        <OverviewChart />
        <RecentCredentials />
      </div>

      {/* Activity */}
      <div className="mt-3">
        <ActivityOverview />
      </div>
    </div>
  );
}
