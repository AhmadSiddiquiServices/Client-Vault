"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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

type ClientFormProps = {
  mode?: "create" | "edit";
  client?: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    status: "Active" | "Inactive";
    notes: string;
  };
};

const defaultClient = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  status: "Active" as const,
  notes: "",
};

export function ClientForm({ mode = "create", client }: ClientFormProps) {
  const [formData, setFormData] = useState(client ?? defaultClient);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEdit = mode === "edit";

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setSaved(false);

    // Mock save for now.
    // API/database integration will be added later.
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
    }, 700);
  };

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

      {/* Saved Message */}
      {saved && (
        <div className="mb-5 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 text-[12px] text-[var(--primary)]">
          {isEdit
            ? "Client information has been updated successfully."
            : "Client has been created successfully."}
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
                  className={inputClass}
                />
              </FormField>

              <FormField label="Contact Person" icon={<User size={14} />}>
                <input
                  value={formData.contactPerson}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                  placeholder="e.g. John Smith"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Email Address" icon={<Mail size={14} />}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="client@example.com"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Phone Number" icon={<Phone size={14} />}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+44 0000 000000"
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
              <InfoRow label="Projects" value={isEdit ? "2" : "0"} />
              <InfoRow label="Credentials" value={isEdit ? "18" : "0"} />
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
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";

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
