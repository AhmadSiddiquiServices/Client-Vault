"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LockKeyhole,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  User,
} from "lucide-react";

type CredentialStatus = "Active" | "Inactive";

type CustomField = {
  id: string;
  label: string;
  value: string;
  type: "text" | "password" | "url";
};

type CredentialFormData = {
  name: string;
  category: string;
  clientId: string;
  projectId: string;
  username: string;
  password: string;
  website: string;
  tags: string[];
  notes: string;
  customFields: CustomField[];
  favorite: boolean;
  status: CredentialStatus;
};

type CredentialFormProps = {
  mode?: "create" | "edit";
  credential?: CredentialFormData;
};

const clients = [
  {
    id: "1",
    name: "GumJoy",
  },
  {
    id: "2",
    name: "Wilder Side of Sports",
  },
  {
    id: "3",
    name: "SyncSurge Agency",
  },
  {
    id: "4",
    name: "Afrosmile Backpackers",
  },
  {
    id: "5",
    name: "Eastern Kitchenware",
  },
  {
    id: "6",
    name: "HomeChoice",
  },
];

const projects = [
  {
    id: "1",
    clientId: "1",
    name: "GumJoy E-Commerce Website",
  },
  {
    id: "2",
    clientId: "1",
    name: "GumJoy Marketing",
  },
  {
    id: "3",
    clientId: "2",
    name: "Wilder Side Website",
  },
  {
    id: "4",
    clientId: "2",
    name: "Wilder Side Admin",
  },
  {
    id: "5",
    clientId: "3",
    name: "SyncSurge Agency Website",
  },
  {
    id: "6",
    clientId: "4",
    name: "Afrosmile Website",
  },
  {
    id: "7",
    clientId: "5",
    name: "Eastern Kitchenware Website",
  },
  {
    id: "8",
    clientId: "6",
    name: "HomeChoice Website",
  },
];

const categories = [
  "E-Commerce",
  "Development",
  "Hosting",
  "Database",
  "Domain / DNS",
  "Analytics",
  "CMS",
  "Email",
  "Social Media",
  "Storage / Media",
  "Security",
  "API",
];

const defaultCredential: CredentialFormData = {
  name: "",
  category: "Development",
  clientId: "",
  projectId: "",
  username: "",
  password: "",
  website: "",
  tags: [],
  notes: "",
  customFields: [],
  favorite: false,
  status: "Active",
};

