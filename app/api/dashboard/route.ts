import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import Activity from "@/models/Activity";
import Category from "@/models/Category";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";
import Tag from "@/models/Tag";

export const runtime = "nodejs";

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

    const ownerId = user._id;

    /*
     * ----------------------------------------
     * Dashboard counts
     * ----------------------------------------
     */
    const [clientCount, projectCount, credentialCount] = await Promise.all([
      Client.countDocuments({
        owner: ownerId,
      }),

      Project.countDocuments({
        owner: ownerId,
      }),

      Credential.countDocuments({
        owner: ownerId,
      }),
    ]);

    /*
     * ----------------------------------------
     * Recent Credentials
     *
     * Explicit model imports above ensure that
     * all populate targets are registered before
     * Mongoose attempts population.
     * ----------------------------------------
     */
    let recentCredentials;

    try {
      recentCredentials = await Credential.find({
        owner: ownerId,
      })
        .select(
          "name client projects category tags isFavorite isShared updatedAt createdAt",
        )
        .populate({
          path: "client",
          select: "name company",
          model: Client,
        })
        .populate({
          path: "projects",
          select: "name type status",
          model: Project,
        })
        .populate({
          path: "category",
          select: "name color",
          model: Category,
        })
        .populate({
          path: "tags",
          select: "name",
          model: Tag,
        })
        .sort({
          updatedAt: -1,
        })
        .limit(5)
        .lean();
    } catch (error) {
      console.error("Dashboard recent credentials query failed:", error);

      throw error;
    }

    /*
     * ----------------------------------------
     * Recent Activity
     * ----------------------------------------
     */
    let recentActivity;

    try {
      recentActivity = await Activity.find({
        owner: ownerId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();
    } catch (error) {
      console.error("Dashboard recent activity query failed:", error);

      throw error;
    }

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
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data.",
      },
      { status: 500 },
    );
  }
}
