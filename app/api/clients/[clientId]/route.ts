import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/models/Activity";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";

const updateClientSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Client name is required")
      .max(150, "Client name must not exceed 150 characters")
      .optional(),

    company: z
      .string()
      .trim()
      .max(150, "Company name must not exceed 150 characters")
      .optional(),

    contactPerson: z
      .string()
      .trim()
      .max(150, "Contact person must not exceed 150 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters")
      .optional(),

    phone: z
      .string()
      .trim()
      .max(50, "Phone number must not exceed 50 characters")
      .optional(),

    website: z
      .string()
      .trim()
      .max(500, "Website must not exceed 500 characters")
      .optional(),

    address: z
      .string()
      .trim()
      .max(500, "Address must not exceed 500 characters")
      .optional(),

    status: z.enum(["active", "inactive", "archived"]).optional(),

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
    clientId: string;
  }>;
}

/**
 * GET /api/clients/[clientId]
 *
 * Returns one client and its related overview data.
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

    const { clientId } = await context.params;

    if (!mongoose.isValidObjectId(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const client = await Client.findOne({
      _id: clientId,
      owner: user._id,
    }).lean();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Fetch projects and credentials first.
     */
    const [projects, credentials] = await Promise.all([
      Project.find({
        owner: user._id,
        client: client._id,
      })
        .select("_id name type status description url createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean(),

      Credential.find({
        owner: user._id,
        client: client._id,
      })
        .select(
          "_id name category projects tags isFavorite isShared url username createdAt updatedAt",
        )
        .populate("category", "_id name")
        .populate("projects", "_id name type")
        .populate("tags", "_id name")
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const projectIds = projects.map((project) => project._id);

    const credentialIds = credentials.map((credential) => credential._id);

    /*
     * Fetch activity related to this client,
     * its projects, and its credentials.
     */
    const activityFilters: Record<string, unknown>[] = [
      {
        entity: "client",
        entityId: client._id,
      },
    ];

    if (projectIds.length > 0) {
      activityFilters.push({
        entity: "project",
        entityId: {
          $in: projectIds,
        },
      });
    }

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
     * Count unique credential categories.
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

        client,

        stats: {
          projects: projects.length,
          credentials: await Credential.countDocuments({
            owner: user._id,
            client: client._id,
          }),
          categories: categoryIds.size,
        },

        projects,

        credentials,

        activity,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/clients/[clientId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch client.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/clients/[clientId]
 *
 * Updates one client belonging to the authenticated user.
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

    const { clientId } = await context.params;

    if (!mongoose.isValidObjectId(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateClientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const client = await Client.findOneAndUpdate(
      {
        _id: clientId,
        owner: user._id,
      },
      {
        $set: result.data,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Client updated successfully.",
        client,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/clients/[clientId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update client.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 *
 * Permanently deletes:
 * - Client
 * - All client projects
 * - All client credentials
 * - All related activity
 *
 * Everything happens inside one MongoDB transaction.
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

    const { clientId } = await context.params;

    if (!mongoose.isValidObjectId(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid client ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const session = await mongoose.startSession();

    try {
      let deletedClientName = "";

      await session.withTransaction(async () => {
        /**
         * Verify ownership.
         */
        const client = await Client.findOne({
          _id: clientId,
          owner: user._id,
        })
          .select("_id name")
          .session(session)
          .lean();

        if (!client) {
          throw new ClientNotFoundError();
        }

        deletedClientName = client.name;

        /**
         * Collect related project IDs before deletion.
         */
        const projects = await Project.find({
          owner: user._id,
          client: client._id,
        })
          .select("_id")
          .session(session)
          .lean();

        const projectIds = projects.map((project) => project._id);

        /**
         * Collect related credential IDs before deletion.
         */
        const credentials = await Credential.find({
          owner: user._id,
          client: client._id,
        })
          .select("_id")
          .session(session)
          .lean();

        const credentialIds = credentials.map((credential) => credential._id);

        /**
         * Delete related activity.
         */
        // await Activity.deleteMany(
        //   {
        //     owner: user._id,
        //     $or: [
        //       {
        //         entity: "client",
        //         entityId: client._id,
        //       },
        //       ...(projectIds.length > 0
        //         ? [
        //             {
        //               entity: "project",
        //               entityId: {
        //                 $in: projectIds,
        //               },
        //             },
        //           ]
        //         : []),
        //       ...(credentialIds.length > 0
        //         ? [
        //             {
        //               entity: "credential",
        //               entityId: {
        //                 $in: credentialIds,
        //               },
        //             },
        //           ]
        //         : []),
        //     ],
        //   },
        //   { session },
        // );
        /**
         * Delete activity related to the client itself.
         */
        await Activity.deleteMany({
          owner: user._id,
          entity: "client",
          entityId: client._id,
        }).session(session);

        /**
         * Delete activity related to the client's projects.
         */
        if (projectIds.length > 0) {
          await Activity.deleteMany({
            owner: user._id,
            entity: "project",
            entityId: {
              $in: projectIds,
            },
          }).session(session);
        }

        /**
         * Delete activity related to the client's credentials.
         */
        if (credentialIds.length > 0) {
          await Activity.deleteMany({
            owner: user._id,
            entity: "credential",
            entityId: {
              $in: credentialIds,
            },
          }).session(session);
        }

        /**
         * Delete all credentials belonging to the client.
         */
        await Credential.deleteMany(
          {
            owner: user._id,
            client: client._id,
          },
          { session },
        );

        /**
         * Delete all projects belonging to the client.
         */
        await Project.deleteMany(
          {
            owner: user._id,
            client: client._id,
          },
          { session },
        );

        /**
         * Finally delete the client.
         */
        await Client.deleteOne(
          {
            _id: client._id,
            owner: user._id,
          },
          { session },
        );
      });

      return NextResponse.json(
        {
          success: true,
          message: `Client "${deletedClientName}" deleted successfully.`,
        },
        { status: 200 },
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (error instanceof ClientNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        { status: 404 },
      );
    }

    console.error("DELETE /api/clients/[clientId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete client.",
      },
      { status: 500 },
    );
  }
}

class ClientNotFoundError extends Error {
  constructor() {
    super("Client not found.");
    this.name = "ClientNotFoundError";
  }
}
