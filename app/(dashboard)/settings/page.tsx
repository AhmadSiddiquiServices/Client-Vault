"use client";

import {
  Bell,
  Check,
  ChevronRight,
  Clock3,
  KeyRound,
  LockKeyhole,
  Monitor,
  Moon,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SettingsSection =
  | "profile"
  | "security"
  | "notifications"
  | "appearance"
  | "vault";

type ProfileData = {
  _id: string;
  name: string;
  email: string;
  role: string;
  hasProfileImage: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  success: boolean;
  message?: string;
  profile?: ProfileData;
  errors?: Record<string, string[] | undefined>;
};

type SecuritySettingsData = {
  twoFactorEnabled: boolean;
};

type SettingsResponse = {
  success: boolean;
  message?: string;
  settings?: {
    security: SecuritySettingsData;
  };
};

type NotificationSettingsData = {
  securityAlerts: boolean;
  activityNotifications: boolean;
};

type NotificationSettingsResponse = {
  success: boolean;
  message?: string;
  settings?: {
    notifications: NotificationSettingsData;
  };
};

type AppearanceSettingsData = {
  theme: "dark" | "light" | "system";
  compactInterface: boolean;
  animations: boolean;
};

type AppearanceSettingsResponse = {
  success: boolean;
  message?: string;
  settings?: {
    appearance: AppearanceSettingsData;
  };
};

type VaultSettingsData = {
  automaticLock: boolean;
  sessionTimeout: 15 | 30 | 60 | 120;
};

type VaultSettingsResponse = {
  success: boolean;
  message?: string;
  settings?: {
    vault: VaultSettingsData;
  };
};

type EnableTwoFactorResponse = {
  success: boolean;
  message?: string;
  challengeId?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  settings?: {
    security: SecuritySettingsData;
  };
  recoveryCodes?: string[];
};

type RecoveryCodeCountResponse = {
  success: boolean;
  message?: string;
  remainingCodes?: number;
};

type ActiveSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

type SessionsResponse = {
  success: boolean;
  message?: string;
  sessions?: ActiveSession[];
  revokedCount?: number;
};

type RecoveryCodesResponse = {
  success: boolean;
  message?: string;
  recoveryCodes?: string[];
};

type RecoveryCodesModalState = {
  visible: boolean;
  codes: string[];
};

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight text-white">
          Settings
        </h1>

        <p className="mt-1 text-[12px] text-[var(--muted)]">
          Manage your ClientVault account, security and application preferences.
        </p>
      </div>

      {/* Layout */}
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--card)] p-2">
          <SettingsNavItem
            icon={<UserRound size={15} />}
            label="Profile"
            active={activeSection === "profile"}
            onClick={() => setActiveSection("profile")}
          />

          <SettingsNavItem
            icon={<ShieldCheck size={15} />}
            label="Security"
            active={activeSection === "security"}
            onClick={() => setActiveSection("security")}
          />

          <SettingsNavItem
            icon={<Bell size={15} />}
            label="Notifications"
            active={activeSection === "notifications"}
            onClick={() => setActiveSection("notifications")}
          />

          <SettingsNavItem
            icon={<Monitor size={15} />}
            label="Appearance"
            active={activeSection === "appearance"}
            onClick={() => setActiveSection("appearance")}
          />

          <SettingsNavItem
            icon={<LockKeyhole size={15} />}
            label="Vault"
            active={activeSection === "vault"}
            onClick={() => setActiveSection("vault")}
          />
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {activeSection === "profile" && (
            <ProfileSettings onSave={handleSave} />
          )}

          {activeSection === "security" && <SecuritySettings />}

          {activeSection === "notifications" && <NotificationSettings />}

          {activeSection === "appearance" && <AppearanceSettings />}

          {activeSection === "vault" && <VaultSettings />}
        </main>
      </div>

      {/* Save indicator */}
      {saved && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-[var(--card)] px-4 py-3 shadow-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
            <Check size={13} className="text-emerald-400" />
          </div>

          <span className="text-[11px] font-medium text-white">
            Settings saved
          </span>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------
   Settings Navigation
----------------------------------------- */

function SettingsNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-white"
      }`}
    >
      {icon}

      <span className="text-[12px] font-medium">{label}</span>

      {active && <ChevronRight size={13} className="ml-auto" />}
    </button>
  );
}

/* ----------------------------------------
   Profile
----------------------------------------- */
function ProfileSettings({ onSave }: { onSave: () => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageVersion, setImageVersion] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);

  /*
   * Load Profile
   */
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/settings/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: ProfileResponse = await response.json();

      if (!response.ok || !data.success || !data.profile) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile(data.profile);

      setName(data.profile.name ?? "");

      /*
       * New image URL version whenever the
       * profile is loaded.
       */
      setImageVersion(Date.now());
    } catch (error) {
      console.error("Load profile error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Initial Load
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /*
   * Cleanup object URL
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /*
   * Select Profile Image
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed.");

      event.target.value = "";

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile image must be 2MB or smaller.");

      event.target.value = "";

      return;
    }

    /*
     * Remove previous local preview.
     */
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);

    setPreviewUrl(localPreview);

    setSelectedFile(file);

    /*
     * Reset file input so selecting
     * the same file again still fires
     * onChange.
     */
    event.target.value = "";
  };

  /*
   * Upload Image
   */
  const uploadProfileImage = async () => {
    if (!selectedFile) {
      return true;
    }

    try {
      setIsImageUploading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch("/api/settings/profile/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload profile picture.");
      }

      /*
       * Force the browser to request
       * the newly uploaded image.
       */
      setImageVersion(Date.now());

      setProfile((current) =>
        current
          ? {
              ...current,
              hasProfileImage: true,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );

      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);

        setPreviewUrl(null);
      }

      return true;
    } catch (error) {
      console.error("Upload profile image error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture.",
      );

      return false;
    } finally {
      setIsImageUploading(false);
    }
  };

  /*
   * Remove Image
   */
  const handleRemoveImage = async () => {
    if (isImageUploading) {
      return;
    }

    try {
      setIsImageUploading(true);

      const response = await fetch("/api/settings/profile/image", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to remove profile picture.");
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);

        setPreviewUrl(null);
      }

      setSelectedFile(null);

      setProfile((current) =>
        current
          ? {
              ...current,
              hasProfileImage: false,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );

      setImageVersion(Date.now());

      toast.success("Profile picture removed successfully.");

      onSave();
    } catch (error) {
      console.error("Remove profile image error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove profile picture.",
      );
    } finally {
      setIsImageUploading(false);
    }
  };

  /*
   * Save Profile
   */
  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Full name is required.");

      return;
    }

    try {
      setIsSaving(true);

      /*
       * First update profile information.
       */
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data: ProfileResponse = await response.json();

      if (!response.ok || !data.success || !data.profile) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setProfile(data.profile);

      setName(data.profile.name ?? "");

      /*
       * Then upload a newly selected
       * profile picture.
       */
      if (selectedFile) {
        const uploaded = await uploadProfileImage();

        if (!uploaded) {
          return;
        }
      }

      toast.success("Profile updated successfully.");

      onSave();
    } catch (error) {
      console.error("Update profile error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <SettingsCard
        title="Profile"
        description="Manage your personal account information."
      >
        <ProfileSettingsSkeleton />
      </SettingsCard>
    );
  }

  /*
   * Error
   */
  if (error || !profile) {
    return (
      <SettingsCard
        title="Profile"
        description="Manage your personal account information."
      >
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-5 py-6">
          <p className="text-[12px] font-medium text-red-400">
            Failed to load profile
          </p>

          <p className="mt-1.5 text-[11px] leading-5 text-[var(--muted)]">
            {error || "Your profile could not be loaded."}
          </p>

          <button
            type="button"
            onClick={loadProfile}
            className="mt-4 inline-flex h-8 items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
          >
            Retry
          </button>
        </div>
      </SettingsCard>
    );
  }

  const initials = getInitials(profile.name);

  /*
   * Local preview takes priority.
   *
   * Otherwise load the image from MongoDB.
   */
  const imageSource =
    previewUrl ||
    (profile.hasProfileImage
      ? `/api/settings/profile/image?v=${imageVersion}`
      : null);

  return (
    <SettingsCard
      title="Profile"
      description="Manage your personal account information."
      action={
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isImageUploading || !name.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={14} />

          {isSaving || isImageUploading ? "Saving..." : "Save Changes"}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] text-[18px] font-semibold text-white">
            {imageSource ? (
              <img
                src={imageSource}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <p className="text-[12px] font-medium text-white">
              Profile Picture
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              JPG, PNG or WebP. Maximum size 2MB.
            </p>

            <div className="mt-2 flex items-center gap-3">
              <label
                className={`cursor-pointer text-[11px] font-medium text-[var(--primary)] transition hover:text-white ${
                  isSaving || isImageUploading
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                {profile.hasProfileImage ? "Change picture" : "Choose picture"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isSaving || isImageUploading}
                  className="hidden"
                />
              </label>

              {profile.hasProfileImage && (
                <button
                  type="button"
                  onClick={() => setShowRemoveImageModal(true)}
                  disabled={isSaving || isImageUploading}
                  className="text-[11px] font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full Name" value={name} onChange={setName} />

          <FormField
            label="Email Address"
            type="email"
            value={profile.email}
            disabled
          />

          <FormField label="Role" value={profile.role} disabled />
        </div>
      </div>
      {showRemoveImageModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={() => setShowRemoveImageModal(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-[14px] font-semibold text-white">
                Remove Profile Picture
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
                Are you sure you want to remove your profile picture? This will
                permanently delete the stored image from your account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowRemoveImageModal(false)}
                disabled={isImageUploading}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-[12px] font-medium text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  setShowRemoveImageModal(false);
                  await handleRemoveImage();
                }}
                disabled={isImageUploading}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-[12px] font-semibold text-red-400 transition hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImageUploading ? "Removing..." : "Remove Picture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}

/* ----------------------------------------
   Security
----------------------------------------- */
function SecuritySettings() {
  const router = useRouter();
  const [twoFactor, setTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showTwoFactorVerification, setShowTwoFactorVerification] =
    useState(false);

  const [twoFactorChallengeId, setTwoFactorChallengeId] = useState<
    string | null
  >(null);

  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [twoFactorExpiresAt, setTwoFactorExpiresAt] = useState<number | null>(
    null,
  );

  const [twoFactorCountdown, setTwoFactorCountdown] = useState(0);

  const [isStartingTwoFactor, setIsStartingTwoFactor] = useState(false);

  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false);
  const [disableTwoFactorPassword, setDisableTwoFactorPassword] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [isDisablingTwoFactor, setIsDisablingTwoFactor] = useState(false);

  /**
   * Active Sessions state.
   */
  const [showActiveSessions, setShowActiveSessions] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesSaved, setRecoveryCodesSaved] = useState(false);

  const [remainingRecoveryCodes, setRemainingRecoveryCodes] = useState<
    number | null
  >(null);

  const [isLoadingRecoveryCodes, setIsLoadingRecoveryCodes] = useState(false);
  const [showRegenerateRecoveryCodes, setShowRegenerateRecoveryCodes] =
    useState(false);
  const [regenerateRecoveryPassword, setRegenerateRecoveryPassword] =
    useState("");
  const [showRegenerateRecoveryPassword, setShowRegenerateRecoveryPassword] =
    useState(false);
  const [isRegeneratingRecoveryCodes, setIsRegeneratingRecoveryCodes] =
    useState(false);
  const [showRegeneratedRecoveryCodes, setShowRegeneratedRecoveryCodes] =
    useState(false);
  const [regeneratedRecoveryCodes, setRegeneratedRecoveryCodes] = useState<
    string[]
  >([]);
  const [regeneratedRecoveryCodesSaved, setRegeneratedRecoveryCodesSaved] =
    useState(false);

  /**
   * Load the authenticated user's settings.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data: SettingsResponse = await response.json();

        if (!response.ok || !data.success || !data.settings) {
          throw new Error(data.message || "Failed to load security settings.");
        }

        if (!cancelled) {
          setTwoFactor(data.settings.security.twoFactorEnabled);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load security settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Countdown for the 2FA enable verification code.
   */
  useEffect(() => {
    if (!showTwoFactorVerification || twoFactorExpiresAt === null) {
      setTwoFactorCountdown(0);
      return;
    }

    const targetTime = twoFactorExpiresAt;

    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.ceil((targetTime - Date.now()) / 1000),
      );

      setTwoFactorCountdown(remaining);
    }

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [showTwoFactorVerification, twoFactorExpiresAt]);

  /**
   * Update the Two-Factor Authentication preference.
   */
  async function handleTwoFactorChange(enabled: boolean) {
    if (
      isUpdating ||
      isStartingTwoFactor ||
      isVerifyingTwoFactor ||
      isDisablingTwoFactor
    ) {
      return;
    }

    /**
     * ----------------------------------------
     * Disable 2FA
     * ----------------------------------------
     *
     * Do NOT change the toggle here.
     *
     * Open the re-authentication modal and wait
     * for the user to confirm their password.
     */
    if (!enabled) {
      setDisableTwoFactorPassword("");
      setShowDisablePassword(false);
      setShowDisableTwoFactor(true);

      return;
    }

    /**
     * ----------------------------------------
     * Enable 2FA
     * ----------------------------------------
     *
     * Start the secure OTP verification flow.
     */
    try {
      setIsStartingTwoFactor(true);

      const response = await fetch("/api/settings/security/2fa/enable", {
        method: "POST",
        credentials: "include",
      });

      const data: EnableTwoFactorResponse = await response.json();

      if (!response.ok || !data.success || !data.challengeId) {
        throw new Error(
          data.message || "Unable to start two-factor authentication.",
        );
      }

      setTwoFactorChallengeId(data.challengeId);
      setTwoFactorCode("");

      setTwoFactorExpiresAt(
        data.expiresAt ? new Date(data.expiresAt).getTime() : null,
      );

      setShowTwoFactorVerification(true);

      toast.success("A verification code has been sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start two-factor authentication.",
      );
    } finally {
      setIsStartingTwoFactor(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }

    if (!newPassword) {
      toast.error("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (confirmPassword !== newPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch("/api/settings/security/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data: {
        success: boolean;
        message?: string;
        errors?: Record<string, string[] | undefined>;
      } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to change password.");
      }

      toast.success("Password changed successfully. Please log in again.");

      /**
       * Clear the modal state before leaving the page.
       */
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);

      /**
       * The API has already removed the current session cookie.
       * Redirect the user to login immediately.
       */
      window.setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  /**
   * Verify the OTP and complete the 2FA enable flow.
   */
  async function handleVerifyTwoFactor() {
    if (isVerifyingTwoFactor || isStartingTwoFactor) {
      return;
    }

    if (!twoFactorChallengeId) {
      toast.error(
        "This verification request is no longer valid. Please try again.",
      );
      return;
    }

    if (!/^\d{6}$/.test(twoFactorCode)) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    if (twoFactorExpiresAt !== null && twoFactorCountdown <= 0) {
      toast.error(
        "This verification code has expired. Please request a new code.",
      );
      return;
    }

    try {
      setIsVerifyingTwoFactor(true);

      const response = await fetch("/api/settings/security/2fa/enable/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          challengeId: twoFactorChallengeId,
          code: twoFactorCode,
        }),
      });

      const data: EnableTwoFactorResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message ||
            "Failed to verify the two-factor authentication code.",
        );
      }

      /**
       * Backend is now the source of truth.
       */
      setTwoFactor(data.settings.security.twoFactorEnabled);

      /**
       * Clear OTP verification state.
       */
      setShowTwoFactorVerification(false);
      setTwoFactorChallengeId(null);
      setTwoFactorCode("");
      setTwoFactorExpiresAt(null);
      setTwoFactorCountdown(0);

      /**
       * Store recovery codes temporarily for the
       * one-time recovery-code setup screen.
       */
      if (Array.isArray(data.recoveryCodes) && data.recoveryCodes.length > 0) {
        setRecoveryCodes(data.recoveryCodes);
        setRecoveryCodesSaved(false);
        setShowRecoveryCodes(true);
      } else {
        /**
         * This should not normally happen because the backend
         * generates recovery codes when 2FA is enabled.
         */
        toast.success("Two-factor authentication enabled.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify the verification code.",
      );
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  }

  function handleCloseTwoFactorVerification() {
    if (isVerifyingTwoFactor) {
      return;
    }

    setShowTwoFactorVerification(false);
    setTwoFactorChallengeId(null);
    setTwoFactorCode("");
    setTwoFactorExpiresAt(null);
    setTwoFactorCountdown(0);
  }

  async function handleDisableTwoFactor() {
    if (isDisablingTwoFactor) {
      return;
    }

    if (!disableTwoFactorPassword) {
      toast.error("Current password is required.");
      return;
    }

    try {
      setIsDisablingTwoFactor(true);

      const response = await fetch("/api/settings/security/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: disableTwoFactorPassword,
        }),
      });

      const data: SettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message || "Failed to disable two-factor authentication.",
        );
      }

      /**
       * Backend is the source of truth.
       */
      setTwoFactor(data.settings.security.twoFactorEnabled);

      /**
       * Clear modal state.
       */
      setShowDisableTwoFactor(false);
      setDisableTwoFactorPassword("");
      setShowDisablePassword(false);

      toast.success("Two-factor authentication disabled.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to disable two-factor authentication.",
      );
    } finally {
      setIsDisablingTwoFactor(false);
    }
  }

  function handleCloseActiveSessions() {
    if (isLoadingSessions || revokingSessionId || isRevokingOthers) {
      return;
    }

    setShowActiveSessions(false);
    setActiveSessions([]);
    setSessionError(null);
  }

  /**
   * Load all active sessions for the current user.
   */
  async function handleViewSessions() {
    if (isLoadingSessions || revokingSessionId || isRevokingOthers) {
      return;
    }

    try {
      setIsLoadingSessions(true);
      setSessionError(null);
      setShowActiveSessions(true);

      const response = await fetch("/api/settings/security/sessions", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data: SessionsResponse = await response.json();

      if (!response.ok || !data.success || !data.sessions) {
        throw new Error(data.message || "Failed to load active sessions.");
      }

      setActiveSessions(data.sessions);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Failed to load active sessions.",
      );
    } finally {
      setIsLoadingSessions(false);
    }
  }

  /**
   * Revoke one specific session.
   */
  async function handleRevokeSession(sessionId: string) {
    if (revokingSessionId || isRevokingOthers || isLoadingSessions) {
      return;
    }

    const session = activeSessions.find((item) => item.id === sessionId);

    if (!session) {
      return;
    }

    if (session.isCurrent) {
      toast.error("Your current session cannot be revoked here.");
      return;
    }

    try {
      setRevokingSessionId(sessionId);

      const response = await fetch(
        `/api/settings/security/sessions/${sessionId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to revoke session.");
      }

      setActiveSessions((currentSessions) =>
        currentSessions.filter((item) => item.id !== sessionId),
      );

      toast.success("Session revoked.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke session.",
      );
    } finally {
      setRevokingSessionId(null);
    }
  }

  /**
   * Revoke every active session except the current session.
   */
  async function handleRevokeOtherSessions() {
    if (isRevokingOthers || revokingSessionId || isLoadingSessions) {
      return;
    }

    const hasOtherSessions = activeSessions.some(
      (session) => !session.isCurrent,
    );

    if (!hasOtherSessions) {
      toast("There are no other active sessions.");
      return;
    }

    try {
      setIsRevokingOthers(true);

      const response = await fetch(
        "/api/settings/security/sessions/revoke-others",
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data: SessionsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to revoke other sessions.");
      }

      /**
       * Keep the current session in the UI.
       */
      setActiveSessions((currentSessions) =>
        currentSessions.filter((session) => session.isCurrent),
      );

      toast.success(
        data.revokedCount
          ? `${data.revokedCount} other session${
              data.revokedCount === 1 ? "" : "s"
            } revoked.`
          : "There were no other active sessions to revoke.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to revoke other sessions.",
      );
    } finally {
      setIsRevokingOthers(false);
    }
  }

  async function handleCopyRecoveryCodes() {
    if (recoveryCodes.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));

      toast.success("Recovery codes copied.");
    } catch {
      toast.error("Unable to copy recovery codes.");
    }
  }

  function handleDownloadRecoveryCodes() {
    if (recoveryCodes.length === 0) {
      return;
    }

    const content = [
      "ClientVault Recovery Codes",
      "",
      "Keep these codes somewhere safe.",
      "Each recovery code can only be used once.",
      "",
      ...recoveryCodes,
      "",
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "clientvault-recovery-codes.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Recovery codes downloaded.");
  }

  function handleRecoveryCodesContinue() {
    if (!recoveryCodesSaved) {
      toast.error("Please confirm that you have saved your recovery codes.");

      return;
    }

    setShowRecoveryCodes(false);
    setRecoveryCodes([]);
    setRecoveryCodesSaved(false);
  }

  async function loadRecoveryCodeCount() {
    try {
      setIsLoadingRecoveryCodes(true);

      const response = await fetch("/api/settings/security/2fa/recovery", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data: RecoveryCodeCountResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load recovery-code status.");
      }

      setRemainingRecoveryCodes(
        typeof data.remainingCodes === "number" ? data.remainingCodes : 0,
      );
    } catch (error) {
      console.error("Recovery-code count request failed:", error);

      setRemainingRecoveryCodes(null);
    } finally {
      setIsLoadingRecoveryCodes(false);
    }
  }

  async function handleRegenerateRecoveryCodes() {
    if (isRegeneratingRecoveryCodes) {
      return;
    }

    if (!regenerateRecoveryPassword) {
      toast.error("Current password is required.");
      return;
    }

    try {
      setIsRegeneratingRecoveryCodes(true);

      const response = await fetch(
        "/api/settings/security/2fa/recovery/regenerate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: regenerateRecoveryPassword,
          }),
        },
      );

      const data: {
        success: boolean;
        message?: string;
        recoveryCodes?: string[];
      } = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !Array.isArray(data.recoveryCodes) ||
        data.recoveryCodes.length === 0
      ) {
        throw new Error(data.message || "Failed to regenerate recovery codes.");
      }

      /**
       * Close password modal.
       */
      setShowRegenerateRecoveryCodes(false);
      setRegenerateRecoveryPassword("");
      setShowRegenerateRecoveryPassword(false);

      /**
       * Show the new recovery codes exactly once.
       */
      setRegeneratedRecoveryCodes(data.recoveryCodes);
      setRegeneratedRecoveryCodesSaved(false);
      setShowRegeneratedRecoveryCodes(true);

      /**
       * New set contains all unused codes.
       */
      setRemainingRecoveryCodes(data.recoveryCodes.length);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to regenerate recovery codes.",
      );
    } finally {
      setIsRegeneratingRecoveryCodes(false);
    }
  }

  async function handleCopyRegeneratedRecoveryCodes() {
    if (regeneratedRecoveryCodes.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(regeneratedRecoveryCodes.join("\n"));

      toast.success("Recovery codes copied.");
    } catch {
      toast.error("Unable to copy recovery codes.");
    }
  }

  function handleDownloadRegeneratedRecoveryCodes() {
    if (regeneratedRecoveryCodes.length === 0) {
      return;
    }

    const content = [
      "ClientVault Recovery Codes",
      "",
      "Keep these codes somewhere safe.",
      "Each recovery code can only be used once.",
      "",
      ...regeneratedRecoveryCodes,
      "",
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "clientvault-recovery-codes.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Recovery codes downloaded.");
  }

  function handleCloseRegeneratedRecoveryCodes() {
    if (!regeneratedRecoveryCodesSaved) {
      toast.error("Please confirm that you have saved your recovery codes.");

      return;
    }

    setShowRegeneratedRecoveryCodes(false);
    setRegeneratedRecoveryCodes([]);
    setRegeneratedRecoveryCodesSaved(false);
  }

  useEffect(() => {
    if (!isLoading && !error && twoFactor) {
      loadRecoveryCodeCount();
    }

    if (!twoFactor) {
      setRemainingRecoveryCodes(0);
    }
  }, [isLoading, error, twoFactor]);

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Security"
        description="Protect your ClientVault account and manage authentication."
      >
        {isLoading && (
          <div className="divide-y divide-[var(--border)]">
            <SecurityItemSkeleton />
            <SecurityItemSkeleton />
            <SecurityItemSkeleton />
          </div>
        )}

        {!isLoading && error && (
          <div className="p-5">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[11px] text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="divide-y divide-[var(--border)]">
            <SecurityItem
              icon={<KeyRound size={16} />}
              title="Password"
              description="Change your account password regularly to keep your account secure."
              action={
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                >
                  Change Password
                </button>
              }
            />

            <SecurityItem
              icon={<ShieldCheck size={16} />}
              title="Two-Factor Authentication"
              description="Add an additional layer of protection to your account."
              action={
                <Toggle
                  enabled={twoFactor}
                  onChange={handleTwoFactorChange}
                  disabled={
                    isUpdating || isStartingTwoFactor || isVerifyingTwoFactor
                  }
                />
              }
            />

            <SecurityItem
              icon={<KeyRound size={16} />}
              title="Recovery Codes"
              description={
                twoFactor
                  ? isLoadingRecoveryCodes
                    ? "Checking remaining recovery codes..."
                    : remainingRecoveryCodes !== null
                      ? `${remainingRecoveryCodes} recovery ${
                          remainingRecoveryCodes === 1 ? "code" : "codes"
                        } remaining. Each code can only be used once.`
                      : "Recovery codes are available for account recovery."
                  : "Recovery codes become available when two-factor authentication is enabled."
              }
              action={
                twoFactor ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRegenerateRecoveryPassword("");
                      setShowRegenerateRecoveryPassword(false);
                      setShowRegenerateRecoveryCodes(false);
                      setRegeneratedRecoveryCodes([]);
                      setRegeneratedRecoveryCodesSaved(false);

                      setShowRegenerateRecoveryCodes(true);
                    }}
                    disabled={
                      isLoadingRecoveryCodes || isRegeneratingRecoveryCodes
                    }
                    className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoadingRecoveryCodes ? "Loading..." : "Regenerate Codes"}
                  </button>
                ) : (
                  <span className="text-[10px] text-[var(--muted)]">
                    Not available
                  </span>
                )
              }
            />

            <SecurityItem
              icon={<Smartphone size={16} />}
              title="Active Sessions"
              description="Review devices currently signed in to your account."
              action={
                <button
                  type="button"
                  onClick={handleViewSessions}
                  disabled={
                    isLoadingSessions ||
                    revokingSessionId !== null ||
                    isRevokingOthers
                  }
                  className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingSessions ? "Loading..." : "View Sessions"}
                </button>
              }
            />

            {showTwoFactorVerification && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
                          <ShieldCheck
                            size={15}
                            className="text-[var(--primary)]"
                          />
                        </div>

                        <div>
                          <h2 className="text-[14px] font-semibold text-white">
                            Enable Two-Factor Authentication
                          </h2>

                          <p className="mt-1 text-[11px] text-[var(--muted)]">
                            Verify your email to enable 2FA.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseTwoFactorVerification}
                      disabled={isVerifyingTwoFactor}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-5 p-5">
                    <div>
                      <p className="text-[11px] leading-5 text-[var(--muted)]">
                        We sent a 6-digit verification code to your account
                        email address. Enter the code below to complete the
                        setup.
                      </p>
                    </div>

                    {/* OTP */}
                    <div>
                      <label
                        htmlFor="enable-two-factor-code"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        Verification Code
                      </label>

                      <input
                        id="enable-two-factor-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);

                          setTwoFactorCode(value);
                        }}
                        placeholder="Enter 6-digit code"
                        disabled={isVerifyingTwoFactor}
                        className={`${inputClass} text-center text-[16px] tracking-[0.3em]`}
                      />
                    </div>

                    {/* Expiration */}
                    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
                      <span className="text-[10px] text-[var(--muted)]">
                        Code expires in
                      </span>

                      <span
                        className={`text-[10px] font-medium ${
                          twoFactorCountdown <= 60
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {twoFactorCountdown > 0
                          ? `${Math.floor(twoFactorCountdown / 60)
                              .toString()
                              .padStart(2, "0")}:${(twoFactorCountdown % 60)
                              .toString()
                              .padStart(2, "0")}`
                          : "Expired"}
                      </span>
                    </div>

                    <p className="text-[10px] leading-5 text-[var(--muted)]">
                      This code can only be used to confirm enabling two-factor
                      authentication on your account.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={isVerifyingTwoFactor}
                      onClick={handleCloseTwoFactorVerification}
                      className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        isVerifyingTwoFactor ||
                        twoFactorCode.length !== 6 ||
                        twoFactorCountdown <= 0
                      }
                      onClick={handleVerifyTwoFactor}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isVerifyingTwoFactor
                        ? "Verifying..."
                        : "Verify & Enable"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRecoveryCodes && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
                      <ShieldCheck
                        size={15}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Save Your Recovery Codes
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Use these codes if you cannot access your verification
                        email.
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[11px] leading-5 text-amber-300">
                        These codes are shown only once. Store them somewhere
                        secure. Each code can be used only once.
                      </p>
                    </div>

                    {/* Codes */}
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {recoveryCodes.map((code) => (
                          <div
                            key={code}
                            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center font-mono text-[11px] tracking-wider text-white"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopyRecoveryCodes}
                        className="h-8 flex-1 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                      >
                        Copy All
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadRecoveryCodes}
                        className="h-8 flex-1 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                      >
                        Download
                      </button>
                    </div>

                    {/* Confirmation */}
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                      <input
                        type="checkbox"
                        checked={recoveryCodesSaved}
                        onChange={(event) =>
                          setRecoveryCodesSaved(event.target.checked)
                        }
                        className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
                      />

                      <span className="text-[10px] leading-5 text-[var(--muted)]">
                        I have saved my recovery codes in a secure location.
                      </span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={!recoveryCodesSaved}
                      onClick={handleRecoveryCodesContinue}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      I've Saved My Recovery Codes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showChangePassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Change Password
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Update your ClientVault account password.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isChangingPassword) return;

                        setShowChangePassword(false);

                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");

                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-4 p-5">
                    {/* Current password */}
                    <div>
                      <label
                        htmlFor="current-password"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          placeholder="Enter current password"
                          autoComplete="current-password"
                          disabled={isChangingPassword}
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((current) => !current)
                          }
                          disabled={isChangingPassword}
                          aria-label={
                            showCurrentPassword
                              ? "Hide current password"
                              : "Show current password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          disabled={isChangingPassword}
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((current) => !current)
                          }
                          disabled={isChangingPassword}
                          aria-label={
                            showNewPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {showNewPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>

                      <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                        Password must be between 8 and 128 characters.
                      </p>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          disabled={isChangingPassword}
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((current) => !current)
                          }
                          disabled={isChangingPassword}
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={isChangingPassword}
                      onClick={() => {
                        setShowChangePassword(false);

                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");

                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isChangingPassword}
                      onClick={handleChangePassword}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDisableTwoFactor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Disable Two-Factor Authentication
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Confirm your current password to disable 2FA.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isDisablingTwoFactor) return;

                        setShowDisableTwoFactor(false);
                        setDisableTwoFactorPassword("");
                        setShowDisablePassword(false);
                      }}
                      disabled={isDisablingTwoFactor}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[11px] leading-5 text-amber-300">
                        Disabling two-factor authentication will reduce the
                        protection on your ClientVault account.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="disable-two-factor-password"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="disable-two-factor-password"
                          type={showDisablePassword ? "text" : "password"}
                          value={disableTwoFactorPassword}
                          onChange={(event) =>
                            setDisableTwoFactorPassword(event.target.value)
                          }
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                          disabled={isDisablingTwoFactor}
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowDisablePassword((current) => !current)
                          }
                          disabled={isDisablingTwoFactor}
                          aria-label={
                            showDisablePassword
                              ? "Hide current password"
                              : "Show current password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {showDisablePassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={isDisablingTwoFactor}
                      onClick={() => {
                        setShowDisableTwoFactor(false);
                        setDisableTwoFactorPassword("");
                        setShowDisablePassword(false);
                      }}
                      className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        isDisablingTwoFactor || !disableTwoFactorPassword
                      }
                      onClick={handleDisableTwoFactor}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDisablingTwoFactor ? "Disabling..." : "Disable 2FA"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showActiveSessions && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Active Sessions
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Review devices currently signed in to your ClientVault
                        account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseActiveSessions}
                      disabled={
                        isLoadingSessions ||
                        revokingSessionId !== null ||
                        isRevokingOthers
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {isLoadingSessions && (
                      <div className="space-y-3">
                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="animate-pulse rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                          >
                            <div className="h-3 w-32 rounded bg-white/5" />
                            <div className="mt-2 h-2.5 w-56 rounded bg-white/5" />
                            <div className="mt-2 h-2.5 w-40 rounded bg-white/5" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!isLoadingSessions && sessionError && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-[11px] text-red-400">
                          {sessionError}
                        </p>

                        <button
                          type="button"
                          onClick={handleViewSessions}
                          className="mt-3 h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {!isLoadingSessions &&
                      !sessionError &&
                      activeSessions.length === 0 && (
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 text-center">
                          <p className="text-[12px] font-medium text-white">
                            No active sessions found.
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--muted)]">
                            Your current session may no longer be active.
                          </p>
                        </div>
                      )}

                    {!isLoadingSessions &&
                      !sessionError &&
                      activeSessions.length > 0 && (
                        <div className="space-y-3">
                          {activeSessions.map((session) => (
                            <div
                              key={session.id}
                              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[12px] font-medium text-white">
                                      {getSessionBrowserLabel(
                                        session.userAgent,
                                      )}
                                    </p>

                                    {session.isCurrent && (
                                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                                        Current session
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2 space-y-1">
                                    <p className="text-[10px] text-[var(--muted)]">
                                      IP:{" "}
                                      <span className="text-white/80">
                                        {session.ipAddress || "Unavailable"}
                                      </span>
                                    </p>

                                    <p className="text-[10px] text-[var(--muted)]">
                                      Last active:{" "}
                                      <span className="text-white/80">
                                        {formatSessionDate(
                                          session.lastActiveAt,
                                        )}
                                      </span>
                                    </p>

                                    <p className="text-[10px] text-[var(--muted)]">
                                      Signed in:{" "}
                                      <span className="text-white/80">
                                        {formatSessionDate(session.createdAt)}
                                      </span>
                                    </p>

                                    <p className="text-[10px] text-[var(--muted)]">
                                      Expires:{" "}
                                      <span className="text-white/80">
                                        {formatSessionDate(session.expiresAt)}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {!session.isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRevokeSession(session.id)
                                    }
                                    disabled={
                                      revokingSessionId === session.id ||
                                      isRevokingOthers ||
                                      isLoadingSessions
                                    }
                                    className="h-8 shrink-0 rounded-lg border border-red-500/20 px-3 text-[11px] font-medium text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {revokingSessionId === session.id
                                      ? "Revoking..."
                                      : "Revoke"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Footer */}
                  {!isLoadingSessions &&
                    !sessionError &&
                    activeSessions.some((session) => !session.isCurrent) && (
                      <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] text-[var(--muted)]">
                          Revoke all other sessions to sign out devices you no
                          longer recognize.
                        </p>

                        <button
                          type="button"
                          onClick={handleRevokeOtherSessions}
                          disabled={
                            isRevokingOthers || revokingSessionId !== null
                          }
                          className="h-8 shrink-0 rounded-lg border border-red-500/20 px-3 text-[11px] font-medium text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRevokingOthers
                            ? "Revoking..."
                            : "Revoke All Other Sessions"}
                        </button>
                      </div>
                    )}

                  {!isLoadingSessions &&
                    !sessionError &&
                    !activeSessions.some((session) => !session.isCurrent) && (
                      <div className="flex justify-end border-t border-[var(--border)] px-5 py-4">
                        <button
                          type="button"
                          onClick={handleCloseActiveSessions}
                          disabled={
                            revokingSessionId !== null || isRevokingOthers
                          }
                          className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Close
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}

            {showRegenerateRecoveryCodes && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Regenerate Recovery Codes
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Confirm your current password to replace your existing
                        codes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isRegeneratingRecoveryCodes) return;

                        setShowRegenerateRecoveryCodes(false);
                        setRegenerateRecoveryPassword("");
                        setShowRegenerateRecoveryPassword(false);
                      }}
                      disabled={isRegeneratingRecoveryCodes}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[11px] leading-5 text-amber-300">
                        Regenerating your recovery codes will immediately
                        invalidate all of your current recovery codes.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="regenerate-recovery-password"
                        className="mb-1.5 block text-[11px] font-medium text-white"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="regenerate-recovery-password"
                          type={
                            showRegenerateRecoveryPassword ? "text" : "password"
                          }
                          value={regenerateRecoveryPassword}
                          onChange={(event) =>
                            setRegenerateRecoveryPassword(event.target.value)
                          }
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                          disabled={isRegeneratingRecoveryCodes}
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowRegenerateRecoveryPassword(
                              (current) => !current,
                            )
                          }
                          disabled={isRegeneratingRecoveryCodes}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={
                            showRegenerateRecoveryPassword
                              ? "Hide current password"
                              : "Show current password"
                          }
                        >
                          {showRegenerateRecoveryPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={isRegeneratingRecoveryCodes}
                      onClick={() => {
                        setShowRegenerateRecoveryCodes(false);
                        setRegenerateRecoveryPassword("");
                        setShowRegenerateRecoveryPassword(false);
                      }}
                      className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        isRegeneratingRecoveryCodes ||
                        !regenerateRecoveryPassword
                      }
                      onClick={handleRegenerateRecoveryCodes}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRegeneratingRecoveryCodes
                        ? "Regenerating..."
                        : "Regenerate Codes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRegeneratedRecoveryCodes && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
                      <ShieldCheck
                        size={15}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-semibold text-white">
                        Your New Recovery Codes
                      </h2>

                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        Your previous recovery codes are no longer valid.
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[11px] leading-5 text-amber-300">
                        These codes are shown only once. Store them somewhere
                        secure. Each code can be used only once.
                      </p>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {regeneratedRecoveryCodes.map((code) => (
                          <div
                            key={code}
                            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center font-mono text-[11px] tracking-wider text-white"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopyRegeneratedRecoveryCodes}
                        className="h-8 flex-1 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                      >
                        Copy All
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadRegeneratedRecoveryCodes}
                        className="h-8 flex-1 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
                      >
                        Download
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                      <input
                        type="checkbox"
                        checked={regeneratedRecoveryCodesSaved}
                        onChange={(event) =>
                          setRegeneratedRecoveryCodesSaved(event.target.checked)
                        }
                        className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
                      />

                      <span className="text-[10px] leading-5 text-[var(--muted)]">
                        I have saved my new recovery codes in a secure location.
                      </span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-4">
                    <button
                      type="button"
                      disabled={!regeneratedRecoveryCodesSaved}
                      onClick={handleCloseRegeneratedRecoveryCodes}
                      className="h-8 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      I've Saved My Recovery Codes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ----------------------------------------
   Notifications
----------------------------------------- */
function NotificationSettings() {
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<
    "securityAlerts" | "activityNotifications" | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  /**
   * Load notification settings.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadNotificationSettings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data: NotificationSettingsResponse = await response.json();

        if (!response.ok || !data.success || !data.settings) {
          throw new Error(
            data.message || "Failed to load notification settings.",
          );
        }

        if (!cancelled) {
          setSecurityAlerts(data.settings.notifications.securityAlerts);

          setActivityNotifications(
            data.settings.notifications.activityNotifications,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load notification settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadNotificationSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Update Security Alerts.
   */
  async function handleSecurityAlertsChange(enabled: boolean) {
    if (isUpdating) {
      return;
    }

    const previousValue = securityAlerts;

    setSecurityAlerts(enabled);
    setIsUpdating("securityAlerts");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: {
            securityAlerts: enabled,
          },
        }),
      });

      const data: NotificationSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message || "Failed to update security alert settings.",
        );
      }

      setSecurityAlerts(data.settings.notifications.securityAlerts);

      toast.success(
        enabled ? "Security alerts enabled." : "Security alerts disabled.",
      );
    } catch (error) {
      setSecurityAlerts(previousValue);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update security alerts.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  /**
   * Update Activity Notifications.
   */
  async function handleActivityNotificationsChange(enabled: boolean) {
    if (isUpdating) {
      return;
    }

    const previousValue = activityNotifications;

    setActivityNotifications(enabled);
    setIsUpdating("activityNotifications");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: {
            activityNotifications: enabled,
          },
        }),
      });

      const data: NotificationSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message || "Failed to update activity notification settings.",
        );
      }

      setActivityNotifications(
        data.settings.notifications.activityNotifications,
      );

      toast.success(
        enabled
          ? "Activity notifications enabled."
          : "Activity notifications disabled.",
      );
    } catch (error) {
      setActivityNotifications(previousValue);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update activity notifications.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Notifications"
        description="Choose which ClientVault events should notify you."
      >
        {isLoading && (
          <div className="divide-y divide-[var(--border)]">
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
          </div>
        )}

        {!isLoading && error && (
          <div className="p-5">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[11px] text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="divide-y divide-[var(--border)]">
            {/* Renewal Reminders intentionally not implemented yet */}
            <div className="flex items-center justify-between gap-5 py-5">
              <div>
                <p className="text-[12px] font-medium text-white">
                  Renewal Reminders
                </p>

                <p className="mt-1 max-w-xl text-[11px] leading-5 text-[var(--muted)]">
                  Receive reminders when domains, hosting or subscriptions are
                  approaching renewal.
                </p>
              </div>

              <span className="shrink-0 rounded-md border border-[var(--border)] px-2.5 py-1 text-[10px] font-medium text-[var(--muted)]">
                Coming Soon
              </span>
            </div>

            {/* Security Alerts */}
            <NotificationItem
              title="Security Alerts"
              description="Get notified about important security events and suspicious account activity."
              enabled={securityAlerts}
              onChange={handleSecurityAlertsChange}
            />

            {/* Activity Notifications */}
            <NotificationItem
              title="Activity Notifications"
              description="Receive notifications for important changes made to your clients, projects and credentials."
              enabled={activityNotifications}
              onChange={handleActivityNotificationsChange}
            />
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ----------------------------------------
   Appearance
----------------------------------------- */
function AppearanceSettings() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [compactInterface, setCompactInterface] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<
    "theme" | "compactInterface" | "animations" | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  /**
   * Load appearance settings.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAppearanceSettings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data: AppearanceSettingsResponse = await response.json();

        if (!response.ok || !data.success || !data.settings) {
          throw new Error(
            data.message || "Failed to load appearance settings.",
          );
        }

        if (!cancelled) {
          setTheme(data.settings.appearance.theme);

          setCompactInterface(data.settings.appearance.compactInterface);

          setAnimations(data.settings.appearance.animations);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load appearance settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAppearanceSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Update theme.
   */
  async function handleThemeChange(value: "dark" | "light" | "system") {
    if (isUpdating) {
      return;
    }

    const previousValue = theme;

    setTheme(value);
    setIsUpdating("theme");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appearance: {
            theme: value,
          },
        }),
      });

      const data: AppearanceSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(data.message || "Failed to update theme.");
      }

      setTheme(data.settings.appearance.theme);

      toast.success("Theme preference saved.");
    } catch (error) {
      setTheme(previousValue);

      toast.error(
        error instanceof Error ? error.message : "Failed to update theme.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  /**
   * Update compact interface.
   */
  async function handleCompactInterfaceChange(enabled: boolean) {
    if (isUpdating) {
      return;
    }

    const previousValue = compactInterface;

    setCompactInterface(enabled);
    setIsUpdating("compactInterface");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appearance: {
            compactInterface: enabled,
          },
        }),
      });

      const data: AppearanceSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message || "Failed to update compact interface setting.",
        );
      }

      setCompactInterface(data.settings.appearance.compactInterface);

      toast.success(
        enabled ? "Compact interface enabled." : "Compact interface disabled.",
      );
    } catch (error) {
      setCompactInterface(previousValue);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update compact interface.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  /**
   * Update animations.
   */
  async function handleAnimationsChange(enabled: boolean) {
    if (isUpdating) {
      return;
    }

    const previousValue = animations;

    setAnimations(enabled);
    setIsUpdating("animations");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appearance: {
            animations: enabled,
          },
        }),
      });

      const data: AppearanceSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(data.message || "Failed to update animation settings.");
      }

      setAnimations(data.settings.appearance.animations);

      toast.success(enabled ? "Animations enabled." : "Animations disabled.");
    } catch (error) {
      setAnimations(previousValue);

      toast.error(
        error instanceof Error ? error.message : "Failed to update animations.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <SettingsCard
      title="Appearance"
      description="Customize how ClientVault looks and behaves."
    >
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div>
            <div className="h-3 w-12 rounded bg-[var(--background)]" />

            <div className="mt-2 h-3 w-64 rounded bg-[var(--background)]" />

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-16 rounded-lg bg-[var(--background)]" />
              <div className="h-16 rounded-lg bg-[var(--background)]" />
              <div className="h-16 rounded-lg bg-[var(--background)]" />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-5">
            <div className="h-12 rounded-lg bg-[var(--background)]" />
            <div className="mt-3 h-12 rounded-lg bg-[var(--background)]" />
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[11px] text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <p className="text-[12px] font-medium text-white">Theme</p>

            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Select your preferred interface theme.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ThemeOption
                value="dark"
                label="Dark"
                icon={<Moon size={16} />}
                selected={theme === "dark"}
                onClick={() => handleThemeChange("dark")}
                disabled={isUpdating !== null}
              />

              <ThemeOption
                value="system"
                label="System"
                icon={<Monitor size={16} />}
                selected={theme === "system"}
                onClick={() => handleThemeChange("system")}
                disabled={isUpdating !== null}
              />

              <ThemeOption
                value="light"
                label="Light"
                icon={<Monitor size={16} />}
                selected={theme === "light"}
                onClick={() => handleThemeChange("light")}
                disabled={isUpdating !== null}
              />
            </div>
          </div>

          {/* Interface preferences */}
          <div className="border-t border-[var(--border)] pt-5">
            <ToggleRow
              title="Compact Interface"
              description="Use a denser layout to display more information at once."
              enabled={compactInterface}
              onChange={handleCompactInterfaceChange}
              disabled={isUpdating !== null}
            />

            <ToggleRow
              title="Animations"
              description="Enable interface transitions and subtle motion effects."
              enabled={animations}
              onChange={handleAnimationsChange}
              disabled={isUpdating !== null}
            />
          </div>
        </div>
      )}
    </SettingsCard>
  );
}

