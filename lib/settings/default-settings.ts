import type { ISettings } from "@/models/Settings";

export const DEFAULT_SETTINGS: Pick<
  ISettings,
  "security" | "notifications" | "appearance" | "vault"
> = {
  security: {
    twoFactorEnabled: false,
  },

  notifications: {
    renewalReminders: true,
    securityAlerts: true,
    activityNotifications: false,
  },

  appearance: {
    theme: "dark",
    compactInterface: false,
    animations: true,
  },

  vault: {
    automaticLock: true,
    sessionTimeout: 30,
  },
};
