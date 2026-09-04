"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const points = [
  12, 17, 16, 20, 19, 24, 23, 35, 32, 28, 31, 40, 38, 34, 42, 39, 46, 45, 48,
  46, 51, 50, 55, 62,
];

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
  const [period, setPeriod] = useState("This Year");

  const width = 700;
  const height = 220;

  const max = 65;
  const min = 0;

  const coordinates = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / (max - min)) * height;

    return { x, y };
  });

  const linePath = coordinates
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-3">
        <h2 className="text-[14px] font-semibold text-white">Overview</h2>

        <button
          type="button"
          onClick={() =>
            setPeriod(period === "This Year" ? "Last Year" : "This Year")
          }
          className="flex h-8 items-center gap-1 rounded-md border border-[var(--border)] bg-white/[0.02] px-2.5 text-[11px] text-[#8b969d] transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          {period}
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="p-3.5">
        <div className="relative h-[190px] w-full">
          {/* Grid */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[60, 45, 30, 15, 0].map((value) => (
              <div key={value} className="flex items-center gap-2">
                <span className="w-8 text-[10px] text-[#59656d]">
                  ${value}k
                </span>

                <div className="h-px flex-1 bg-white/[0.045]" />
              </div>
            ))}
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

              <path d={areaPath} fill="url(#chart-fill)" />

              <path
                d={linePath}
                fill="none"
                stroke="#00e676"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {coordinates.map((point, index) => (
                <circle
                  key={index}
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
            <div className="absolute left-[59%] top-[24%] rounded-md border border-[var(--border)] bg-[#131a20] px-2.5 py-1.5 shadow-xl">
              <p className="text-[9px] text-[#78858d]">Aug 2026</p>

              <p className="mt-0.5 text-[12px] font-semibold text-white">
                $42,300
              </p>
            </div>
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
      </div>
    </div>
  );
}
