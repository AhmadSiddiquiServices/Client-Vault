import { Eye, FilePlus2, Pencil, Trash2 } from "lucide-react";

const activities = [
  {
    label: "Viewed",
    count: 32,
    icon: Eye,
  },
  {
    label: "Created",
    count: 16,
    icon: FilePlus2,
  },
  {
    label: "Updated",
    count: 14,
    icon: Pencil,
  },
  {
    label: "Deleted",
    count: 6,
    icon: Trash2,
  },
];

export function ActivityOverview() {
  const total = activities.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-3">
        <h2 className="text-[14px] font-semibold text-white">
          Activity Overview
        </h2>

        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[11px] text-[#78858d] transition-colors hover:text-white"
        >
          This Week
        </button>
      </div>

      <div className="flex min-h-[112px] items-center gap-5 px-4 py-3">
        {/* Donut */}
        <div className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#00e676 0deg 190deg, #0cae60 190deg 275deg, #087c49 275deg 325deg, #15372a 325deg 360deg)",
            }}
          />

          <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-[#0d1318]">
            <span className="text-[20px] font-semibold leading-none text-white">
              {total}
            </span>

            <span className="mt-1 text-[9px] text-[#65727a]">
              Total Activities
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div key={activity.label} className="flex items-center gap-2">
                <Icon size={12} className="text-[var(--primary)]" />

                <span className="flex-1 text-[11px] text-[#8b969d]">
                  {activity.label}
                </span>

                <span className="text-[11px] font-medium text-white">
                  {activity.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
