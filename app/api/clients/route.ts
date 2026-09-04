import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth/require-user";
import Client from "@/models/Client";

const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Client name is required")
    .max(150, "Client name must not exceed 150 characters"),

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

  status: z
    .enum(["active", "inactive", "archived"])
    .optional()
    .default("active"),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes must not exceed 5000 characters")
    .optional(),
});

/**
 * GET /api/clients
 * Returns clients belonging only to the authenticated user.
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
    const status = searchParams.get("status")?.trim() || "";

    const query: Record<string, unknown> = {
      owner: user._id,
    };

    /**
     * Optional status filtering.
     */
    if (status && ["active", "inactive", "archived"].includes(status)) {
      query.status = status;
    }

    /**
     * Basic client search.
     *
     * Searches across:
     * - name
     * - company
     * - contact person
     * - email
     */
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
      ];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        clients,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients
 *
 * Creates a new client for the authenticated user.
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

    const result = createClientSchema.safeParse(body);

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

    const client = await Client.create({
      ...result.data,
      owner: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully.",
        client,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create client.",
      },
      { status: 500 },
    );
  }
}

/**
 * Escape user input before using it inside RegExp.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
