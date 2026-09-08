import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_SETTINGS } from "@/lib/settings/default-settings";
import Settings from "@/models/Settings";

export const runtime = "nodejs";

/**
 * Settings update schema.
 *
 * Every property is optional because PATCH should only
 * update the settings that were actually changed.
 */
const updateSettingsSchema = z
  .object({
    security: z
      .object({
        twoFactorEnabled: z.boolean().optional(),
      })
      .optional(),

    notifications: z
      .object({
        renewalReminders: z.boolean().optional(),
        securityAlerts: z.boolean().optional(),
        activityNotifications: z.boolean().optional(),
      })
      .optional(),

    appearance: z
      .object({
        theme: z.enum(["dark", "light", "system"]).optional(),
        compactInterface: z.boolean().optional(),
        animations: z.boolean().optional(),
      })
      .optional(),

    vault: z
      .object({
        automaticLock: z.boolean().optional(),
        sessionTimeout: z
          .union([z.literal(15), z.literal(30), z.literal(60), z.literal(120)])
          .optional(),
      })
      .optional(),
  })
  .strict();

/**
 * Safe frontend response.
 *
 * The user relationship is intentionally not returned because
 * the authenticated user already owns the settings.
 */
function serializeSettings(settings: {
  _id: unknown;

  security: {
    twoFactorEnabled: boolean;
  };

  notifications: {
    renewalReminders: boolean;
    securityAlerts: boolean;
    activityNotifications: boolean;
  };

  appearance: {
    theme: "dark" | "light" | "system";
    compactInterface: boolean;
    animations: boolean;
  };

  vault: {
    automaticLock: boolean;
    sessionTimeout: 15 | 30 | 60 | 120;
  };

  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: String(settings._id),

    security: {
      twoFactorEnabled: settings.security.twoFactorEnabled,
    },

    notifications: {
      renewalReminders: settings.notifications.renewalReminders,
      securityAlerts: settings.notifications.securityAlerts,
      activityNotifications: settings.notifications.activityNotifications,
    },

    appearance: {
      theme: settings.appearance.theme,
      compactInterface: settings.appearance.compactInterface,
      animations: settings.appearance.animations,
    },

    vault: {
      automaticLock: settings.vault.automaticLock,
      sessionTimeout: settings.vault.sessionTimeout,
    },

    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

/**
 * GET /api/settings
 *
 * Returns the authenticated user's settings.
 *
 * Also safely initializes settings for an existing user
 * who was created before the Settings model was introduced.
 */
export async function GET() {
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

    const settings = await Settings.findOneAndUpdate(
      {
        user: user._id,
      },
      {
        $setOnInsert: {
          user: user._id,
          ...DEFAULT_SETTINGS,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return NextResponse.json(
      {
        success: true,
        settings: serializeSettings(
          settings as unknown as Parameters<typeof serializeSettings>[0],
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/settings
 *
 * Updates only the settings supplied in the request body.
 */
export async function PATCH(request: Request) {
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

    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid settings data.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    /**
     * Build field-level updates.
     *
     * Only the supplied settings are changed.
     * Other settings remain untouched.
     */
    const updates: Record<string, unknown> = {};

    if (result.data.security?.twoFactorEnabled !== undefined) {
      updates["security.twoFactorEnabled"] =
        result.data.security.twoFactorEnabled;
    }

    if (result.data.notifications?.renewalReminders !== undefined) {
      updates["notifications.renewalReminders"] =
        result.data.notifications.renewalReminders;
    }

    if (result.data.notifications?.securityAlerts !== undefined) {
      updates["notifications.securityAlerts"] =
        result.data.notifications.securityAlerts;
    }

    if (result.data.notifications?.activityNotifications !== undefined) {
      updates["notifications.activityNotifications"] =
        result.data.notifications.activityNotifications;
    }

    if (result.data.appearance?.theme !== undefined) {
      updates["appearance.theme"] = result.data.appearance.theme;
    }

    if (result.data.appearance?.compactInterface !== undefined) {
      updates["appearance.compactInterface"] =
        result.data.appearance.compactInterface;
    }

    if (result.data.appearance?.animations !== undefined) {
      updates["appearance.animations"] = result.data.appearance.animations;
    }

    if (result.data.vault?.automaticLock !== undefined) {
      updates["vault.automaticLock"] = result.data.vault.automaticLock;
    }

    if (result.data.vault?.sessionTimeout !== undefined) {
      updates["vault.sessionTimeout"] = result.data.vault.sessionTimeout;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No settings changes were provided.",
        },
        { status: 400 },
      );
    }

    /**
     * Make sure the Settings document exists.
     *
     * This handles existing users that were created
     * before the Settings model was introduced.
     */
    let settings = await Settings.findOne({
      user: user._id,
    });

    if (!settings) {
      settings = await Settings.create({
        user: user._id,
        ...DEFAULT_SETTINGS,
      });
    }

    /**
     * Now perform a normal field-level update.
     *
     * No $setOnInsert here, so there is no conflict between
     * "security" and "security.twoFactorEnabled".
     */
    const updatedSettings = await Settings.findOneAndUpdate(
      {
        _id: settings._id,
        user: user._id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updatedSettings) {
      return NextResponse.json(
        {
          success: false,
          message: "Settings not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully.",
        settings: serializeSettings(
          updatedSettings as unknown as Parameters<typeof serializeSettings>[0],
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings.",
      },
      { status: 500 },
    );
  }
}
