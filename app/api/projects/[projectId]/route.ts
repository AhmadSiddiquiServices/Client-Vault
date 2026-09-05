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

    const project = await Project.findOne({
      _id: projectId,
      owner: user._id,
    })
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
        project,
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

    const update: Record<string, unknown> = {
      ...updateData,
    };

    if (clientId) {
      update.client = clientId;
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        owner: user._id,
      },
      {
        $set: update,
      },
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
