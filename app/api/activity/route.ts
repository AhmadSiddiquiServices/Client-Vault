import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";

const VALID_ACTIONS = [
  "created",
  "updated",
  "deleted",
  "viewed",
  "copied",
  "archived",
  "restored",
] as const;

const VALID_ENTITIES = [
  "client",
  "project",
  "credential",
  "category",
  "tag",
] as const;

/**
 * GET /api/activity
 *
 * Supported query parameters:
 *
 * - action
 * - entity
 * - entityId
 * - page
 * - limit
 *
 * Examples:
 *
 * /api/activity
 * /api/activity?action=copied
 * /api/activity?entity=credential
 * /api/activity?entity=credential&entityId=...
 * /api/activity?page=2&limit=20
 */
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

    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const action = searchParams.get("action")?.trim();

    const entity = searchParams.get("entity")?.trim();

    const entityId = searchParams.get("entityId")?.trim();

    const requestedPage = Number(searchParams.get("page") || "1");

    const requestedLimit = Number(searchParams.get("limit") || "20");

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 20;

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      owner: user._id,
    };

    /**
     * Action filter.
     */
    if (
      action &&
      VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])
    ) {
      query.action = action;
    }

    /**
     * Entity filter.
     */
    if (
      entity &&
      VALID_ENTITIES.includes(entity as (typeof VALID_ENTITIES)[number])
    ) {
      query.entity = entity;
    }

    /**
     * Specific entity ID filter.
     */
    if (entityId) {
      if (!mongoose.isValidObjectId(entityId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid entity ID.",
          },
          { status: 400 },
        );
      }

      query.entityId = entityId;
    }

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Activity.countDocuments(query),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: totalPages > 0 && page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/activity error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch activity.",
      },
      { status: 500 },
    );
  }
}
