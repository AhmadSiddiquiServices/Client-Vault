import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";

type Period = "this-year" | "last-year";

const VALID_PERIODS: Period[] = ["this-year", "last-year"];

export async function GET(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedPeriod = searchParams.get("period") || "this-year";

    const period: Period = VALID_PERIODS.includes(requestedPeriod as Period)
      ? (requestedPeriod as Period)
      : "this-year";

    const now = new Date();

    const startYear =
      period === "this-year" ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

    const startDate = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0, 0));

    const endDate = new Date(Date.UTC(startYear + 1, 0, 1, 0, 0, 0, 0));

    await connectToDatabase();

    const monthlyActivity = await Activity.aggregate([
      {
        $match: {
          owner: user._id,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const monthCounts = new Map<number, number>();

    for (const item of monthlyActivity) {
      monthCounts.set(item._id.month, item.count);
    }

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

    const data = months.map((month, index) => ({
      month,
      count: monthCounts.get(index + 1) ?? 0,
    }));

    return NextResponse.json(
      {
        success: true,
        period,
        year: startYear,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/dashboard/overview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch overview data.",
      },
      { status: 500 },
    );
  }
}