/* ----------------------------------------
   Vault
----------------------------------------- */
function VaultSettings() {
  const [autoLock, setAutoLock] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<15 | 30 | 60 | 120>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<
    "automaticLock" | "sessionTimeout" | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  /**
   * Load vault settings.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadVaultSettings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data: VaultSettingsResponse = await response.json();

        if (!response.ok || !data.success || !data.settings) {
          throw new Error(data.message || "Failed to load vault settings.");
        }

        if (!cancelled) {
          setAutoLock(data.settings.vault.automaticLock);

          setSessionTimeout(data.settings.vault.sessionTimeout);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load vault settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadVaultSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Update Automatic Vault Lock.
   */
  async function handleAutoLockChange(enabled: boolean) {
    if (isUpdating) {
      return;
    }

    const previousValue = autoLock;

    setAutoLock(enabled);
    setIsUpdating("automaticLock");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vault: {
            automaticLock: enabled,
          },
        }),
      });

      const data: VaultSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(
          data.message || "Failed to update automatic vault lock.",
        );
      }

      setAutoLock(data.settings.vault.automaticLock);

      toast.success(
        enabled
          ? "Automatic vault lock enabled."
          : "Automatic vault lock disabled.",
      );
    } catch (error) {
      setAutoLock(previousValue);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update automatic vault lock.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  /**
   * Update Session Timeout.
   */
  async function handleSessionTimeoutChange(value: 15 | 30 | 60 | 120) {
    if (isUpdating) {
      return;
    }

    const previousValue = sessionTimeout;

    setSessionTimeout(value);
    setIsUpdating("sessionTimeout");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vault: {
            sessionTimeout: value,
          },
        }),
      });

      const data: VaultSettingsResponse = await response.json();

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(data.message || "Failed to update session timeout.");
      }

      setSessionTimeout(data.settings.vault.sessionTimeout);

      toast.success("Session timeout updated.");
    } catch (error) {
      setSessionTimeout(previousValue);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update session timeout.",
      );
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Vault"
        description="Configure how ClientVault protects sensitive credential information."
      >
        {isLoading && (
          <div className="divide-y divide-[var(--border)] animate-pulse">
            <div className="flex items-center justify-between gap-5 py-5">
              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-[var(--background)]" />
                <div className="h-3 w-96 max-w-[60vw] rounded bg-[var(--background)]" />
              </div>

              <div className="h-6 w-11 rounded-full bg-[var(--background)]" />
            </div>

            <div className="flex items-center justify-between gap-5 py-5">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-[var(--background)]" />
                <div className="h-3 w-80 max-w-[60vw] rounded bg-[var(--background)]" />
              </div>

              <div className="h-9 w-36 rounded-lg bg-[var(--background)]" />
            </div>

            <div className="flex items-center gap-4 py-5">
              <div className="h-10 w-10 rounded-lg bg-[var(--background)]" />

              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-[var(--background)]" />
                <div className="h-3 w-96 max-w-[60vw] rounded bg-[var(--background)]" />
              </div>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="p-5">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[11px] text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="divide-y divide-[var(--border)]">
            {/* Automatic Vault Lock */}
            <NotificationItem
              title="Automatic Vault Lock"
              description="Require vault access to be re-authenticated after a period of inactivity."
              enabled={autoLock}
              onChange={handleAutoLockChange}
              disabled={isUpdating !== null}
            />

            {/* Session Timeout */}
            <div className="py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-medium text-white">
                    Session Timeout
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
                    Automatically lock the vault after inactivity.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <select
                    value={sessionTimeout}
                    onChange={(event) =>
                      handleSessionTimeoutChange(
                        Number(event.target.value) as 15 | 30 | 60 | 120,
                      )
                    }
                    disabled={isUpdating !== null || !autoLock}
                    className={`h-9 min-w-[150px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none transition focus:border-[var(--primary)] ${
                      isUpdating !== null || !autoLock
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <option value="15">15 minutes</option>

                    <option value="30">30 minutes</option>

                    <option value="60">1 hour</option>

                    <option value="120">2 hours</option>
                  </select>

                  <ChevronRight
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--muted)]"
                  />
                </div>
              </div>
            </div>

            {/* Credential Protection */}
            <SecurityItem
              icon={<LockKeyhole size={16} />}
              title="Credential Protection"
              description="Sensitive credential values will be encrypted before being stored by the backend."
              action={
                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-medium text-emerald-400">
                  Protected
                </span>
              }
            />
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ----------------------------------------
   Settings Card
----------------------------------------- */
function SettingsCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-white">{title}</h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">{description}</p>
        </div>

        {action}
      </div>

      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

/* ----------------------------------------
   Form Field
----------------------------------------- */
function FormField({
  label,
  value,
  type = "text",
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        className={`${inputClass} ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      />
    </div>
  );
}

/* ----------------------------------------
   Security Item
----------------------------------------- */
function SecurityItem({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
          {icon}
        </div>

        <div>
          <p className="text-[12px] font-medium text-white">{title}</p>

          <p className="mt-1 max-w-xl text-[11px] leading-5 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 sm:pl-5">{action}</div>
    </div>
  );
}

/* ----------------------------------------
   Notification Item
----------------------------------------- */
function NotificationItem({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <p className="text-[12px] font-medium text-white">{title}</p>

        <p className="mt-1 max-w-xl text-[11px] leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}

/* ----------------------------------------
   Toggle
----------------------------------------- */
function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        enabled
          ? "bg-[var(--primary)]"
          : "border border-[var(--border)] bg-[var(--background)]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition ${
          enabled ? "left-[22px] bg-black" : "left-[3px] bg-[var(--muted)]"
        }`}
      />
    </button>
  );
}

/* ----------------------------------------
   Theme Option
----------------------------------------- */
function ThemeOption({
  value,
  label,
  icon,
  selected,
  onClick,
  disabled = false,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-[var(--primary)] text-black"
            : "border border-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[12px] font-medium text-white">{label}</p>

        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
          {value === "dark" && "Always dark"}
          {value === "system" && "Use system setting"}
          {value === "light" && "Light interface"}
        </p>
      </div>

      {selected && (
        <Check size={15} className="ml-auto text-[var(--primary)]" />
      )}
    </button>
  );
}

/* ----------------------------------------
   Toggle Row
----------------------------------------- */
function ToggleRow({
  title,
  description,
  enabled = false,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-3">
      <div>
        <p className="text-[12px] font-medium text-white">{title}</p>

        <p className="mt-1 text-[11px] text-[var(--muted)]">{description}</p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange ?? (() => {})}
        disabled={disabled}
      />
    </div>
  );
}

/* ----------------------------------------
   Initials
----------------------------------------- */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/* ----------------------------------------
   Profile Skeleton
----------------------------------------- */
function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-xl bg-white/[0.05]" />

        <div>
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />

          <div className="mt-2 h-2.5 w-48 animate-pulse rounded bg-white/[0.04]" />

          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 h-2.5 w-16 animate-pulse rounded bg-white/[0.04]" />

          <div className="h-10 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>

        <div>
          <div className="mb-2 h-2.5 w-24 animate-pulse rounded bg-white/[0.04]" />

          <div className="h-10 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>

        <div>
          <div className="mb-2 h-2.5 w-12 animate-pulse rounded bg-white/[0.04]" />

          <div className="h-10 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>

        <div>
          <div className="mb-2 h-2.5 w-32 animate-pulse rounded bg-white/[0.04]" />

          <div className="h-10 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Security Skeleton
----------------------------------------- */
function SecurityItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-[var(--background)]" />

        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-[var(--background)]" />
          <div className="h-3 w-72 max-w-[50vw] rounded bg-[var(--background)]" />
        </div>
      </div>

      <div className="h-8 w-20 rounded-lg bg-[var(--background)]" />
    </div>
  );
}

/* ----------------------------------------
   Notification Skeleton
----------------------------------------- */
function NotificationItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-[var(--background)]" />

        <div className="h-3 w-96 max-w-[60vw] rounded bg-[var(--background)]" />
      </div>

      <div className="h-6 w-11 rounded-full bg-[var(--background)]" />
    </div>
  );
}

function getSessionBrowserLabel(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown browser";
  }

  if (/Edg\//i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/Chrome\//i.test(userAgent)) {
    return "Google Chrome";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Mozilla Firefox";
  }

  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return "Safari";
  }

  if (/OPR\//i.test(userAgent)) {
    return "Opera";
  }

  return "Unknown browser";
}

/* ----------------------------------------
   Format Session Date
---------------------------------------- */
function formatSessionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
