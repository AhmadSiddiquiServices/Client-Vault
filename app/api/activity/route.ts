import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import Activity from "@/models/Activity";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Credential from "@/models/Credential";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

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

type ValidAction = (typeof VALID_ACTIONS)[number];
type ValidEntity = (typeof VALID_ENTITIES)[number];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getUserInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "User";

  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * GET /api/activity
 *
 * Supported query parameters:
 *
 * - action
 * - entity
 * - entityId
 * - search
 * - page
 * - limit
 *
 * Examples:
 *
 * /api/activity
 * /api/activity?action=copied
 * /api/activity?entity=credential
 * /api/activity?entity=credential&entityId=...
 * /api/activity?search=SquareSpace
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

    const action = searchParams.get("action")?.trim() || "";
    const entity = searchParams.get("entity")?.trim() || "";
    const entityId = searchParams.get("entityId")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

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
     * ----------------------------------------
     * Action filter
     * ----------------------------------------
     */
    if (action && VALID_ACTIONS.includes(action as ValidAction)) {
      query.action = action;
    }

    /**
     * ----------------------------------------
     * Entity filter
     * ----------------------------------------
     */
    if (entity && VALID_ENTITIES.includes(entity as ValidEntity)) {
      query.entity = entity;
    }

    /**
     * ----------------------------------------
     * Specific entity ID filter
     * ----------------------------------------
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

    /**
     * ----------------------------------------
     * Resource-name search
     *
     * Activity stores entityId, not resourceName.
     * So we first find matching resource IDs.
     * ----------------------------------------
     */
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const [
        matchingClients,
        matchingProjects,
        matchingCredentials,
        matchingCategories,
        matchingTags,
      ] = await Promise.all([
        Client.find({
          owner: user._id,
          $or: [{ name: regex }, { company: regex }, { email: regex }],
        })
          .select("_id")
          .lean(),

        Project.find({
          owner: user._id,
          $or: [{ name: regex }, { description: regex }],
        })
          .select("_id")
          .lean(),

        Credential.find({
          owner: user._id,
          $or: [{ name: regex }, { username: regex }, { notes: regex }],
        })
          .select("_id")
          .lean(),

        Category.find({
          owner: user._id,
          $or: [{ name: regex }, { description: regex }],
        })
          .select("_id")
          .lean(),

        Tag.find({
          owner: user._id,
          name: regex,
        })
          .select("_id")
          .lean(),
      ]);

      const searchOr: Record<string, unknown>[] = [
        {
          description: regex,
        },
        {
          action: regex,
        },
        {
          entity: regex,
        },
      ];

      if (matchingClients.length > 0) {
        searchOr.push({
          entity: "client",
          entityId: {
            $in: matchingClients.map((item) => item._id),
          },
        });
      }

      if (matchingProjects.length > 0) {
        searchOr.push({
          entity: "project",
          entityId: {
            $in: matchingProjects.map((item) => item._id),
          },
        });
      }

      if (matchingCredentials.length > 0) {
        searchOr.push({
          entity: "credential",
          entityId: {
            $in: matchingCredentials.map((item) => item._id),
          },
        });
      }

      if (matchingCategories.length > 0) {
        searchOr.push({
          entity: "category",
          entityId: {
            $in: matchingCategories.map((item) => item._id),
          },
        });
      }

      if (matchingTags.length > 0) {
        searchOr.push({
          entity: "tag",
          entityId: {
            $in: matchingTags.map((item) => item._id),
          },
        });
      }

      query.$or = searchOr;
    }

    /**
     * ----------------------------------------
     * Today boundaries
     * ----------------------------------------
     */
    const todayStart = new Date();

    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);

    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    /**
     * ----------------------------------------
     * Main activity + summary queries
     * ----------------------------------------
     *
     * Summary is intentionally based on the full
     * activity collection rather than the current
     * paginated page.
     */
    const [activities, total, todayCount, credentialCount, securityCount] =
      await Promise.all([
        Activity.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Activity.countDocuments(query),

        Activity.countDocuments({
          owner: user._id,
          createdAt: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        }),

        Activity.countDocuments({
          owner: user._id,
          entity: "credential",
        }),

        Activity.countDocuments({
          owner: user._id,
          action: {
            $in: ["viewed", "copied", "deleted"],
          },
        }),
      ]);

    /**
     * ----------------------------------------
     * Resolve resource names
     * ----------------------------------------
     */
    const clientIds = activities
      .filter((item) => item.entity === "client")
      .map((item) => item.entityId);

    const projectIds = activities
      .filter((item) => item.entity === "project")
      .map((item) => item.entityId);

    const credentialIds = activities
      .filter((item) => item.entity === "credential")
      .map((item) => item.entityId);

    const categoryIds = activities
      .filter((item) => item.entity === "category")
      .map((item) => item.entityId);

    const tagIds = activities
      .filter((item) => item.entity === "tag")
      .map((item) => item.entityId);

    const [clients, projects, credentials, categories, tags] =
      await Promise.all([
        clientIds.length > 0
          ? Client.find({
              owner: user._id,
              _id: {
                $in: clientIds,
              },
            })
              .select("_id name")
              .lean()
          : [],

        projectIds.length > 0
          ? Project.find({
              owner: user._id,
              _id: {
                $in: projectIds,
              },
            })
              .select("_id name")
              .lean()
          : [],

        credentialIds.length > 0
          ? Credential.find({
              owner: user._id,
              _id: {
                $in: credentialIds,
              },
            })
              .select("_id name")
              .lean()
          : [],

        categoryIds.length > 0
          ? Category.find({
              owner: user._id,
              _id: {
                $in: categoryIds,
              },
            })
              .select("_id name")
              .lean()
          : [],

        tagIds.length > 0
          ? Tag.find({
              owner: user._id,
              _id: {
                $in: tagIds,
              },
            })
              .select("_id name")
              .lean()
          : [],
      ]);

    const resourceNameMap = new Map<string, string>();

    clients.forEach((item) => {
      resourceNameMap.set(`client:${String(item._id)}`, item.name);
    });

    projects.forEach((item) => {
      resourceNameMap.set(`project:${String(item._id)}`, item.name);
    });

    credentials.forEach((item) => {
      resourceNameMap.set(`credential:${String(item._id)}`, item.name);
    });

    categories.forEach((item) => {
      resourceNameMap.set(`category:${String(item._id)}`, item.name);
    });

    tags.forEach((item) => {
      resourceNameMap.set(`tag:${String(item._id)}`, item.name);
    });

    /**
     * ----------------------------------------
     * Format activities for frontend
     * ----------------------------------------
     */
    const actor = {
      name: user.name || user.email || "User",
      initials: getUserInitials(user.name, user.email),
    };

    const formattedActivities = activities.map((item) => {
      const currentEntity = item.entity as ValidEntity;
      const currentEntityId = String(item.entityId);

      return {
        _id: String(item._id),
        action: item.action,
        entity: currentEntity,
        entityId: currentEntityId,

        resourceName:
          resourceNameMap.get(`${currentEntity}:${currentEntityId}`) ||
          "Deleted resource",

        description: item.description || `${item.action} ${currentEntity}.`,

        metadata: item.metadata ?? {},

        actor,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,

        activities: formattedActivities,

        pagination: {
          page,
          limit,
          total,
          totalPages,

          hasNextPage: totalPages > 0 && page < totalPages,

          hasPreviousPage: page > 1,
        },

        summary: {
          today: todayCount,
          credential: credentialCount,
          security: securityCount,
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
