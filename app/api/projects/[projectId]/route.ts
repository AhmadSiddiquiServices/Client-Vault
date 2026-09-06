import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";
import Activity from "@/models/Activity";

const updateProjectSchema = z
  .object({
    client: z.string().trim().min(1, "Client is required").optional(),

    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(150, "Project name must not exceed 150 characters")
      .optional(),

    type: z
      .enum([
        "website",
        "shopify-store",
        "mobile-app",
        "api",
        "saas",
        "internal-system",
        "server",
        "other",
      ])
      .optional(),

    url: z
      .string()
      .trim()
      .max(500, "URL must not exceed 500 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, "Description must not exceed 5000 characters")
      .optional(),

    status: z.enum(["active", "inactive", "completed", "archived"]).optional(),

    notes: z
      .string()
      .trim()
      .max(5000, "Notes must not exceed 5000 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * GET /api/projects/[projectId]
 *
 * Returns one project with its related credentials
 * and recent activity.
 */
export async function GET(request: Request, context: RouteContext) {
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

    const { projectId } = await context.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /*
     * Fetch the project and verify ownership.
     */
    const project = await Project.findOne({
      _id: projectId,
      owner: user._id,
    })
      .populate("client", "_id name company")
      .lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Credentials attached to this project.
     *
     * A credential can belong to one or multiple projects,
     * so we query the projects array.
     */
    const credentials = await Credential.find({
      owner: user._id,
      client: project.client._id,
      projects: project._id,
    })
      .select(
        "_id name category projects tags isFavorite isShared username url createdAt updatedAt",
      )
      .populate("category", "_id name")
      .populate("tags", "_id name")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    /*
     * Project-specific activity.
     */
    const credentialIds = credentials.map((credential) => credential._id);

    const activityFilters: Record<string, unknown>[] = [
      {
        entity: "project",
        entityId: project._id,
      },
    ];

    if (credentialIds.length > 0) {
      activityFilters.push({
        entity: "credential",
        entityId: {
          $in: credentialIds,
        },
      });
    }

    const activity = await Activity.find({
      owner: user._id,
      $or: activityFilters,
    })
      .select("_id action entity entityId description createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    /*
     * Count all credentials attached to this project.
     */
    const credentialsCount = await Credential.countDocuments({
      owner: user._id,
      client: project.client._id,
      projects: project._id,
    });

    /*
     * Count unique categories used by the project's
     * credentials.
     */
    const categoryIds = new Set(
      credentials
        .map((credential) => {
          const category = credential.category as
            | { _id?: unknown }
            | null
            | undefined;

          return category?._id?.toString();
        })
        .filter(Boolean),
    );

    return NextResponse.json(
      {
        success: true,

        project,

        stats: {
          credentials: credentialsCount,
          categories: categoryIds.size,
        },

        credentials,

        activity,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/projects/[projectId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch project.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/projects/[projectId]
 */
export async function PATCH(request: Request, context: RouteContext) {
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

    const { projectId } = await context.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const { client: clientId, ...updateData } = result.data;

    /**
     * If client is being changed, verify that
     * the new client belongs to this user.
     */
    if (clientId) {
      if (!mongoose.isValidObjectId(clientId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid client ID.",
          },
          { status: 400 },
        );
      }

      const client = await Client.findOne({
        _id: clientId,
        owner: user._id,
      }).select("_id");

      if (!client) {
        return NextResponse.json(
          {
            success: false,
            message: "Client not found.",
          },
          { status: 404 },
        );
      }
    }

    // const update: Record<string, unknown> = {
    //   ...updateData,
    // };

    // if (clientId) {
    //   update.client = clientId;
    // }

    // const project = await Project.findOneAndUpdate(
    //   {
    //     _id: projectId,
    //     owner: user._id,
    //   },
    //   {
    //     $set: update,
    //   },
    //   {
    //     new: true,
    //     runValidators: true,
    //   },
    // )
    //   .populate("client", "name company")
    //   .lean();

    const setData: Record<string, unknown> = {};
    const unsetData: Record<string, 1> = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (value === undefined || value === "") {
        unsetData[key] = 1;
      } else {
        setData[key] = value;
      }
    }

    if (clientId) {
      setData.client = clientId;
    }

    const updateOperation: {
      $set?: Record<string, unknown>;
      $unset?: Record<string, 1>;
    } = {};

    if (Object.keys(setData).length > 0) {
      updateOperation.$set = setData;
    }

    if (Object.keys(unsetData).length > 0) {
      updateOperation.$unset = unsetData;
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        owner: user._id,
      },
      updateOperation,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("client", "name company")
      .lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully.",
        project,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/projects/[projectId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update project.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 *
 * Deletes the project and safely cleans up its
 * credential relationships.
 */
export async function DELETE(request: Request, context: RouteContext) {
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

    const { projectId } = await context.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid project ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const session = await mongoose.startSession();

    try {
      let deletedProjectName = "";

      await session.withTransaction(async () => {
        /**
         * Verify that the project belongs to
         * the authenticated user.
         */
        const project = await Project.findOne({
          _id: projectId,
          owner: user._id,
        })
          .select("_id name client")
          .session(session)
          .lean();

        if (!project) {
          throw new ProjectNotFoundError();
        }

        if (!project.client) {
          throw new Error("Project has no associated client.");
        }

        deletedProjectName = project.name;

        /**
         * Remove this project from every credential
         * that references it.
         */
        await Credential.updateMany(
          {
            owner: user._id,
            projects: project._id,
          },
          {
            $pull: {
              projects: project._id,
            },
          },
          { session },
        );

        /**
         * A non-shared credential that no longer belongs
         * to any project is now orphaned, so delete it.
         *
         * Shared credentials are intentionally preserved.
         */
        await Credential.deleteMany(
          {
            owner: user._id,
            client: project.client,
            projects: { $size: 0 },
            isShared: false,
          },
          { session },
        );

        /**
         * Remove activity specifically related to
         * this project.
         */
        await Activity.deleteMany(
          {
            owner: user._id,
            entity: "project",
            entityId: project._id,
          },
          { session },
        );

        /**
         * Delete the project.
         */
        await Project.deleteOne(
          {
            _id: project._id,
            owner: user._id,
          },
          { session },
        );
      });

      return NextResponse.json(
        {
          success: true,
          message: `Project "${deletedProjectName}" deleted successfully.`,
        },
        { status: 200 },
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found.",
        },
        { status: 404 },
      );
    }

    console.error("DELETE /api/projects/[projectId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete project.",
      },
      { status: 500 },
    );
  }
}

class ProjectNotFoundError extends Error {
  constructor() {
    super("Project not found.");
    this.name = "ProjectNotFoundError";
  }
}
