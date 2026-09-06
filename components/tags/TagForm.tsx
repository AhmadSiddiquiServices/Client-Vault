"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Save, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type TagFormProps = {
  mode?: "create" | "edit";
  tag?: {
    name: string;
  };
  tagId?: string;
};

type TagFormData = {
  name: string;
};

type TagResponse = {
  success: boolean;
  message?: string;
  tag?: {
    _id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

const defaultForm: TagFormData = {
  name: "",
};

export function TagForm({ mode = "create", tag, tagId }: TagFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [form, setForm] = useState<TagFormData>(tag ?? defaultForm);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  /*
   * Load the real tag when editing.
   */
  useEffect(() => {
    if (!isEdit || !tagId) {
      setIsLoading(false);
      return;
    }

    const loadTag = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/tags/${tagId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: TagResponse = await response.json();

        if (!response.ok || !data.success || !data.tag) {
          throw new Error(data.message || "Failed to load tag.");
        }

        setForm({
          name: data.tag.name ?? "",
        });
      } catch (error) {
        console.error("Load tag error:", error);

        toast.error(
          error instanceof Error ? error.message : "Failed to load tag.",
        );

        router.push("/tags");
      } finally {
        setIsLoading(false);
      }
    };

    loadTag();
  }, [isEdit, tagId, router]);

  const updateField = <K extends keyof TagFormData>(
    field: K,
    value: TagFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Tag name is required.");
      return;
    }

    if (isEdit && !tagId) {
      toast.error("Tag ID is missing.");
      return;
    }

    try {
      setIsSaving(true);

      const endpoint = isEdit ? `/api/tags/${tagId}` : "/api/tags";

      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        name,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data: TagResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEdit ? "Failed to update tag." : "Failed to create tag."),
        );
      }

      toast.success(
        isEdit ? "Tag updated successfully." : "Tag created successfully.",
      );

      router.push("/tags");
      router.refresh();
    } catch (error) {
      console.error(isEdit ? "Update tag error:" : "Create tag error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Failed to update tag."
            : "Failed to create tag.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1000px]">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-4 w-28 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-5">
            <div className="h-7 w-32 animate-pulse rounded bg-white/[0.06]" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="h-[300px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="space-y-5">
            <div className="h-[260px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

            <div className="h-[180px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tags"
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Tags
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Tag" : "Add Tag"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update this tag."
                : "Create a reusable tag for organizing credentials."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tags"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="tag-form"
              disabled={isSaving || !form.name.trim()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={14} />

              {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Tag"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        id="tag-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
      >
        {/* Main */}
        <div>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <Tag size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Tag Information
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Define the name of this reusable tag.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <FormField label="Tag Name" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--muted)]">
                    #
                  </span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="e.g. production"
                    required
                    maxLength={50}
                    autoFocus
                    className={`${inputClass} pl-7`}
                  />
                </div>

                <p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">
                  Use a short, recognizable name that can be reused across
                  credentials.
                </p>
              </FormField>

              {/* Preview */}
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-medium text-[var(--muted)]">
                  Preview
                </p>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                      <Tag size={15} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12px] font-medium text-white">
                        #{form.name || "tag-name"}
                      </p>

                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        Reusable credential tag
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
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

            <div className="space-y-4 p-4">
              <Guideline
                title="Keep names simple"
                description="Prefer names such as production, staging, admin or wordpress."
              />

              <Guideline
                title="Reuse tags"
                description="Tags are designed to be shared across multiple credentials."
              />

              <Guideline
                title="Avoid duplicates"
                description="Tag names are unique for your account."
              />
            </div>
          </section>

          {/* Tag example */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
            <p className="text-[11px] font-medium text-white">Example</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {["production", "admin", "hosting"].map((example) => (
                <span
                  key={example}
                  className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]"
                >
                  #{example}
                </span>
              ))}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
        {label}

        {required && <span className="ml-1 text-[var(--primary)]">*</span>}
      </label>

      {children}
    </div>
  );
}

function Guideline({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-white">{title}</p>

      <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";
