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
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CredentialClient = {
  _id: string;
  name: string;
  company?: string;
};

type CredentialProject = {
  _id: string;
  name: string;
  type?: string;
  status?: string;
};

type CredentialCategory = {
  _id: string;
  name: string;
  color?: string;
};

type CredentialTag = {
  _id: string;
  name: string;
};

type CredentialCustomField = {
  label: string;
  value: string;
  isSecret?: boolean;
};

type CredentialDetail = {
  _id: string;
  name: string;
  client: CredentialClient | null;
  projects: CredentialProject[];
  category: CredentialCategory | null;

  username?: string;
  url?: string;
  notes?: string;

  tags: CredentialTag[];

  customFields: CredentialCustomField[];

  isFavorite: boolean;
  isShared: boolean;

  hasSecret?: boolean;

  createdAt: string;
  updatedAt: string;
};

type CredentialResponse = {
  success: boolean;
  message?: string;
  credential?: CredentialDetail;
};

type SecretResponse = {
  success: boolean;
  message?: string;
  value?: string;
};

type ActivityItem = {
  _id: string;
  action: string;
  description?: string;
  createdAt: string;
};

type ActivityResponse = {
  success: boolean;
  message?: string;
  activities?: ActivityItem[];
};

export default function CredentialDetailPage() {
  const params = useParams<{ credentialId: string }>();
  const router = useRouter();

  const credentialId = params.credentialId;

  const [credential, setCredential] = useState<CredentialDetail | null>(null);

  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);

  const [revealedCustomFields, setRevealedCustomFields] = useState<
    Record<number, string>
  >({});

  const [copiedField, setCopiedField] = useState<string | null>(null);

  /*
   * ----------------------------------------
   * Load Credential
   * ----------------------------------------
   */

  useEffect(() => {
    if (!credentialId) {
      return;
    }

    const loadCredential = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/credentials/${credentialId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: CredentialResponse = await response.json();

        if (!response.ok || !data.success || !data.credential) {
          throw new Error(data.message || "Failed to load credential.");
        }

        setCredential(data.credential);
      } catch (error) {
        console.error("Load credential detail error:", error);

        toast.error(
          error instanceof Error ? error.message : "Failed to load credential.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCredential();
  }, [credentialId]);

  /*
   * ----------------------------------------
   * Load Activity
   * ----------------------------------------
   *
   * This uses the existing activity API if
   * it accepts entity/entityId filtering.
   */

  useEffect(() => {
    if (!credentialId) {
      return;
    }

    const loadActivity = async () => {
      try {
        setIsActivityLoading(true);

        const response = await fetch(
          `/api/activity?entity=credential&entityId=${credentialId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setActivity([]);
          return;
        }

        const data: ActivityResponse = await response.json();

        if (!data.success) {
          setActivity([]);
          return;
        }

        setActivity(data.activities ?? []);
      } catch (error) {
        console.error("Load credential activity error:", error);

        setActivity([]);
      } finally {
        setIsActivityLoading(false);
      }
    };

    loadActivity();
  }, [credentialId]);

  /*
   * ----------------------------------------
   * Date Formatting
   * ----------------------------------------
   */

  const formatDate = (value: string) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
   * ----------------------------------------
   * Secret Reveal
   * ----------------------------------------
   */

  const revealSecret = async () => {
    try {
      if (revealedPassword !== null) {
        setShowPassword((value) => !value);
        return;
      }

      const response = await fetch(`/api/credentials/${credentialId}/reveal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "secret",
        }),
      });

      const data: SecretResponse = await response.json();

      if (!response.ok || !data.success || data.value === undefined) {
        throw new Error(data.message || "Failed to reveal credential secret.");
      }

      setRevealedPassword(data.value);
      setShowPassword(true);
    } catch (error) {
      console.error("Reveal secret error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to reveal secret.",
      );
    }
  };

  /*
   * ----------------------------------------
   * Custom Secret Reveal
   * ----------------------------------------
   */

  const revealCustomField = async (index: number) => {
    try {
      if (revealedCustomFields[index] !== undefined) {
        setRevealedCustomFields((previous) => {
          const next = { ...previous };

          delete next[index];

          return next;
        });

        return;
      }

      const response = await fetch(`/api/credentials/${credentialId}/reveal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "customField",
          index,
        }),
      });

      const data: SecretResponse = await response.json();

      if (!response.ok || !data.success || data.value === undefined) {
        throw new Error(data.message || "Failed to reveal custom field.");
      }

      setRevealedCustomFields((previous) => ({
        ...previous,
        [index]: data.value as string,
      }));
    } catch (error) {
      console.error("Reveal custom field error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reveal custom field.",
      );
    }
  };

  /*
   * ----------------------------------------
   * Copy Helpers
   * ----------------------------------------
   */

  const markCopied = (field: string) => {
    setCopiedField(field);

    window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
    }, 1500);
  };

  const copyPlainValue = async (value: string, field: string) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      markCopied(field);
    } catch (error) {
      console.error("Clipboard error:", error);

      toast.error("Unable to copy value.");
    }
  };

  const copySecret = async () => {
    try {
      const response = await fetch(`/api/credentials/${credentialId}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "secret",
        }),
      });

      const data: SecretResponse = await response.json();

      if (!response.ok || !data.success || data.value === undefined) {
        throw new Error(data.message || "Failed to copy credential secret.");
      }

      await navigator.clipboard.writeText(data.value);

      markCopied("password");
    } catch (error) {
      console.error("Copy secret error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to copy secret.",
      );
    }
  };

  const copyCredential = async () => {
    if (!credential || !credential.username || !credential.hasSecret) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/${credentialId}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "secret",
        }),
      });

      const data: SecretResponse = await response.json();

      if (!response.ok || !data.success || data.value === undefined) {
        throw new Error(data.message || "Failed to copy credential.");
      }

      const credentialText = `${credential.name} Login:
Username: ${credential.username}
Password: ${data.value}`;

      await navigator.clipboard.writeText(credentialText);

      markCopied("credential-login");
    } catch (error) {
      console.error("Copy credential error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to copy credential.",
      );
    }
  };

  const copyCustomField = async (index: number) => {
    const field = credential?.customFields[index];

    if (!field) {
      return;
    }

    try {
      if (field.isSecret) {
        const response = await fetch(`/api/credentials/${credentialId}/copy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: "customField",
            index,
          }),
        });

        const data: SecretResponse = await response.json();

        if (!response.ok || !data.success || data.value === undefined) {
          throw new Error(data.message || "Failed to copy custom field.");
        }

        await navigator.clipboard.writeText(data.value);
      } else {
        await navigator.clipboard.writeText(field.value);
      }

      markCopied(`custom-${index}`);
    } catch (error) {
      console.error("Copy custom field error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to copy custom field.",
      );
    }
  };

  /*
   * ----------------------------------------
   * Favorite
   * ----------------------------------------
   */

  const toggleFavorite = async () => {
    if (!credential) {
      return;
    }

    const nextValue = !credential.isFavorite;

    setCredential((previous) =>
      previous
        ? {
            ...previous,
            isFavorite: nextValue,
          }
        : previous,
    );

    try {
      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isFavorite: nextValue,
        }),
      });

      const data: CredentialResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update favorite.");
      }
    } catch (error) {
      console.error("Favorite update error:", error);

      setCredential((previous) =>
        previous
          ? {
              ...previous,
              isFavorite: !nextValue,
            }
          : previous,
      );

      toast.error(
        error instanceof Error ? error.message : "Failed to update favorite.",
      );
    }
  };

  /*
   * ----------------------------------------
   * Delete
   * ----------------------------------------
   */

  const handleDelete = async () => {
    if (!credential || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${credential.name}" permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete credential.");
      }

      toast.success("Credential deleted successfully.");

      router.push("/credentials");
      router.refresh();
    } catch (error) {
      console.error("Delete credential error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete credential.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleProjects = useMemo(
    () => credential?.projects ?? [],
    [credential],
  );

  /*
   * ----------------------------------------
   * Loading
   * ----------------------------------------
   */

  if (isLoading) {
    return <CredentialDetailSkeleton />;
  }

  if (!credential) {
    return (
      <div className="mx-auto w-full max-w-[1160px]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
          <KeyRound size={22} className="mx-auto text-[var(--muted)]" />

          <h1 className="mt-4 text-[15px] font-semibold text-white">
            Credential not found
          </h1>

          <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-5 text-[var(--muted)]">
            This credential may have been deleted or you may not have permission
            to access it.
          </p>

          <Link
            href="/credentials"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black"
          >
            <ArrowLeft size={14} />
            Back to Credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <Link href="/credentials" className="transition hover:text-white">
          Credentials
        </Link>

        <ChevronRight size={13} />

        <span className="truncate text-white">{credential.name}</span>
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
                onClick={toggleFavorite}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white"
                title={
                  credential.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star
                  size={15}
                  fill={credential.isFavorite ? "currentColor" : "none"}
                  className={
                    credential.isFavorite ? "text-[var(--primary)]" : ""
                  }
                />
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
              {credential.category && (
                <>
                  <span className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1">
                    {credential.category.name}
                  </span>

                  <span>•</span>
                </>
              )}

              {credential.client && (
                <>
                  <Link
                    href={`/clients/${credential.client._id}`}
                    className="transition hover:text-[var(--primary)]"
                  >
                    {credential.client.name}
                  </Link>

                  {visibleProjects.length > 0 && <span>•</span>}
                </>
              )}

              {visibleProjects.map((project, index) => (
                <span key={project._id} className="flex items-center gap-2">
                  {index > 0 && <span>•</span>}

                  <Link
                    href={`/projects/${project._id}`}
                    className="transition hover:text-[var(--primary)]"
                  >
                    {project.name}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/credentials/${credentialId}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-white transition hover:bg-[var(--background)]"
          >
            <Edit3 size={14} />
            Edit
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Security Banner */}
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

      {/* Main Content */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Login Credentials */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            {/* <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Login Credentials
                </h2>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Primary authentication details for this credential.
                </p>
              </div>
            </div> */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Login Credentials
                </h2>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Primary authentication details for this credential.
                </p>
              </div>

              <button
                type="button"
                onClick={copyCredential}
                disabled={!credential.username || !credential.hasSecret}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[11px] font-medium text-[var(--muted)] transition hover:border-[var(--border-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="Copy login credentials"
              >
                {copiedField === "credential-login" ? (
                  <>
                    <Check size={13} className="text-[var(--primary)]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1 px-5 py-2">
              <CredentialField
                label="Username / Email"
                value={credential.username || "—"}
                onCopy={
                  credential.username
                    ? () =>
                        copyPlainValue(
                          credential.username as string,
                          "username",
                        )
                    : undefined
                }
                copied={copiedField === "username"}
              />

              {/* Secret */}
              <div className="flex flex-col gap-2 border-b border-[var(--border)] py-4 sm:flex-row sm:items-center">
                <div className="w-full shrink-0 sm:w-[160px]">
                  <p className="text-[11px] font-medium text-[var(--muted)]">
                    Password / Secret
                  </p>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                    <span className="block truncate font-mono text-[12px] text-white">
                      {showPassword && revealedPassword !== null
                        ? revealedPassword
                        : "••••••••••••••••"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={revealSecret}
                    title={showPassword ? "Hide secret" : "Reveal secret"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={copySecret}
                    title="Copy secret"
                    disabled={!credential.hasSecret}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                label="Website / Login URL"
                value={credential.url || "—"}
                external={Boolean(credential.url)}
                onCopy={
                  credential.url
                    ? () => copyPlainValue(credential.url as string, "website")
                    : undefined
                }
                copied={copiedField === "website"}
              />
            </div>
          </section>

          {/* Custom Fields */}
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
              {credential.customFields.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[11px] text-[var(--muted)]">
                    No custom fields.
                  </p>
                </div>
              ) : (
                credential.customFields.map((field, index) => {
                  const isSecret = Boolean(field.isSecret);

                  const displayedValue = isSecret
                    ? (revealedCustomFields[index] ?? "••••••••••••••••")
                    : field.value || "—";

                  return (
                    <CredentialField
                      key={`${field.label}-${index}`}
                      label={field.label}
                      value={displayedValue}
                      isSecret={isSecret}
                      revealed={revealedCustomFields[index] !== undefined}
                      onReveal={
                        isSecret ? () => revealCustomField(index) : undefined
                      }
                      onCopy={() => copyCustomField(index)}
                      copied={copiedField === `custom-${index}`}
                    />
                  );
                })
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Notes</h2>
            </div>

            <div className="px-5 py-4">
              {credential.notes ? (
                <p className="whitespace-pre-wrap text-[12px] leading-6 text-[var(--muted)]">
                  {credential.notes}
                </p>
              ) : (
                <p className="text-[11px] text-[var(--muted)]">
                  No notes added.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Credential Information */}
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
                  credential.client ? (
                    <Link
                      href={`/clients/${credential.client._id}`}
                      className="text-white transition hover:text-[var(--primary)]"
                    >
                      {credential.client.name}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />

              <InfoRow
                label={
                  credential.projects.length === 1 ? "Project" : "Projects"
                }
                value={
                  credential.projects.length > 0 ? (
                    <div className="space-y-1 text-right">
                      {credential.projects.map((project) => (
                        <Link
                          key={project._id}
                          href={`/projects/${project._id}`}
                          className="block text-white transition hover:text-[var(--primary)]"
                        >
                          {project.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )
                }
              />

              <InfoRow
                label="Category"
                value={credential.category?.name ?? "—"}
              />

              <InfoRow
                label="Access"
                value={credential.isShared ? "Shared" : "Project Credential"}
              />

              <InfoRow
                label="Created"
                value={formatDateTime(credential.createdAt)}
              />

              <InfoRow
                label="Last Updated"
                value={formatDateTime(credential.updatedAt)}
              />
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Tags</h2>
            </div>

            <div className="flex flex-wrap gap-2 px-5 py-4">
              {credential.tags.length > 0 ? (
                credential.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted)]"
                  >
                    #{tag.name}
                  </span>
                ))
              ) : (
                <p className="text-[11px] text-[var(--muted)]">
                  No tags added.
                </p>
              )}
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Recent Activity
              </h2>
            </div>

            {isActivityLoading ? (
              <div className="space-y-4 px-5 py-5">
                <ActivitySkeleton />
                <ActivitySkeleton />
                <ActivitySkeleton />
              </div>
            ) : activity.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {activity.slice(0, 5).map((item) => (
                  <div key={item._id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-white">
                          {formatActivityAction(item.action)}
                        </p>

                        {item.description && (
                          <p className="mt-1 text-[10px] text-[var(--muted)]">
                            {item.description}
                          </p>
                        )}

                        <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-[11px] text-[var(--muted)]">
                  No activity recorded yet.
                </p>
              </div>
            )}
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
  isSecret = false,
  revealed = false,
  onReveal,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  external?: boolean;
  isSecret?: boolean;
  revealed?: boolean;
  onReveal?: () => void;
  onCopy?: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center">
      <div className="w-full shrink-0 sm:w-[160px]">
        <p className="text-[11px] font-medium text-[var(--muted)]">{label}</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          {external && value !== "—" ? (
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
            <span
              className={`block truncate ${
                isSecret ? "font-mono text-[12px]" : "text-[12px]"
              } text-white`}
            >
              {value}
            </span>
          )}
        </div>

        {isSecret && onReveal && (
          <button
            type="button"
            onClick={onReveal}
            title={revealed ? "Hide secret" : "Reveal secret"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        {onCopy && value !== "—" && (
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
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Info Row
----------------------------------------- */

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-[var(--muted)]">{label}</span>

      <div className="max-w-[190px] text-right text-[11px] text-white">
        {value}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Activity Helpers
----------------------------------------- */

function formatActivityAction(action: string) {
  const map: Record<string, string> = {
    created: "Credential created",
    updated: "Credential updated",
    deleted: "Credential deleted",
    viewed: "Credential viewed",
    copied: "Credential copied",
    archived: "Credential archived",
    restored: "Credential restored",
  };

  return map[action] ?? action;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diff = Date.now() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ----------------------------------------
   Activity Skeleton
----------------------------------------- */

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-white/[0.08]" />

      <div className="flex-1">
        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-2 h-2.5 w-40 animate-pulse rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

/* ----------------------------------------
   Page Skeleton
----------------------------------------- */

function CredentialDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-3.5 w-40 animate-pulse rounded bg-white/[0.06]" />

      <div className="flex items-start gap-4">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-white/[0.06]" />

        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>

      <div className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="h-[285px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[220px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[180px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>

        <div className="space-y-5">
          <div className="h-[310px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[150px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[300px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>
    </div>
  );
}
