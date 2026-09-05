import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import {
  ReferenceValidationError,
  validateCredentialReferences,
} from "@/lib/credentials/validate-references";
import { encryptSecret } from "@/lib/encryption";
import { sanitizeCredential } from "@/lib/credentials/sanitize";

import Activity from "@/models/Activity";
import Credential from "@/models/Credential";

const customFieldSchema = z.object({
  label: z.string().trim().min(1).max(100),

  value: z.string(),

  isSecret: z.boolean(),
});

const updateCredentialSchema = z
  .object({
    client: z.string().trim().min(1).optional(),

    projects: z.array(z.string().trim()).optional(),

    name: z.string().trim().min(1).max(150).optional(),

    category: z.string().trim().min(1).optional(),

    username: z.string().trim().max(255).optional(),

    secret: z.string().optional(),

    url: z.string().trim().max(500).optional(),

    customFields: z.array(customFieldSchema).optional(),

    tags: z.array(z.string().trim()).optional(),

    notes: z.string().trim().max(5000).optional(),

    isFavorite: z.boolean().optional(),

    isShared: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

interface RouteContext {
  params: Promise<{
    credentialId: string;
  }>;
}

/**
 * GET /api/credentials/[credentialId]
 *
 * Secret values are deliberately excluded.
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

    const { credentialId } = await context.params;

    if (!mongoose.isValidObjectId(credentialId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credential ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const credential = await Credential.findOne({
      _id: credentialId,
      owner: user._id,
    })
      .populate("client", "name company")
      .populate("projects", "name type status")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Credential not found.",
        },
        { status: 404 },
      );
    }

    await Activity.create({
      owner: user._id,
      action: "viewed",
      entity: "credential",
      entityId: credential._id,
      description: `Viewed credential "${credential.name}"`,
    });

    const safeCredential = sanitizeCredential(
      credential as unknown as Record<string, unknown>,
    );

    return NextResponse.json(
      {
        success: true,
        credential: safeCredential,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/credentials/[credentialId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch credential.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/credentials/[credentialId]
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

    const { credentialId } = await context.params;

    if (!mongoose.isValidObjectId(credentialId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credential ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateCredentialSchema.safeParse(body);

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

    const existingCredential = await Credential.findOne({
      _id: credentialId,
      owner: user._id,
    });

    if (!existingCredential) {
      return NextResponse.json(
        {
          success: false,
          message: "Credential not found.",
        },
        { status: 404 },
      );
    }

    const data = result.data;

    /**
     * Build final relationship values.
     */
    const finalClient = data.client ?? existingCredential.client.toString();

    const finalProjects =
      data.projects ?? existingCredential.projects.map((id) => id.toString());

    const finalCategory =
      data.category ?? existingCredential.category.toString();

    const finalTags =
      data.tags ?? existingCredential.tags.map((id) => id.toString());

    const finalIsShared = data.isShared ?? existingCredential.isShared;

    let references;

    try {
      references = await validateCredentialReferences({
        ownerId: user._id,
        clientId: finalClient,
        projectIds: finalProjects,
        categoryId: finalCategory,
        tagIds: finalTags,
        isShared: finalIsShared,
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

    const update: Record<string, unknown> = {
      client: references.client._id,
      projects: references.projectIds,
      category: references.category._id,
      tags: references.tagIds,
      isShared: finalIsShared,
    };

    if (data.name !== undefined) {
      update.name = data.name;
    }

    if (data.username !== undefined) {
      update.username = data.username;
    }

    if (data.url !== undefined) {
      update.url = data.url;
    }

    if (data.notes !== undefined) {
      update.notes = data.notes;
    }

    if (data.isFavorite !== undefined) {
      update.isFavorite = data.isFavorite;
    }

    /**
     * Encrypt a new credential secret only when
     * the field was explicitly supplied.
     */
    if (data.secret !== undefined) {
      update.secret =
        data.secret.length > 0 ? encryptSecret(data.secret) : undefined;
    }

    /**
     * Replace custom fields only when supplied.
     *
     * Secret custom field values are encrypted.
     */
    if (data.customFields !== undefined) {
      update.customFields = data.customFields.map((field) => ({
        label: field.label,
        value: field.isSecret ? encryptSecret(field.value) : field.value,
        isSecret: field.isSecret,
      }));
    }

    const credential = await Credential.findOneAndUpdate(
      {
        _id: credentialId,
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
      .populate("projects", "name type status")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Credential not found.",
        },
        { status: 404 },
      );
    }

    await Activity.create({
      owner: user._id,
      action: "updated",
      entity: "credential",
      entityId: credential._id,
      description: `Updated credential "${credential.name}"`,
    });

    const safeCredential = sanitizeCredential(
      credential as unknown as Record<string, unknown>,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Credential updated successfully.",
        credential: safeCredential,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/credentials/[credentialId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update credential.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/credentials/[credentialId]
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

    const { credentialId } = await context.params;

    if (!mongoose.isValidObjectId(credentialId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credential ID.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const credential = await Credential.findOne({
      _id: credentialId,
      owner: user._id,
    }).select("_id name");

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Credential not found.",
        },
        { status: 404 },
      );
    }

    await Credential.deleteOne({
      _id: credential._id,
      owner: user._id,
    });

    await Activity.create({
      owner: user._id,
      action: "deleted",
      entity: "credential",
      entityId: credential._id,
      description: `Deleted credential "${credential.name}"`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Credential deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/credentials/[credentialId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete credential.",
      },
      { status: 500 },
    );
  }
}
