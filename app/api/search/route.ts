import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";

import Category from "@/models/Category";
import Client from "@/models/Client";
import Credential from "@/models/Credential";
import Project from "@/models/Project";
import Tag from "@/models/Tag";

type PopulatedSearchProject = {
  _id: mongoose.Types.ObjectId;
  name: string;
  type?: string;
  status?: string;
  url?: string;
  updatedAt: Date;
  client: {
    _id: mongoose.Types.ObjectId;
    name: string;
    company?: string;
  } | null;
};

type PopulatedSearchCredential = {
  _id: mongoose.Types.ObjectId;
  name: string;
  username?: string;
  url?: string;
  isFavorite: boolean;
  isShared: boolean;
  updatedAt: Date;

  client: {
    _id: mongoose.Types.ObjectId;
    name: string;
    company?: string;
  } | null;

  projects: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    type?: string;
  }>;

  category: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;

  tags: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
  }>;
};

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

    const rawQuery = searchParams.get("q")?.trim() || "";

    if (!rawQuery) {
      return NextResponse.json(
        {
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
        },
        { status: 200 },
      );
    }

    /*
     * Keep the query bounded.
     */
    const query = rawQuery.slice(0, 100);

    const regex = new RegExp(escapeRegex(query), "i");

    await connectToDatabase();

    /*
     * ------------------------------------------------
     * First resolve related records.
     *
     * This allows credential searches to match things
     * like:
     *
     * "GumJoy"
     * "Shopify"
     * "Production"
     *
     * even when those values live in referenced
     * collections.
     * ------------------------------------------------
     */

    const [
      matchingClients,
      matchingProjects,
      matchingCategories,
      matchingTags,
    ] = await Promise.all([
      Client.find({
        owner: user._id,
        $or: [
          { name: regex },
          { company: regex },
          { contactPerson: regex },
          { email: regex },
        ],
      })
        .select("_id")
        .limit(20)
        .lean(),

      Project.find({
        owner: user._id,
        $or: [{ name: regex }, { description: regex }, { type: regex }],
      })
        .select("_id")
        .limit(20)
        .lean(),

      Category.find({
        owner: user._id,
        $or: [{ name: regex }, { description: regex }],
      })
        .select("_id")
        .limit(20)
        .lean(),

      Tag.find({
        owner: user._id,
        name: regex,
      })
        .select("_id")
        .limit(20)
        .lean(),
    ]);

    /*
     * ------------------------------------------------
     * Run actual result searches in parallel.
     * ------------------------------------------------
     */

    const [clients, projects, credentials, categories, tags] =
      await Promise.all([
        /*
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

        /*
         * Projects
         */
        Project.find({
          owner: user._id,
          $or: [{ name: regex }, { description: regex }, { type: regex }],
        })
          .select("name type status client url updatedAt")
          .populate("client", "name company")
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),

        /*
         * Credentials
         *
         * IMPORTANT:
         *
         * Never search or return:
         * - secret
         * - custom secret values
         */
        Credential.find({
          owner: user._id,
          $or: [
            /*
             * Direct credential fields.
             */
            { name: regex },
            { username: regex },
            { url: regex },
            { notes: regex },

            /*
             * Credential belongs to a matching client.
             */
            ...(matchingClients.length > 0
              ? [
                  {
                    client: {
                      $in: matchingClients.map((item) => item._id),
                    },
                  },
                ]
              : []),

            /*
             * Credential belongs to a matching project.
             */
            ...(matchingProjects.length > 0
              ? [
                  {
                    projects: {
                      $in: matchingProjects.map((item) => item._id),
                    },
                  },
                ]
              : []),

            /*
             * Credential uses a matching category.
             */
            ...(matchingCategories.length > 0
              ? [
                  {
                    category: {
                      $in: matchingCategories.map((item) => item._id),
                    },
                  },
                ]
              : []),

            /*
             * Credential uses a matching tag.
             */
            ...(matchingTags.length > 0
              ? [
                  {
                    tags: {
                      $in: matchingTags.map((item) => item._id),
                    },
                  },
                ]
              : []),
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

        /*
         * Categories
         */
        Category.find({
          owner: user._id,
          $or: [{ name: regex }, { description: regex }],
        })
          .select("name description color updatedAt")
          .sort({ name: 1 })
          .limit(5)
          .lean(),

        /*
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

    /*
     * ------------------------------------------------
     * Convert results into a clean frontend shape.
     * ------------------------------------------------
     */

    const safeClients = clients.map((client) => ({
      _id: String(client._id),
      name: client.name,
      company: client.company ?? "",
      contactPerson: client.contactPerson ?? "",
      email: client.email ?? "",
      status: client.status,
      updatedAt: client.updatedAt,
    }));

    const safeProjects = (projects as unknown as PopulatedSearchProject[]).map(
      (project) => ({
        _id: String(project._id),
        name: project.name,
        type: project.type,
        status: project.status,
        url: project.url ?? "",
        client: project.client
          ? {
              _id: String(project.client._id),
              name: project.client.name,
              company: project.client.company ?? "",
            }
          : null,
        updatedAt: project.updatedAt,
      }),
    );

    const safeCredentials = (
      credentials as unknown as PopulatedSearchCredential[]
    ).map((credential) => ({
      _id: String(credential._id),

      name: credential.name,

      username: credential.username ?? "",

      url: credential.url ?? "",

      isFavorite: Boolean(credential.isFavorite),

      isShared: Boolean(credential.isShared),

      client: credential.client
        ? {
            _id: String(credential.client._id),
            name: credential.client.name,
            company: credential.client.company ?? "",
          }
        : null,

      projects: Array.isArray(credential.projects)
        ? credential.projects.map((project) => ({
            _id: String(project._id),
            name: project.name,
            type: project.type,
          }))
        : [],

      category: credential.category
        ? {
            _id: String(credential.category._id),
            name: credential.category.name,
          }
        : null,

      tags: Array.isArray(credential.tags)
        ? credential.tags.map((tag) => ({
            _id: String(tag._id),
            name: tag.name,
          }))
        : [],

      updatedAt: credential.updatedAt,
    }));

    const safeCategories = categories.map((category) => ({
      _id: String(category._id),
      name: category.name,
      description: category.description ?? "",
      color: category.color ?? "#00e676",
      updatedAt: category.updatedAt,
    }));

    const safeTags = tags.map((tag) => ({
      _id: String(tag._id),
      name: tag.name,
      updatedAt: tag.updatedAt,
    }));

    const total =
      safeClients.length +
      safeProjects.length +
      safeCredentials.length +
      safeCategories.length +
      safeTags.length;

    return NextResponse.json(
      {
        success: true,

        query,

        results: {
          clients: safeClients,
          projects: safeProjects,
          credentials: safeCredentials,
          categories: safeCategories,
          tags: safeTags,
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
