"use client";

import { useState } from "react";
import { ArrowLeft, Check, Info, Plus, Save, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type TagFormProps = {
  mode?: "create" | "edit";
  tag?: {
    name: string;
    description: string;
    type: "General" | "Technology" | "Environment" | "Access" | "Other";
    color: string;
    status: "Active" | "Inactive";
  };
};

type TagFormData = {
  name: string;
  description: string;
  type: "General" | "Technology" | "Environment" | "Access" | "Other";
  color: string;
  status: "Active" | "Inactive";
};

const tagColors = [
  "#00e676",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#f472b6",
  "#22d3ee",
  "#facc15",
  "#f87171",
];

const tagTypes: TagFormData["type"][] = [
  "General",
  "Technology",
  "Environment",
  "Access",
  "Other",
];

export function TagForm({ mode = "create", tag }: TagFormProps) {
  const [form, setForm] = useState<TagFormData>({
    name: tag?.name ?? "",
    description: tag?.description ?? "",
    type: tag?.type ?? "General",
    color: tag?.color ?? "#00e676",
    status: tag?.status ?? "Active",
  });

  const [isSaving, setIsSaving] = useState(false);

  const isEdit = mode === "edit";

  const updateField = <K extends keyof TagFormData>(
    field: K,
    value: TagFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Tag name is required.");
      return;
    }

    setIsSaving(true);

    // Mock save — backend will be connected later.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setIsSaving(false);

    toast.success(
      isEdit ? "Tag updated successfully." : "Tag created successfully.",
    );
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/tags"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
          >
            <ArrowLeft size={15} />
          </Link>

          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Tag" : "Add Tag"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update the tag information and settings."
                : "Create a reusable tag for organizing credentials and projects."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tags"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="tag-form"
            disabled={isSaving}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Tag"}
          </button>
        </div>
      </div>

      <form
        id="tag-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
      >
        {/* Main Content */}
        <div className="space-y-5">
          {/* Basic Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Tag size={15} className="text-[var(--primary)]" />

                <h2 className="text-[14px] font-semibold text-white">
                  Tag Information
                </h2>
              </div>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Define the name and purpose of this tag.
              </p>
            </div>

            <div className="space-y-5 p-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-[11px] font-medium text-white">
                  Tag Name <span className="text-[var(--primary)]">*</span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. production"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
                />

                <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                  Use a short, recognizable name that can be reused across
                  records.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-[11px] font-medium text-white">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe what this tag represents..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[12px] leading-5 text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-[11px] font-medium text-white">
                  Tag Type
                </label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value as TagFormData["type"],
                    )
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors focus:border-[var(--primary)]"
                >
                  {tagTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                  Helps group and filter tags throughout the vault.
                </p>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">
                Appearance
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Choose a color to make this tag easier to identify.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-3 block text-[11px] font-medium text-white">
                Tag Color
              </label>

              <div className="flex flex-wrap gap-2.5">
                {tagColors.map((color) => {
                  const selected = form.color === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateField("color", color)}
                      aria-label={`Select ${color}`}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 ${
                        selected ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selected && (
                        <Check
                          size={15}
                          className="text-black"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  Preview
                </p>

                <span
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    color: form.color,
                    borderColor: `${form.color}40`,
                    backgroundColor: `${form.color}12`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: form.color }}
                  />
                  {form.name || "Tag Name"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <h2 className="text-[13px] font-semibold text-white">Status</h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {(["Active", "Inactive"] as const).map((status) => {
                  const selected = form.status === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateField("status", status)}
                      className={`rounded-lg border px-3 py-2.5 text-[11px] font-medium transition-colors ${
                        selected
                          ? status === "Active"
                            ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-[var(--primary)]" />

                <h2 className="text-[13px] font-semibold text-white">
                  Tag Guidelines
                </h2>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div>
                <p className="text-[11px] font-medium text-white">
                  Keep names simple
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
                  Prefer names such as production, staging, admin or wordpress.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white">Reuse tags</p>
                <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
                  Tags are designed to be shared across multiple credentials and
                  projects.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white">
                  Avoid duplicates
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
                  The backend will later prevent duplicate tag names.
                </p>
              </div>
            </div>
          </section>

          {/* Record info on edit */}
          {isEdit && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="border-b border-[var(--border)] px-4 py-3.5">
                <h2 className="text-[13px] font-semibold text-white">
                  Record Information
                </h2>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] text-[var(--muted)]">
                    Current usage
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-white">
                    8 credentials
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-[var(--muted)]">
                    Last updated
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-white">
                    2 days ago
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </form>
    </div>
  );
}