export function CredentialForm({
  mode = "create",
  credential,
}: CredentialFormProps) {
  const [formData, setFormData] = useState<CredentialFormData>(
    credential ?? defaultCredential,
  );

  const [tagInput, setTagInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEdit = mode === "edit";

  const availableProjects = useMemo(() => {
    if (!formData.clientId) {
      return [];
    }

    return projects.filter((project) => project.clientId === formData.clientId);
  }, [formData.clientId]);

  const selectedClient = clients.find(
    (client) => client.id === formData.clientId,
  );

  const selectedProject = projects.find(
    (project) => project.id === formData.projectId,
  );

  const updateField = <K extends keyof CredentialFormData>(
    field: K,
    value: CredentialFormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleClientChange = (clientId: string) => {
    setFormData((prev) => ({
      ...prev,
      clientId,
      projectId: "",
    }));

    setSaved(false);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();

    if (!tag) return;

    if (formData.tags.includes(tag)) {
      setTagInput("");
      return;
    }

    updateField("tags", [...formData.tags, tag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: "",
      value: "",
      type: "text",
    };

    updateField("customFields", [...formData.customFields, newField]);
  };

  const updateCustomField = (
    id: string,
    field: keyof CustomField,
    value: string,
  ) => {
    updateField(
      "customFields",
      formData.customFields.map((customField) =>
        customField.id === id
          ? {
              ...customField,
              [field]: value,
            }
          : customField,
      ),
    );
  };

  const removeCustomField = (id: string) => {
    updateField(
      "customFields",
      formData.customFields.filter((customField) => customField.id !== id),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.clientId ||
      !formData.username.trim() ||
      !formData.password
    ) {
      return;
    }

    setIsSaving(true);
    setSaved(false);

    // Mock save for now.
    // Backend encryption + API integration will be added later.
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
    }, 700);
  };

  return (
    <div className="mx-auto w-full max-w-[1160px]">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/credentials"
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Credentials
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Credential" : "Add Credential"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update this credential and its secure vault information."
                : "Store a secure credential for a client project."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/credentials"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="credential-form"
              disabled={
                isSaving ||
                !formData.name.trim() ||
                !formData.clientId ||
                !formData.username.trim() ||
                !formData.password
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Credential"}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Message */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 text-[12px] text-[var(--primary)]">
          <Check size={15} />

          {isEdit
            ? "Credential has been updated successfully."
            : "Credential has been created successfully."}
        </div>
      )}

      <form
        id="credential-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]"
      >
        {/* Main Content */}
        <div className="space-y-5">
          {/* Credential Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <KeyRound size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Credential Information
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Basic information about this credential.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {/* Name */}
              <FormField
                label="Credential Name"
                required
                icon={<KeyRound size={14} />}
              >
                <input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Shopify Admin"
                  required
                  className={inputClass}
                />
              </FormField>

              {/* Category */}
              <FormField label="Category" required icon={<Tag size={14} />}>
                <select
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Client */}
              <FormField label="Client" required icon={<Building2 size={14} />}>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a client</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Project */}
              <FormField label="Project" icon={<FolderIcon />}>
                <select
                  value={formData.projectId}
                  onChange={(e) => updateField("projectId", e.target.value)}
                  disabled={!formData.clientId}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">
                    {formData.clientId
                      ? "Select a project"
                      : "Select a client first"}
                  </option>

                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          {/* Login Credentials */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <LockKeyhole size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Login Credentials
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Sensitive authentication information.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {/* Username */}
              <FormField
                label="Username / Email"
                required
                icon={<User size={14} />}
              >
                <input
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="off"
                  required
                  className={inputClass}
                />
              </FormField>

              {/* Password */}
              <FormField
                label="Password"
                required
                icon={<LockKeyhole size={14} />}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>

              {/* Website */}
              <FormField
                label="Website / Login URL"
                icon={<Globe size={14} />}
                className="sm:col-span-2"
              >
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://admin.example.com"
                  className={inputClass}
                />
              </FormField>
            </div>

            {/* Security Notice */}
            <div className="mx-5 mb-5 flex gap-3 rounded-lg border border-[var(--primary)]/15 bg-[var(--primary-soft)]/50 p-3.5">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[var(--primary)]"
              />

              <p className="text-[10px] leading-5 text-[var(--muted)]">
                Passwords will be encrypted before being stored in the vault
                once backend security is implemented.
              </p>
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <Tag size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">Tags</h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Add tags to organize and filter credentials.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Credential Tags
              </label>

              <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2 py-1 text-[10px] font-medium text-[var(--primary)]"
                  >
                    {tag}

                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-[var(--primary)]/60 transition-colors hover:text-[var(--primary)]"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTag}
                  placeholder={
                    formData.tags.length === 0
                      ? "Type a tag and press Enter..."
                      : "Add another tag..."
                  }
                  className="h-7 min-w-[160px] flex-1 bg-transparent px-1 text-[11px] text-white outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <p className="mt-2 text-[10px] text-[var(--muted)]">
                Press Enter or comma to add a tag.
              </p>
            </div>
          </section>

          {/* Custom Fields */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-white">
                  Custom Fields
                </h2>

                <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                  Store additional service-specific information.
                </p>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-[11px] font-medium text-white transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03]"
              >
                <Plus size={13} />
                Add Field
              </button>
            </div>

            <div className="p-5">
              {formData.customFields.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-5 py-8 text-center">
                  <p className="text-[11px] font-medium text-white">
                    No custom fields
                  </p>

                  <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-5 text-[var(--muted)]">
                    Add custom fields when a service requires information beyond
                    username, password and website.
                  </p>

                  <button
                    type="button"
                    onClick={addCustomField}
                    className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-[11px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)]"
                  >
                    <Plus size={13} />
                    Add Custom Field
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.customFields.map((field, index) => (
                    <CustomFieldRow
                      key={field.id}
                      field={field}
                      index={index}
                      onChange={updateCustomField}
                      onRemove={removeCustomField}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Notes</h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Add internal notes about this credential.
              </p>
            </div>

            <div className="p-5">
              <textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add notes about this credential..."
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
                Credential Status
              </h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Control whether this credential is active.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as CredentialStatus)
                }
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </section>

          {/* Favorite */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <button
              type="button"
              onClick={() => updateField("favorite", !formData.favorite)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  formData.favorite
                    ? "bg-[var(--primary-soft)]"
                    : "bg-white/[0.03]"
                }`}
              >
                <Star
                  size={16}
                  className={
                    formData.favorite
                      ? "fill-current text-[var(--primary)]"
                      : "text-[var(--muted)]"
                  }
                />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-white">
                  Favorite Credential
                </p>

                <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                  Keep this credential easy to find.
                </p>
              </div>

              <div
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                  formData.favorite ? "bg-[var(--primary)]" : "bg-[#30383d]"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.favorite ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </section>

          {/* Relationship */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-[var(--primary)]" />

              <h2 className="text-[14px] font-semibold text-white">
                Relationship
              </h2>
            </div>

            <div className="space-y-3">
              <RelationshipRow
                label="Client"
                value={selectedClient?.name ?? "Not selected"}
              />

              <RelationshipRow
                label="Project"
                value={selectedProject?.name ?? "Not selected"}
              />

              <RelationshipRow label="Category" value={formData.category} />
            </div>
          </section>

          {/* Security */}
          <section className="rounded-xl border border-[var(--primary)]/15 bg-[var(--primary-soft)]/40 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--primary)]"
              />

              <div>
                <p className="text-[11px] font-medium text-white">
                  Vault protected
                </p>

                <p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">
                  Credential secrets will be encrypted at rest once the backend
                  vault security layer is implemented.
                </p>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

function CustomFieldRow({
  field,
  index,
  onChange,
  onRemove,
}: {
  field: CustomField;
  index: number;
  onChange: (id: string, field: keyof CustomField, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium text-white">
          Custom Field {index + 1}
        </p>

        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Remove custom field ${index + 1}`}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_130px]">
        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Field Name
          </label>

          <input
            value={field.label}
            onChange={(e) => onChange(field.id, "label", e.target.value)}
            placeholder="e.g. Store ID"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Value
          </label>

          <input
            type={field.type === "password" ? "password" : "text"}
            value={field.value}
            onChange={(e) => onChange(field.id, "value", e.target.value)}
            placeholder="Enter value"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Field Type
          </label>

          <select
            value={field.type}
            onChange={(e) => onChange(field.id, "type", e.target.value)}
            className={inputClass}
          >
            <option value="text">Text</option>
            <option value="password">Password</option>
            <option value="url">URL</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function RelationshipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <p className="text-[10px] text-[var(--muted)]">{label}</p>

      <p className="mt-1 text-[11px] font-medium text-white">{value}</p>
    </div>
  );
}

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

function FolderIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 10h18" />
    </svg>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";
