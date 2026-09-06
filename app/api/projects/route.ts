import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import mongoose from "mongoose";

const createProjectSchema = z.object({
  client: z.string().trim().min(1, "Client is required"),

  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(150, "Project name must not exceed 150 characters"),

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
    .default("website"),

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

  status: z
    .enum(["active", "inactive", "completed", "archived"])
    .default("active"),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes must not exceed 5000 characters")
    .optional(),
});

/**
 * GET /api/projects
 * Returns projects belonging to the authenticated user.
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

    const search = searchParams.get("search")?.trim() || "";
    const clientId = searchParams.get("client")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";

    const query: Record<string, unknown> = {
      owner: user._id,
    };

    /*
     * Validate client ID before using it in MongoDB.
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

      query.client = clientId;
    }

    /*
     * Status filter.
     */
    if (
      status &&
      ["active", "inactive", "completed", "archived"].includes(status)
    ) {
      query.status = status;
    }

    /*
     * Project type filter.
     */
    if (
      type &&
      [
        "website",
        "shopify-store",
        "mobile-app",
        "api",
        "saas",
        "internal-system",
        "server",
        "other",
      ].includes(type)
    ) {
      query.type = type;
    }

    /*
     * Search project name and description.
     */
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const projects = await Project.find(query)
      .populate("client", "_id name company")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        projects,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects
 *
 * Creates a project for an existing client owned
 * by the authenticated user.
 */
export async function POST(request: Request) {
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

    const body = await request.json();

    const result = createProjectSchema.safeParse(body);

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

    const { client: clientId, ...projectData } = result.data;

    /**
     * Make sure the client belongs to the
     * authenticated user.
     */
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

    const project = await Project.create({
      ...projectData,
      owner: user._id,
      client: client._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("client", "name company")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        project: populatedProject,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project.",
      },
      { status: 500 },
    );
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
