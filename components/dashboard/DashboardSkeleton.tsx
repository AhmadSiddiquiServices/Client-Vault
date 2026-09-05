export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse">
      {/* Header */}
      <div className="mb-5">
        <div className="h-7 w-32 rounded-md bg-white/[0.05]" />
        <div className="mt-2.5 h-3 w-64 rounded bg-white/[0.04]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[112px] rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5"
          >
            <div className="flex justify-between">
              <div>
                <div className="h-3 w-16 rounded bg-white/[0.05]" />
                <div className="mt-3 h-7 w-14 rounded bg-white/[0.06]" />
              </div>

              <div className="h-9 w-9 rounded-lg bg-white/[0.05]" />
            </div>

            <div className="mt-3 h-3 w-24 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.9fr)]">
        <div className="h-[290px] rounded-xl border border-[var(--border)] bg-[var(--card)]" />

        <div className="h-[290px] rounded-xl border border-[var(--border)] bg-[var(--card)]" />
      </div>

      {/* Activity */}
      <div className="mt-3 h-[150px] rounded-xl border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}
