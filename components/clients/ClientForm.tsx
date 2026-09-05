"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ClientFormProps = {
  mode?: "create" | "edit";
  clientId?: string;
};

type ClientStatus = "active" | "inactive" | "archived";

type FormData = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  status: "Active" | "Inactive";
  notes: string;
};

type ClientApiResponse = {
  success: boolean;
  message?: string;
  client?: {
    _id: string;
    name: string;
    company?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    status: ClientStatus;
    notes?: string;
  };
};

const defaultClient: FormData = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  status: "Active",
  notes: "",
};

export function ClientForm({ mode = "create", clientId }: ClientFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [formData, setFormData] = useState<FormData>(defaultClient);

  const [isLoadingClient, setIsLoadingClient] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch client when editing.
   */
  useEffect(() => {
    if (!isEdit) {
      setIsLoadingClient(false);
      return;
    }

    if (!clientId) {
      setError("Client ID is missing.");
      setIsLoadingClient(false);
      return;
    }

    let cancelled = false;

    async function fetchClient() {
      try {
        setIsLoadingClient(true);
        setError("");

        const response = await fetch(`/api/clients/${clientId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result: ClientApiResponse = await response.json();

        if (!response.ok || !result.success || !result.client) {
          throw new Error(result.message || "Failed to load client.");
        }

        if (cancelled) return;

        setFormData({
          name: result.client.name || "",
          contactPerson: result.client.contactPerson || "",
          email: result.client.email || "",
          phone: result.client.phone || "",
          website: result.client.website || "",
          address: result.client.address || "",
          status: result.client.status === "inactive" ? "Inactive" : "Active",
          notes: result.client.notes || "",
        });
      } catch (error) {
        console.error("Fetch client error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load client.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingClient(false);
        }
      }
    }

    fetchClient();

    return () => {
      cancelled = true;
    };
  }, [isEdit, clientId]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) return;

    if (isEdit && !clientId) {
      setError("Client ID is missing.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status.toLowerCase() as "active" | "inactive",
        notes: formData.notes.trim() || undefined,
      };

      const endpoint = isEdit ? `/api/clients/${clientId}` : "/api/clients";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ClientApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (isEdit ? "Failed to update client." : "Failed to create client."),
        );
      }

      toast.success(
        isEdit
          ? "Client updated successfully."
          : "Client created successfully.",
      );

      const targetClientId = result.client?._id || clientId;

      if (targetClientId) {
        router.push(`/clients/${targetClientId}`);
      } else {
        router.push("/clients");
      }

      router.refresh();
    } catch (error) {
      console.error(
        isEdit ? "Update client error:" : "Create client error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : isEdit
            ? "Something went wrong while updating the client."
            : "Something went wrong while creating the client.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Loading state for edit mode.
   */
  if (isLoadingClient) {
    return <ClientFormSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Client" : "Add Client"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update the client's information and account details."
                : "Create a new client and keep their information organized."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/clients"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="client-form"
              disabled={isSaving}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Client"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
          <p className="text-[11px] leading-5 text-red-400">{error}</p>
        </div>
      )}

      <form
        id="client-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]"
      >
        {/* Main Content */}
        <div className="space-y-5">
          {/* Basic Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <Building2 size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Basic Information
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    General information about this client.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <FormField
                label="Client Name"
                required
                icon={<Building2 size={14} />}
              >
                <input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. GumJoy"
                  required
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Contact Person" icon={<User size={14} />}>
                <input
                  value={formData.contactPerson}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                  placeholder="e.g. John Smith"
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Email Address" icon={<Mail size={14} />}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="client@example.com"
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Phone Number" icon={<Phone size={14} />}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+44 0000 000000"
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Website"
                icon={<Globe size={14} />}
                className="sm:col-span-2"
              >
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://example.com"
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Address"
                icon={<MapPin size={14} />}
                className="sm:col-span-2"
              >
                <textarea
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter client address"
                  rows={4}
                  disabled={isSaving}
                  className={`${inputClass} min-h-[100px] resize-y py-3`}
                />
              </FormField>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Notes</h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Add internal notes about this client.
              </p>
            </div>

            <div className="p-5">
              <textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add notes about this client..."
                rows={6}
                disabled={isSaving}
                className={`${inputClass} min-h-[140px] resize-y py-3`}
              />
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Client Status
              </h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Control whether this client is active.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as "Active" | "Inactive")
                }
                disabled={isSaving}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </section>

          {/* Quick Info */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-[var(--primary)]" />

              <h2 className="text-[14px] font-semibold text-white">
                Client Record
              </h2>
            </div>

            <div className="space-y-3">
              <InfoRow label="Projects" value="0" />

              <InfoRow label="Credentials" value="0" />

              <InfoRow
                label="Status"
                value={formData.status}
                highlighted={formData.status === "Active"}
              />
            </div>
          </section>

          {/* Form Guidance */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
            <p className="text-[11px] font-medium text-white">About clients</p>

            <p className="mt-2 text-[10px] leading-5 text-[var(--muted)]">
              Clients are the top-level organization in ClientVault. Projects
              and credentials can be associated with each client after it has
              been created.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60";

function FormField({
  label,
  required,
  icon,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}

        <span>{label}</span>

        {required && <span className="text-[var(--primary)]">*</span>}
      </label>

      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <span className="text-[11px] text-[var(--muted)]">{label}</span>

      <span
        className={`text-[11px] font-medium ${
          highlighted ? "text-[var(--primary)]" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ClientFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1120px] animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 h-4 w-28 rounded bg-white/[0.05]" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-7 w-36 rounded bg-white/[0.06]" />

            <div className="mt-2 h-3 w-72 rounded bg-white/[0.04]" />
          </div>

          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-lg bg-white/[0.04]" />
            <div className="h-9 w-28 rounded-lg bg-white/[0.06]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SkeletonSection large />
          <SkeletonSection large={false} />
        </div>

        <div className="space-y-5">
          <SkeletonSection large={false} />
          <SkeletonSection large={false} />
          <SkeletonSection large={false} />
        </div>
      </div>
    </div>
  );
}

function SkeletonSection({ large }: { large: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="h-4 w-32 rounded bg-white/[0.06]" />
      <div className="mt-2 h-3 w-52 rounded bg-white/[0.04]" />

      <div
        className={
          large
            ? "mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
            : "mt-6 space-y-4"
        }
      >
        {Array.from({ length: large ? 6 : 3 }).map((_, index) => (
          <div
            key={index}
            className={large && index >= 4 ? "sm:col-span-2" : ""}
          >
            <div className="mb-2 h-3 w-24 rounded bg-white/[0.04]" />
            <div className="h-10 w-full rounded-lg bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
