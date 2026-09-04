"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  FolderKanban,
  Globe,
  Info,
  Save,
  Tag,
} from "lucide-react";

type ProjectStatus = "Active" | "Inactive" | "Archived";

type ProjectFormData = {
  name: string;
  clientId: string;
  type: string;
  url: string;
  status: ProjectStatus;
  description: string;
  tags: string[];
};

type ProjectFormProps = {
  mode?: "create" | "edit";
  project?: ProjectFormData;
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

const projectTypes = [
  "Website",
  "Shopify Store",
  "Mobile App",
  "API",
  "SaaS",
  "Internal System",
  "Server",
];

const defaultProject: ProjectFormData = {
  name: "",
  clientId: "",
  type: "Website",
  url: "",
  status: "Active",
  description: "",
  tags: [],
};

export function ProjectForm({ mode = "create", project }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    project ?? defaultProject,
  );

  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEdit = mode === "edit";

  const updateField = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.clientId) {
      return;
    }

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
          href="/projects"
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Project" : "Add Project"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update the project information and client relationship."
                : "Create a project and associate it with a client."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="project-form"
              disabled={isSaving || !formData.name.trim() || !formData.clientId}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Project"}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Message */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 text-[12px] text-[var(--primary)]">
          <Check size={15} />

          {isEdit
            ? "Project has been updated successfully."
            : "Project has been created successfully."}
        </div>
      )}

      <form
        id="project-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]"
      >
        {/* Main */}
        <div className="space-y-5">
          {/* Project Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <FolderKanban size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Project Information
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Basic details about this project.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {/* Project Name */}
              <FormField
                label="Project Name"
                required
                icon={<FolderKanban size={14} />}
              >
                <input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. GumJoy E-Commerce Website"
                  required
                  className={inputClass}
                />
              </FormField>

              {/* Client */}
              <FormField label="Client" required icon={<Building2 size={14} />}>
                <select
                  value={formData.clientId}
                  onChange={(e) => updateField("clientId", e.target.value)}
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

              {/* Project Type */}
              <FormField
                label="Project Type"
                required
                icon={<FolderKanban size={14} />}
              >
                <select
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className={inputClass}
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Website */}
              <FormField label="Website / URL" icon={<Globe size={14} />}>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </FormField>

              {/* Description */}
              <FormField
                label="Description"
                icon={<Info size={14} />}
                className="sm:col-span-2"
              >
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe what this project is used for..."
                  rows={6}
                  className={`${inputClass} min-h-[140px] resize-y py-3`}
                />
              </FormField>
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
                    Add tags to help organize and filter projects.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Project Tags
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
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Project Status
              </h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Control the current state of this project.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as ProjectStatus)
                }
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </section>

          {/* Client Relationship */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-[var(--primary)]" />

              <h2 className="text-[14px] font-semibold text-white">
                Client Relationship
              </h2>
            </div>

            {formData.clientId ? (
              (() => {
                const selectedClient = clients.find(
                  (client) => client.id === formData.clientId,
                );

                return (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-[12px] font-medium text-white">
                      {selectedClient?.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      This project will belong to this client.
                    </p>
                  </div>
                );
              })()
            ) : (
              <p className="text-[11px] leading-5 text-[var(--muted)]">
                Select a client to associate this project with an existing
                client record.
              </p>
            )}
          </section>

          {/* Project Structure */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
            <p className="text-[11px] font-medium text-white">
              Project structure
            </p>

            <p className="mt-2 text-[10px] leading-5 text-[var(--muted)]">
              Each project belongs to one client. Credentials can then be
              attached to this project or shared at the client level.
            </p>

            <div className="mt-4 space-y-2">
              <StructureRow label="Client" />
              <StructureRow label="Project" active />
              <StructureRow label="Credentials" />
            </div>
          </section>
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

function StructureRow({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--muted)]"
      }`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[var(--primary)]" : "bg-[var(--border-hover)]"
        }`}
      />

      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
