import mongoose, { Document, Model, Schema } from "mongoose";

export type SettingsTheme = "dark" | "light" | "system";
export type SessionTimeout = 15 | 30 | 60 | 120;

export interface ISettings extends Document {
  user: mongoose.Types.ObjectId;

  security: {
    twoFactorEnabled: boolean;
  };

  notifications: {
    renewalReminders: boolean;
    securityAlerts: boolean;
    activityNotifications: boolean;
  };

  appearance: {
    theme: SettingsTheme;
    compactInterface: boolean;
    animations: boolean;
  };

  vault: {
    automaticLock: boolean;
    sessionTimeout: SessionTimeout;
  };

  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
    },

    notifications: {
      renewalReminders: {
        type: Boolean,
        default: true,
      },

      securityAlerts: {
        type: Boolean,
        default: true,
      },

      activityNotifications: {
        type: Boolean,
        default: false,
      },
    },

    appearance: {
      theme: {
        type: String,
        enum: ["dark", "light", "system"],
        default: "dark",
      },

      compactInterface: {
        type: Boolean,
        default: false,
      },

      animations: {
        type: Boolean,
        default: true,
      },
    },

    vault: {
      automaticLock: {
        type: Boolean,
        default: true,
      },

      sessionTimeout: {
        type: Number,
        enum: [15, 30, 60, 120],
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
