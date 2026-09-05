import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";

type ActivityPeriod = "this-week" | "this-month" | "this-year";

const VALID_PERIODS: ActivityPeriod[] = [
  "this-week",
  "this-month",
  "this-year",
];

const ACTIVITY_TYPES = ["viewed", "created", "updated", "deleted"] as const;

function getPeriodStart(period: ActivityPeriod) {
  const now = new Date();

  switch (period) {
    case "this-week": {
      const date = new Date(now);

      const day = date.getUTCDay();

      const daysFromMonday = day === 0 ? 6 : day - 1;

      date.setUTCDate(date.getUTCDate() - daysFromMonday);

      date.setUTCHours(0, 0, 0, 0);

      return date;
    }

    case "this-month": {
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }

    case "this-year": {
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    }
  }
}

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

    const requestedPeriod = searchParams.get("period") || "this-week";

    const period: ActivityPeriod = VALID_PERIODS.includes(
      requestedPeriod as ActivityPeriod,
    )
      ? (requestedPeriod as ActivityPeriod)
      : "this-week";

    const startDate = getPeriodStart(period);

    const endDate = new Date();

    await connectToDatabase();

    const counts = await Activity.aggregate([
      {
        $match: {
          owner: user._id,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          action: {
            $in: ACTIVITY_TYPES,
          },
        },
      },
      {
        $group: {
          _id: "$action",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map<string, number>();

    for (const item of counts) {
      countMap.set(item._id, item.count);
    }

    const activities = ACTIVITY_TYPES.map((type) => ({
      type,
      count: countMap.get(type) ?? 0,
    }));

    const total = activities.reduce((sum, activity) => sum + activity.count, 0);

    return NextResponse.json(
      {
        success: true,
        period,
        total,
        activities,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/dashboard/activity error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch activity overview.",
      },
      { status: 500 },
    );
  }
}
