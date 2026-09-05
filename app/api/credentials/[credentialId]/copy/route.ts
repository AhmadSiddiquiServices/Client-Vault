import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import { decryptSecret } from "@/lib/encryption";

import Activity from "@/models/Activity";
import Credential from "@/models/Credential";

const copySchema = z.object({
  type: z.enum(["secret", "customField"]),
  index: z.number().int().min(0).optional(),
});

interface RouteContext {
  params: Promise<{
    credentialId: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
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

    const result = copySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid copy request.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const credential = await Credential.findOne({
      _id: credentialId,
      owner: user._id,
    }).select("+secret +customFields name");

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Credential not found.",
        },
        { status: 404 },
      );
    }

    let value: string;

    if (result.data.type === "secret") {
      if (!credential.secret) {
        return NextResponse.json(
          {
            success: false,
            message: "This credential does not contain a secret.",
          },
          { status: 404 },
        );
      }

      value = decryptSecret(credential.secret);
    } else {
      const index = result.data.index;

      if (index === undefined) {
        return NextResponse.json(
          {
            success: false,
            message: "Custom field index is required.",
          },
          { status: 400 },
        );
      }

      const field = credential.customFields[index];

      if (!field) {
        return NextResponse.json(
          {
            success: false,
            message: "Custom field not found.",
          },
          { status: 404 },
        );
      }

      if (!field.isSecret) {
        return NextResponse.json(
          {
            success: false,
            message: "This custom field is not secret.",
          },
          { status: 400 },
        );
      }

      value = decryptSecret(field.value);
    }

    await Activity.create({
      owner: user._id,
      action: "copied",
      entity: "credential",
      entityId: credential._id,
      description: `Copied a secret from credential "${credential.name}"`,
      metadata: {
        type: result.data.type,
      },
    });

    return NextResponse.json(
      {
        success: true,
        value,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/credentials/[credentialId]/copy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to copy credential secret.",
      },
      { status: 500 },
    );
  }
}
