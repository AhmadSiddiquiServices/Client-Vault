import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/models/Client";

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
 * Returns one client belonging to the authenticated user.
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

    return NextResponse.json(
      {
        success: true,
        client,
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
 * Permanently deletes one client belonging to the authenticated user.
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

    const client = await Client.findOneAndDelete({
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

    return NextResponse.json(
      {
        success: true,
        message: "Client deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
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
