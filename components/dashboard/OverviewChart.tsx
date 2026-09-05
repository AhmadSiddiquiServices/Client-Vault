"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface OverviewPoint {
  month: string;
  count: number;
}

type Period = "this-year" | "last-year";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function OverviewChart() {
  const [period, setPeriod] = useState<Period>("this-year");

  const [data, setData] = useState<OverviewPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOverview() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/dashboard/overview?period=${period}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load overview.");
        }

        if (!cancelled) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Overview fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load overview.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const width = 700;
  const height = 220;

  const counts = data.map((item) => item.count);

  const rawMax = Math.max(...counts, 0);

  const max = rawMax === 0 ? 10 : Math.max(5, Math.ceil(rawMax / 5) * 5);

  const min = 0;

  const coordinates = data.map((item, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * width : width / 2;

    const y = height - ((item.count - min) / (max - min)) * height;

    return {
      x,
      y,
      count: item.count,
      month: item.month,
    };
  });

  const linePath =
    coordinates.length > 0
      ? coordinates
          .map((point, index) => {
            return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
          })
          .join(" ")
      : "";

  const areaPath = linePath
    ? `${linePath} L ${width} ${height} L 0 ${height} Z`
    : "";

  const selectedLabel = period === "this-year" ? "This Year" : "Last Year";

  const tooltipPoint =
    coordinates.length > 0
      ? coordinates.reduce((closest, point) =>
          Math.abs(point.x - width * 0.59) < Math.abs(closest.x - width * 0.59)
            ? point
            : closest,
        )
      : null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-3">
        <div>
          <h2 className="text-[14px] font-semibold text-white">Overview</h2>

          <p className="mt-0.5 text-[10px] text-[#59656d]">
            Activity throughout the year
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setPeriod((current) =>
              current === "this-year" ? "last-year" : "this-year",
            )
          }
          className="flex h-8 items-center gap-1 rounded-md border border-[var(--border)] bg-white/[0.02] px-2.5 text-[11px] text-[#8b969d] transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          {selectedLabel}
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="p-3.5">
        {error ? (
          <div className="flex h-[190px] items-center justify-center text-[11px] text-red-400">
            {error}
          </div>
        ) : loading ? (
          <div className="flex h-[190px] items-center justify-center text-[11px] text-[#59656d]">
            Loading overview...
          </div>
        ) : (
          <div className="relative h-[190px] w-full">
            {/* Grid */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {[max, max * 0.75, max * 0.5, max * 0.25, 0].map(
                (value, index) => {
                  const gridValue = Math.round(value);

                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-[10px] text-[#59656d]">
                        {gridValue}
                      </span>

                      <div className="h-px flex-1 bg-white/[0.045]" />
                    </div>
                  );
                },
              )}
            </div>

            {/* Chart */}
            <div className="absolute left-10 right-0 top-0 h-[165px] overflow-hidden">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity="0.18" />

                    <stop offset="100%" stopColor="#00e676" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {areaPath && <path d={areaPath} fill="url(#chart-fill)" />}

                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#00e676"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {coordinates.map((point) => (
                  <circle
                    key={point.month}
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill="#080d11"
                    stroke="#00e676"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>

              {/* Tooltip */}
              {tooltipPoint && (
                <div
                  className="absolute rounded-md border border-[var(--border)] bg-[#131a20] px-2.5 py-1.5 shadow-xl"
                  style={{
                    left: `${(tooltipPoint.x / width) * 100}%`,
                    top: `${Math.max(
                      5,
                      (tooltipPoint.y / height) * 100 - 18,
                    )}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <p className="text-[9px] text-[#78858d]">
                    {tooltipPoint.month}
                  </p>

                  <p className="mt-0.5 text-[12px] font-semibold text-white">
                    {tooltipPoint.count}{" "}
                    {tooltipPoint.count === 1 ? "activity" : "activities"}
                  </p>
                </div>
              )}
            </div>

            {/* Months */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between">
              {months.map((month) => (
                <span key={month} className="text-[10px] text-[#59656d]">
                  {month}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
