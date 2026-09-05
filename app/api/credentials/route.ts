import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import {
  ReferenceValidationError,
  validateCredentialReferences,
} from "@/lib/credentials/validate-references";
import { encryptSecret } from "@/lib/encryption";

import Activity from "@/models/Activity";
import Credential from "@/models/Credential";
import { sanitizeCredential } from "@/lib/credentials/sanitize";

const customFieldSchema = z.object({
  label: z.string().trim().min(1).max(100),

  value: z.string(),

  isSecret: z.boolean().default(false),
});

const createCredentialSchema = z.object({
  client: z.string().trim().min(1),

  projects: z.array(z.string().trim()).default([]),

  name: z.string().trim().min(1).max(150),

  category: z.string().trim().min(1),

  username: z.string().trim().max(255).optional(),

  secret: z.string().optional(),

  url: z.string().trim().max(500).optional(),

  customFields: z.array(customFieldSchema).default([]),

  tags: z.array(z.string().trim()).default([]),

  notes: z.string().trim().max(5000).optional(),

  isFavorite: z.boolean().default(false),

  isShared: z.boolean().default(false),
});

/**
 * GET /api/credentials
 *
 * Supported filters:
 * - search
 * - client
 * - project
 * - category
 * - tag
 * - favorite
 * - shared
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

    const projectId = searchParams.get("project")?.trim() || "";

    const categoryId = searchParams.get("category")?.trim() || "";

    const tagId = searchParams.get("tag")?.trim() || "";

    const favorite = searchParams.get("favorite")?.trim();

    const shared = searchParams.get("shared")?.trim();

    const query: Record<string, unknown> = {
      owner: user._id,
    };

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

    if (projectId) {
      if (!mongoose.isValidObjectId(projectId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Project ID.",
          },
          { status: 400 },
        );
      }

      query.projects = projectId;
    }

    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Category ID.",
          },
          { status: 400 },
        );
      }

      query.category = categoryId;
    }

    if (tagId) {
      if (!mongoose.isValidObjectId(tagId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Tag ID.",
          },
          { status: 400 },
        );
      }

      query.tags = tagId;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (favorite === "false") {
      query.isFavorite = false;
    }

    if (shared === "true") {
      query.isShared = true;
    }

    if (shared === "false") {
      query.isShared = false;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { url: searchRegex },
        { notes: searchRegex },
      ];
    }

    const credentials = await Credential.find(query)
      .populate("client", "name company")
      .populate("projects", "name type status")
      .populate("category", "name")
      .populate("tags", "name")
      .sort({ updatedAt: -1 })
      .lean();

    const safeCredentials = credentials.map((credential) =>
      sanitizeCredential(credential as unknown as Record<string, unknown>),
    );

    return NextResponse.json(
      {
        success: true,
        credentials: safeCredentials,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/credentials error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch credentials.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/credentials
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

    const result = createCredentialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credential data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const data = result.data;

    let references;

    try {
      references = await validateCredentialReferences({
        ownerId: user._id,
        clientId: data.client,
        projectIds: data.projects,
        categoryId: data.category,
        tagIds: data.tags,
        isShared: data.isShared,
      });
    } catch (error) {
      if (error instanceof ReferenceValidationError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 400 },
        );
      }

      throw error;
    }

    const encryptedSecret =
      data.secret !== undefined && data.secret.length > 0
        ? encryptSecret(data.secret)
        : undefined;

    const encryptedCustomFields = data.customFields.map((field) => ({
      label: field.label,
      value: field.isSecret ? encryptSecret(field.value) : field.value,
      isSecret: field.isSecret,
    }));

    const credential = await Credential.create({
      owner: user._id,
      client: references.client._id,
      projects: references.projectIds,
      name: data.name,
      category: references.category._id,
      username: data.username,
      secret: encryptedSecret,
      url: data.url,
      customFields: encryptedCustomFields,
      tags: references.tagIds,
      notes: data.notes,
      isFavorite: data.isFavorite,
      isShared: data.isShared,
    });

    await Activity.create({
      owner: user._id,
      action: "created",
      entity: "credential",
      entityId: credential._id,
      description: `Created credential "${credential.name}"`,
      metadata: {
        clientId: credential.client,
      },
    });

    const populatedCredential = await Credential.findById(credential._id)
      .populate("client", "name company")
      .populate("projects", "name type status")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    const safeCredential = sanitizeCredential(
      populatedCredential as unknown as Record<string, unknown>,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Credential created successfully.",
        credential: safeCredential,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/credentials error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create credential.",
      },
      { status: 500 },
    );
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
