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
} from "lucide-react";
import { useState } from "react";

type SettingsSection =
  | "profile"
  | "security"
  | "notifications"
  | "appearance"
  | "vault";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
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
  return (
    <SettingsCard
      title="Profile"
      description="Manage your personal account information."
      action={
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition hover:bg-[var(--primary-hover)]"
        >
          <Save size={14} />
          Save Changes
        </button>
      }
    >
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[18px] font-semibold text-white">
            AS
          </div>

          <div>
            <p className="text-[12px] font-medium text-white">
              Profile Picture
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              JPG, PNG or WebP. Maximum size 2MB.
            </p>

            <button
              type="button"
              className="mt-2 text-[11px] font-medium text-[var(--primary)] transition hover:text-white"
            >
              Change picture
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full Name" defaultValue="Ahmad Siddiqui" />

          <FormField
            label="Email Address"
            type="email"
            defaultValue="admin@clientvault.com"
          />

          <FormField label="Role" defaultValue="Administrator" disabled />

          <FormField label="Timezone" defaultValue="Asia/Karachi" />
        </div>
      </div>
    </SettingsCard>
  );
}

/* ----------------------------------------
   Security
----------------------------------------- */

function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Security"
        description="Protect your ClientVault account and manage authentication."
      >
        <div className="divide-y divide-[var(--border)]">
          <SecurityItem
            icon={<KeyRound size={16} />}
            title="Password"
            description="Change your account password regularly to keep your account secure."
            action={
              <button
                type="button"
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
            action={<Toggle enabled={twoFactor} onChange={setTwoFactor} />}
          />

          <SecurityItem
            icon={<Smartphone size={16} />}
            title="Active Sessions"
            description="Review devices currently signed in to your account."
            action={
              <button
                type="button"
                className="h-8 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition hover:bg-[var(--background)]"
              >
                View Sessions
              </button>
            }
          />
        </div>
      </SettingsCard>

      {/* Security status */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
            <ShieldCheck size={17} className="text-[var(--primary)]" />
          </div>

          <div>
            <p className="text-[12px] font-semibold text-white">
              Security status
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
              Your account security settings will be evaluated once
              authentication and the backend are connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Notifications
----------------------------------------- */

function NotificationSettings() {
  const [renewals, setRenewals] = useState(true);
  const [security, setSecurity] = useState(true);
  const [activity, setActivity] = useState(false);

  return (
    <SettingsCard
      title="Notifications"
      description="Choose which ClientVault events should notify you."
    >
      <div className="divide-y divide-[var(--border)]">
        <NotificationItem
          title="Renewal Reminders"
          description="Receive reminders when domains, hosting or subscriptions are approaching renewal."
          enabled={renewals}
          onChange={setRenewals}
        />

        <NotificationItem
          title="Security Alerts"
          description="Get notified about important security events and suspicious account activity."
          enabled={security}
          onChange={setSecurity}
        />

        <NotificationItem
          title="Activity Notifications"
          description="Receive notifications for important changes made to your clients, projects and credentials."
          enabled={activity}
          onChange={setActivity}
        />
      </div>
    </SettingsCard>
  );
}

/* ----------------------------------------
   Appearance
----------------------------------------- */

function AppearanceSettings() {
  const [theme, setTheme] = useState("dark");

  return (
    <SettingsCard
      title="Appearance"
      description="Customize how ClientVault looks and behaves."
    >
      <div className="space-y-6">
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
              onClick={() => setTheme("dark")}
            />

            <ThemeOption
              value="system"
              label="System"
              icon={<Monitor size={16} />}
              selected={theme === "system"}
              onClick={() => setTheme("system")}
            />

            <ThemeOption
              value="light"
              label="Light"
              icon={<Monitor size={16} />}
              selected={theme === "light"}
              onClick={() => setTheme("light")}
            />
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-5">
          <ToggleRow
            title="Compact Interface"
            description="Use a denser layout to display more information at once."
          />

          <ToggleRow
            title="Animations"
            description="Enable interface transitions and subtle motion effects."
            enabled
          />
        </div>
      </div>
    </SettingsCard>
  );
}

/* ----------------------------------------
   Vault
----------------------------------------- */

function VaultSettings() {
  const [autoLock, setAutoLock] = useState(true);

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Vault"
        description="Configure how ClientVault protects sensitive credential information."
      >
        <div className="divide-y divide-[var(--border)]">
          <NotificationItem
            title="Automatic Vault Lock"
            description="Require vault access to be re-authenticated after a period of inactivity."
            enabled={autoLock}
            onChange={setAutoLock}
          />

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
                  defaultValue="30"
                  className="h-9 min-w-[150px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)]"
                >
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="never">Never</option>
                </select>

                <ChevronRight
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--muted)]"
                />
              </div>
            </div>
          </div>

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
      </SettingsCard>

      {/* Warning */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex items-start gap-3">
          <Clock3 size={17} className="mt-0.5 shrink-0 text-orange-400" />

          <div>
            <p className="text-[12px] font-semibold text-white">
              Vault security
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
              These settings are currently frontend-only. Encryption, vault
              locking and session enforcement will be implemented when we
              connect the authentication and backend systems.
            </p>
          </div>
        </div>
      </div>
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
  type = "text",
  defaultValue,
  disabled = false,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
        {label}
      </span>

      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
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
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <p className="text-[12px] font-medium text-white">{title}</p>

        <p className="mt-1 max-w-xl text-[11px] leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

/* ----------------------------------------
   Toggle
----------------------------------------- */

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        enabled
          ? "bg-[var(--primary)]"
          : "bg-[var(--background)] border border-[var(--border)]"
      }`}
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
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          selected
            ? "bg-[var(--primary)] text-black"
            : "border border-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-medium text-white">{label}</p>

        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
          {value === "dark"
            ? "Always dark"
            : value === "system"
              ? "Use system setting"
              : "Light interface"}
        </p>
      </div>

      {selected && (
        <Check
          size={14}
          className="absolute right-3 top-3 text-[var(--primary)]"
        />
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
}: {
  title: string;
  description: string;
  enabled?: boolean;
}) {
  const [value, setValue] = useState(enabled);

  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <div>
        <p className="text-[12px] font-medium text-white">{title}</p>

        <p className="mt-1 text-[11px] text-[var(--muted)]">{description}</p>
      </div>

      <Toggle enabled={value} onChange={setValue} />
    </div>
  );
}
