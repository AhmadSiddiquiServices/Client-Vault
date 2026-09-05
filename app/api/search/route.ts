import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import Category from "@/models/Category";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";
import Tag from "@/models/Tag";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        success: true,
        query: "",
        results: {
          clients: [],
          projects: [],
          credentials: [],
          categories: [],
          tags: [],
        },
        total: 0,
      });
    }

    /**
     * Prevent unnecessarily expensive/unbounded searches.
     */
    const query = q.slice(0, 100);

    const regex = new RegExp(escapeRegex(query), "i");

    await connectToDatabase();

    /**
     * Run all independent searches in parallel.
     */
    const [clients, projects, credentials, categories, tags] =
      await Promise.all([
        /**
         * Clients
         */
        Client.find({
          owner: user._id,
          $or: [
            { name: regex },
            { company: regex },
            { contactPerson: regex },
            { email: regex },
          ],
        })
          .select("name company contactPerson email status updatedAt")
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),

        /**
         * Projects
         */
        Project.find({
          owner: user._id,
          $or: [{ name: regex }, { description: regex }],
        })
          .select("name type status client url updatedAt")
          .populate("client", "name company")
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),

        /**
         * Credentials
         *
         * IMPORTANT:
         * No secret/custom secret values are searched.
         */
        Credential.find({
          owner: user._id,
          $or: [
            { name: regex },
            { username: regex },
            { url: regex },
            { notes: regex },
          ],
        })
          .select(
            "name client projects category tags username url isFavorite isShared updatedAt",
          )
          .populate("client", "name company")
          .populate("projects", "name type")
          .populate("category", "name")
          .populate("tags", "name")
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),

        /**
         * Categories
         */
        Category.find({
          owner: user._id,
          name: regex,
        })
          .select("name description updatedAt")
          .sort({ name: 1 })
          .limit(5)
          .lean(),

        /**
         * Tags
         */
        Tag.find({
          owner: user._id,
          name: regex,
        })
          .select("name updatedAt")
          .sort({ name: 1 })
          .limit(5)
          .lean(),
      ]);

    const total =
      clients.length +
      projects.length +
      credentials.length +
      categories.length +
      tags.length;

    return NextResponse.json(
      {
        success: true,
        query,
        results: {
          clients,
          projects,
          credentials,
          categories,
          tags,
        },
        total,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform search.",
      },
      { status: 500 },
    );
  }
}
