import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import Activity from "@/models/Activity";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";

export async function GET() {
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

    await connectToDatabase();

    /**
     * Run independent dashboard queries in parallel.
     */
    const [
      clientCount,
      projectCount,
      credentialCount,
      recentCredentials,
      recentActivity,
    ] = await Promise.all([
      /**
       * Total clients.
       */
      Client.countDocuments({
        owner: user._id,
      }),

      /**
       * Total projects.
       */
      Project.countDocuments({
        owner: user._id,
      }),

      /**
       * Total credentials.
       */
      Credential.countDocuments({
        owner: user._id,
      }),

      /**
       * Most recently updated credentials.
       *
       * Secret is excluded automatically because
       * Credential.secret has select:false.
       */
      Credential.find({
        owner: user._id,
      })
        .select(
          "name client projects category tags isFavorite isShared updatedAt createdAt",
        )
        .populate("client", "name company")
        .populate("projects", "name type")
        .populate("category", "name")
        .populate("tags", "name")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),

      /**
       * Most recent activity.
       */
      Activity.find({
        owner: user._id,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,

        stats: {
          clients: clientCount,
          projects: projectCount,
          credentials: credentialCount,
        },

        recentCredentials,

        recentActivity,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data.",
      },
      { status: 500 },
    );
  }
}
