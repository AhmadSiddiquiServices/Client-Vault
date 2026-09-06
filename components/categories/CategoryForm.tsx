"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Check,
  FileText,
  Palette,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CategoryFormData = {
  name: string;
  description: string;
  color: string;
};

type CategoryFormProps = {
  mode?: "create" | "edit";
  categoryId?: string;
};

type CategoryResponse = {
  success: boolean;
  message?: string;
  category?: {
    _id: string;
    name: string;
    description?: string;
    color: string;
  };
};

const colors = [
  {
    name: "Green",
    value: "#00e676",
  },
  {
    name: "Blue",
    value: "#60a5fa",
  },
  {
    name: "Purple",
    value: "#a78bfa",
  },
  {
    name: "Orange",
    value: "#fb923c",
  },
  {
    name: "Pink",
    value: "#f472b6",
  },
  {
    name: "Cyan",
    value: "#22d3ee",
  },
  {
    name: "Yellow",
    value: "#facc15",
  },
  {
    name: "Red",
    value: "#f87171",
  },
];

const defaultCategory: CategoryFormData = {
  name: "",
  description: "",
  color: "#00e676",
};

export function CategoryForm({
  mode = "create",
  categoryId,
}: CategoryFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<CategoryFormData>(defaultCategory);

  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = mode === "edit";

  /*
   * Load category when editing.
   */
  useEffect(() => {
    if (!isEdit || !categoryId) {
      setIsLoading(false);
      return;
    }

    const loadCategory = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data: CategoryResponse = await response.json();

        if (!response.ok || !data.success || !data.category) {
          throw new Error(data.message || "Failed to load category.");
        }

        setFormData({
          name: data.category.name ?? "",
          description: data.category.description ?? "",
          color: data.category.color ?? "#00e676",
        });
      } catch (error) {
        console.error("Load category error:", error);

        toast.error(
          error instanceof Error ? error.message : "Failed to load category.",
        );

        router.push("/categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId, isEdit, router]);

  const updateField = <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        description: description || undefined,
        color: formData.color,
      };

      const endpoint = isEdit
        ? `/api/categories/${categoryId}`
        : "/api/categories";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: CategoryResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Failed to update category."
              : "Failed to create category."),
        );
      }

      toast.success(
        isEdit
          ? "Category updated successfully."
          : "Category created successfully.",
      );

      router.push(
        isEdit && categoryId ? `/categories/${categoryId}/edit` : "/categories",
      );

      router.refresh();
    } catch (error) {
      console.error(
        isEdit ? "Update category error:" : "Create category error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Failed to update category."
            : "Failed to create category.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Loading state for edit mode.
   */
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-6">
          <div className="h-4 w-36 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-5">
            <div className="h-7 w-44 animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="h-[420px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="space-y-5">
            <div className="h-[220px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

            <div className="h-[150px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
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
          href="/categories"
          className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Categories
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              {isEdit ? "Edit Category" : "Add Category"}
            </h1>

            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {isEdit
                ? "Update this credential category."
                : "Create a category to organize your credentials."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/categories"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="category-form"
              disabled={isSaving || !formData.name.trim()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]"
      >
        {/* Main */}
        <div className="space-y-5">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                  <Briefcase size={15} className="text-[var(--primary)]" />
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Category Information
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                    Define how this category appears throughout the vault.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* Name */}
              <FormField
                label="Category Name"
                required
                icon={<Briefcase size={14} />}
              >
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Hosting"
                  required
                  maxLength={100}
                  className={inputClass}
                />
              </FormField>

              {/* Description */}
              <FormField label="Description" icon={<FileText size={14} />}>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe what this category is used for..."
                  rows={5}
                  maxLength={500}
                  className={`${inputClass} min-h-[120px] resize-y py-3`}
                />
              </FormField>

              {/* Color - presentation only */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
                  <Palette size={14} />
                  Category Color
                </label>

                <p className="mb-3 text-[10px] leading-5 text-[var(--muted)]">
                  This color is used only for the category&apos;s visual
                  presentation.
                </p>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const active = formData.color === color.value;

                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateField("color", color.value)}
                        title={color.name}
                        aria-label={`Select ${color.name}`}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                          active
                            ? "border-white/60 bg-white/[0.05]"
                            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: color.value,
                          }}
                        />

                        {active && (
                          <span className="absolute">
                            <Check size={12} className="text-black" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Preview */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-[14px] font-semibold text-white">Preview</h2>

              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                How the category will appear in the vault.
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${formData.color}18`,
                    }}
                  >
                    <Briefcase
                      size={16}
                      style={{
                        color: formData.color,
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-white">
                      {formData.name || "Category Name"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      0 credentials
                    </p>
                  </div>
                </div>

                {formData.description && (
                  <p className="mt-3 text-[10px] leading-5 text-[var(--muted)]">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Information */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
            <p className="text-[11px] font-medium text-white">
              About categories
            </p>

            <p className="mt-2 text-[10px] leading-5 text-[var(--muted)]">
              Categories help group credentials by purpose, such as Hosting,
              Development, Analytics, E-Commerce or Database.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}

        <span>{label}</span>

        {required && <span className="text-[var(--primary)]">*</span>}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";
