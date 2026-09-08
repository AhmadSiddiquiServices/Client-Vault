import "dotenv/config";

import { connectToDatabase } from "../lib/mongodb";
import User from "../models/User";
import Settings from "../models/Settings";
import { hashPassword } from "../lib/auth/password";
import { DEFAULT_SETTINGS } from "../lib/settings/default-settings";

async function seedUser() {
  try {
    await connectToDatabase();

    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;
    const name = process.env.SEED_USER_NAME;

    if (!email || !password || !name) {
      throw new Error(
        "Missing SEED_USER_NAME, SEED_USER_EMAIL, or SEED_USER_PASSWORD in .env.local",
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      console.log(
        `User already exists for ${normalizedEmail}. No new user created.`,
      );

      // Make sure the existing user also has Settings.
      const existingSettings = await Settings.findOne({
        user: existingUser._id,
      });

      if (!existingSettings) {
        await Settings.create({
          user: existingUser._id,
          ...DEFAULT_SETTINGS,
        });

        console.log("Default ClientVault settings created for existing user.");
      } else {
        console.log("Settings already exist for existing user.");
      }

      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      isActive: true,
    });

    await Settings.create({
      user: user._id,
      ...DEFAULT_SETTINGS,
    });

    console.log("Initial ClientVault user created successfully.");
    console.log(`User ID: ${user._id.toString()}`);
    console.log(`Email: ${user.email}`);
    console.log("Default ClientVault settings created successfully.");
  } catch (error) {
    console.error("Failed to seed user:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seedUser();
