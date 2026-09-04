"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  MoreVertical,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const credential = {
  id: "cred-1",
  name: "Shopify Admin",
  category: "E-Commerce",

  client: "GumJoy",
  clientId: "1",

  project: "GumJoy E-Commerce Website",
  projectId: "1",

  username: "admin@gumjoy.co.uk",
  password: "GumJoy_Admin_2026!",
  website: "https://admin.shopify.com",

  tags: ["shopify", "admin", "production"],

  notes:
    "Main Shopify administrator account used for managing products, orders, customers, discounts and store settings.",

  customFields: [
    {
      label: "Store URL",
      value: "https://gumjoy.myshopify.com",
    },
    {
      label: "Store Name",
      value: "GumJoy",
    },
    {
      label: "Account Type",
      value: "Administrator",
    },
  ],

  created: "May 15, 2024",
  updated: "2 hours ago",
  lastViewed: "Today, 2 hours ago",
};

const activity = [
  {
    action: "Credential updated",
    description: "Password was updated",
    time: "2 hours ago",
  },
  {
    action: "Credential viewed",
    description: "Credential details were viewed",
    time: "Yesterday",
  },
  {
    action: "Credential created",
    description: "Credential was added to the project",
    time: "May 15, 2024",
  },
];

export default function CredentialDetailPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(true);

  const copyValue = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch {
      // Clipboard access may be unavailable in some environments.
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <Link href="/credentials" className="transition hover:text-white">
          Credentials
        </Link>

        <ChevronRight size={13} />

        <span className="text-white">{credential.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/credentials"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <KeyRound size={19} className="text-[var(--primary)]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                {credential.name}
              </h1>

              <button
                type="button"
                onClick={() => setFavorite((value) => !value)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white"
                title={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  size={15}
                  fill={favorite ? "currentColor" : "none"}
                  className={favorite ? "text-[var(--primary)]" : ""}
                />
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
              <span className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1">
                {credential.category}
              </span>

              <span>•</span>

              <Link
                href={`/clients/${credential.clientId}`}
                className="transition hover:text-[var(--primary)]"
              >
                {credential.client}
              </Link>

              <span>•</span>

              <Link
                href={`/projects/${credential.projectId}`}
                className="transition hover:text-[var(--primary)]"
              >
                {credential.project}
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/credentials/${credential.id}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-[14px] text-white transition hover:bg-[var(--background)]"
          >
            <Edit3 size={14} />
            Edit
          </Link>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Delete
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition hover:text-white"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Security banner */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          <ShieldCheck size={16} className="text-[var(--primary)]" />
        </div>

        <div>
          <p className="text-[12px] font-medium text-white">
            Secure credential
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            Sensitive values are hidden by default. Only reveal them when
            necessary.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Login credentials */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Login Credentials
                </h2>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Primary authentication details for this credential.
                </p>
              </div>
            </div>

            <div className="space-y-1 px-5 py-2">
              <CredentialField
                label="Username / Email"
                value={credential.username}
                onCopy={() => copyValue(credential.username, "username")}
                copied={copiedField === "username"}
              />

              <div className="flex flex-col gap-2 border-b border-[var(--border)] py-4 sm:flex-row sm:items-center">
                <div className="w-full shrink-0 sm:w-[160px]">
                  <p className="text-[11px] font-medium text-[var(--muted)]">
                    Password
                  </p>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                    <span className="block truncate font-mono text-[12px] text-white">
                      {showPassword ? credential.password : "••••••••••••••••"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    title={showPassword ? "Hide password" : "Reveal password"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyValue(credential.password, "password")}
                    title="Copy password"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
                  >
                    {copiedField === "password" ? (
                      <Check size={14} className="text-[var(--primary)]" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              <CredentialField
                label="Website"
                value={credential.website}
                external
                onCopy={() => copyValue(credential.website, "website")}
                copied={copiedField === "website"}
              />
            </div>
          </section>

          {/* Custom fields */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Custom Fields
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Additional information associated with this credential.
              </p>
            </div>

            <div className="px-5 py-2">
              {credential.customFields.map((field) => (
                <CredentialField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  onCopy={() => copyValue(field.value, field.label)}
                  copied={copiedField === field.label}
                />
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Notes</h2>
            </div>

            <div className="px-5 py-4">
              <p className="text-[12px] leading-6 text-[var(--muted)]">
                {credential.notes}
              </p>
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Credential information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Credential Information
              </h2>
            </div>

            <div className="space-y-4 px-5 py-4">
              <InfoRow
                label="Client"
                value={
                  <Link
                    href={`/clients/${credential.clientId}`}
                    className="text-white transition hover:text-[var(--primary)]"
                  >
                    {credential.client}
                  </Link>
                }
              />

              <InfoRow
                label="Project"
                value={
                  <Link
                    href={`/projects/${credential.projectId}`}
                    className="text-white transition hover:text-[var(--primary)]"
                  >
                    {credential.project}
                  </Link>
                }
              />

              <InfoRow label="Category" value={credential.category} />

              <InfoRow label="Created" value={credential.created} />

              <InfoRow label="Last Updated" value={credential.updated} />

              <InfoRow label="Last Viewed" value={credential.lastViewed} />
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Tags</h2>
            </div>

            <div className="flex flex-wrap gap-2 px-5 py-4">
              {credential.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Recent Activity
              </h2>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {activity.map((item) => (
                <div
                  key={`${item.action}-${item.time}`}
                  className="px-5 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />

                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-white">
                        {item.action}
                      </p>

                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        {item.description}
                      </p>

                      <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-3">
              <button
                type="button"
                className="text-[11px] font-medium text-[var(--primary)] transition hover:text-white"
              >
                View all activity
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Credential Field
----------------------------------------- */

function CredentialField({
  label,
  value,
  external = false,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  external?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center">
      <div className="w-full shrink-0 sm:w-[160px]">
        <p className="text-[11px] font-medium text-[var(--muted)]">{label}</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          {external ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-2 text-[12px] text-white transition hover:text-[var(--primary)]"
            >
              <span className="truncate">{value}</span>
              <ExternalLink
                size={12}
                className="shrink-0 text-[var(--muted)]"
              />
            </a>
          ) : (
            <span className="block truncate text-[12px] text-white">
              {value}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onCopy}
          title={`Copy ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
        >
          {copied ? (
            <Check size={14} className="text-[var(--primary)]" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Info Row
----------------------------------------- */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-[var(--muted)]">{label}</span>

      <div className="max-w-[190px] text-right text-[11px] text-white">
        {value}
      </div>
    </div>
  );
}
