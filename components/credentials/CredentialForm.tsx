"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Eye,
  EyeOff,
  Folder,
  Globe,
  Info,
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
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CredentialFormProps = {
  mode?: "create" | "edit";
  credentialId?: string;
};

type CustomField = {
  id: string;
  label: string;
  value: string;
  type: "text" | "password" | "url";
};

type CredentialFormData = {
  name: string;
  categoryId: string;
  clientId: string;
  projectIds: string[];
  username: string;
  password: string;
  website: string;
  tagIds: string[];
  notes: string;
  customFields: CustomField[];
  favorite: boolean;
  shared: boolean;
};

type ClientOption = {
  _id: string;
  name: string;
  company?: string;
};

type ProjectOption = {
  _id: string;
  name: string;
  type?: string;
  status?: string;
};

type CategoryOption = {
  _id: string;
  name: string;
  color?: string;
};

type TagOption = {
  _id: string;
  name: string;
};

type ClientsResponse = {
  success: boolean;
  message?: string;
  clients: ClientOption[];
};

type ProjectsResponse = {
  success: boolean;
  message?: string;
  projects: ProjectOption[];
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  categories: CategoryOption[];
};

type TagsResponse = {
  success: boolean;
  message?: string;
  tags: TagOption[];
};

type CredentialResponse = {
  success: boolean;
  message?: string;
  credential?: {
    _id: string;
    name: string;
  };
};

const defaultCredential: CredentialFormData = {
  name: "",
  categoryId: "",
  clientId: "",
  projectIds: [],
  username: "",
  password: "",
  website: "",
  tagIds: [],
  notes: "",
  customFields: [],
  favorite: false,
  shared: false,
};

export function CredentialForm({
  mode = "create",
  credentialId,
}: CredentialFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [formData, setFormData] =
    useState<CredentialFormData>(defaultCredential);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);

  const [tagInput, setTagInput] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTags = useMemo(() => {
    const search = tagInput.trim().toLowerCase();

    if (!search) {
      return tags
        .filter((tag) => !formData.tagIds.includes(tag._id))
        .slice(0, 8);
    }

    return tags
      .filter(
        (tag) =>
          !formData.tagIds.includes(tag._id) &&
          tag.name.toLowerCase().includes(search),
      )
      .slice(0, 8);
  }, [tagInput, tags, formData.tagIds]);

  const selectedClient = clients.find(
    (client) => client._id === formData.clientId,
  );

  const selectedCategory = categories.find(
    (category) => category._id === formData.categoryId,
  );

  const selectedProjects = projects.filter((project) =>
    formData.projectIds.includes(project._id),
  );

  const selectedTags = tags.filter((tag) => formData.tagIds.includes(tag._id));

  const [isCredentialLoading, setIsCredentialLoading] = useState(false);

  /*
   * Load clients, categories and tags.
   */
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setIsLoading(true);

        const [clientsResponse, categoriesResponse, tagsResponse] =
          await Promise.all([
            fetch("/api/clients", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }),

            fetch("/api/categories", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }),

            fetch("/api/tags", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const clientsData: ClientsResponse = await clientsResponse.json();

        const categoriesData: CategoriesResponse =
          await categoriesResponse.json();

        const tagsData: TagsResponse = await tagsResponse.json();

        if (!clientsResponse.ok || !clientsData.success) {
          throw new Error(clientsData.message || "Failed to load clients.");
        }

        if (!categoriesResponse.ok || !categoriesData.success) {
          throw new Error(
            categoriesData.message || "Failed to load categories.",
          );
        }

        if (!tagsResponse.ok || !tagsData.success) {
          throw new Error(tagsData.message || "Failed to load tags.");
        }

        setClients(clientsData.clients);
        setCategories(categoriesData.categories);
        setTags(tagsData.tags);
      } catch (error) {
        console.error("Credential reference data error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load credential data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReferenceData();
  }, []);

  /*
   * Load projects when a client is selected.
   */
  useEffect(() => {
    if (!formData.clientId) {
      setProjects([]);
      return;
    }

    const loadProjects = async () => {
      try {
        setIsProjectsLoading(true);

        const response = await fetch(
          `/api/projects?client=${formData.clientId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: ProjectsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load projects.");
        }

        setProjects(data.projects);

        /*
         * Remove any selected projects that no longer
         * belong to the selected client.
         */
        setFormData((current) => ({
          ...current,
          projectIds: current.projectIds.filter((projectId) =>
            data.projects.some((project) => project._id === projectId),
          ),
        }));
      } catch (error) {
        console.error("Credential projects error:", error);

        setProjects([]);

        toast.error(
          error instanceof Error ? error.message : "Failed to load projects.",
        );
      } finally {
        setIsProjectsLoading(false);
      }
    };

    loadProjects();
  }, [formData.clientId]);

  useEffect(() => {
    if (!isEdit || !credentialId) {
      return;
    }

    const loadCredential = async () => {
      try {
        setIsCredentialLoading(true);

        const response = await fetch(`/api/credentials/${credentialId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load credential.");
        }

        const credential = data.credential;

        setFormData({
          name: credential.name ?? "",
          categoryId: credential.category?._id ?? "",
          clientId: credential.client?._id ?? "",
          projectIds: Array.isArray(credential.projects)
            ? credential.projects.map((project: { _id: string }) => project._id)
            : [],
          username: credential.username ?? "",
          password: "",
          website: credential.url ?? "",
          tagIds: Array.isArray(credential.tags)
            ? credential.tags.map((tag: { _id: string }) => tag._id)
            : [],
          notes: credential.notes ?? "",
          customFields: Array.isArray(credential.customFields)
            ? credential.customFields.map(
                (
                  field: {
                    id: string;
                    label: string;
                    value: string;
                    type: "text" | "password" | "url";
                    isSecret?: boolean;
                    hasValue?: boolean;
                  },
                  index: number,
                ) => ({
                  id: field.id || `custom-${index}`,
                  label: field.label ?? "",
                  value: field.value ?? "",
                  type: field.type ?? "text",
                }),
              )
            : [],
          favorite: Boolean(credential.isFavorite),
          shared: Boolean(credential.isShared),
        });
      } catch (error) {
        console.error("Load credential error:", error);

        toast.error(
          error instanceof Error ? error.message : "Failed to load credential.",
        );
      } finally {
        setIsCredentialLoading(false);
      }
    };

    loadCredential();
  }, [isEdit, credentialId]);

  const updateField = <K extends keyof CredentialFormData>(
    field: K,
    value: CredentialFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleClientChange = (clientId: string) => {
    setFormData((previous) => ({
      ...previous,
      clientId,
      projectIds: [],
    }));
  };

  const toggleProject = (projectId: string) => {
    setFormData((previous) => {
      const exists = previous.projectIds.includes(projectId);

      return {
        ...previous,
        projectIds: exists
          ? previous.projectIds.filter((id) => id !== projectId)
          : [...previous.projectIds, projectId],
      };
    });
  };

  const addTag = (tag: TagOption) => {
    if (formData.tagIds.includes(tag._id)) {
      setTagInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      tagIds: [...previous.tagIds, tag._id],
    }));

    setTagInput("");
  };

  const removeTag = (tagId: string) => {
    setFormData((previous) => ({
      ...previous,
      tagIds: previous.tagIds.filter((id) => id !== tagId),
    }));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();

    const search = tagInput.trim().toLowerCase();

    if (!search) {
      return;
    }

    const exactTag = tags.find(
      (tag) =>
        tag.name.toLowerCase() === search && !formData.tagIds.includes(tag._id),
    );

    if (!exactTag) {
      toast.error("Select an existing tag from the list.");
      return;
    }

    addTag(exactTag);
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: "",
      value: "",
      type: "text",
    };

    setFormData((previous) => ({
      ...previous,
      customFields: [...previous.customFields, newField],
    }));
  };

  const updateCustomField = (
    id: string,
    field: keyof CustomField,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      customFields: previous.customFields.map((customField) =>
        customField.id === id
          ? {
              ...customField,
              [field]: value,
            }
          : customField,
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData((previous) => ({
      ...previous,
      customFields: previous.customFields.filter(
        (customField) => customField.id !== id,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const username = formData.username.trim();
    const website = formData.website.trim();
    const notes = formData.notes.trim();

    if (!name) {
      toast.error("Credential name is required.");
      return;
    }

    if (!formData.clientId) {
      toast.error("Please select a client.");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!username) {
      toast.error("Username / email is required.");
      return;
    }

    if (!isEdit && !formData.password) {
      toast.error("Password / secret is required.");
      return;
    }

    const invalidCustomField = formData.customFields.find(
      (field) => !field.label.trim() || !field.value.trim(),
    );

    if (invalidCustomField) {
      toast.error("Please complete all custom fields or remove empty ones.");
      return;
    }

    /*
     * Non-shared credentials should have at most
     * one project. Shared credentials may have multiple.
     */
    if (!formData.shared && formData.projectIds.length > 1) {
      toast.error("A non-shared credential can only belong to one project.");
      return;
    }

    try {
      setIsSaving(true);

      const payload: Record<string, unknown> = {
        client: formData.clientId,
        projects: formData.projectIds,
        name,
        category: formData.categoryId,
        username,
        url: website || undefined,

        customFields: formData.customFields.map((field) => ({
          label: field.label.trim(),
          value: field.value,
          isSecret: field.type === "password",
        })),

        tags: formData.tagIds,
        notes: notes || undefined,
        isFavorite: formData.favorite,
        isShared: formData.shared,
      };

      if (formData.password) {
        payload.secret = formData.password;
      }

      const endpoint = isEdit
        ? `/api/credentials/${credentialId}`
        : "/api/credentials";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data: CredentialResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Failed to update credential."
              : "Failed to create credential."),
        );
      }

      toast.success(
        isEdit
          ? "Credential updated successfully."
          : "Credential created successfully.",
      );

      // router.push(
      //   isEdit && credentialId
      //   ? `/credentials/${credentialId}`
      //   : "/credentials",
      // );
      router.push("/credentials");

      router.refresh();
    } catch (error) {
      console.error(
        isEdit ? "Update credential error:" : "Create credential error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Failed to update credential."
            : "Failed to create credential.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isCredentialLoading) {
    return <CredentialFormSkeleton />;
  }

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
                !formData.categoryId ||
                !formData.username.trim() ||
                (!isEdit && !formData.password)
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

      <form
        id="credential-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]"
      >
        {/* Main Content */}
        <div className="space-y-5">
          {/* Credential Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              icon={<KeyRound size={15} className="text-[var(--primary)]" />}
              title="Credential Information"
              description="Basic information about this credential."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {/* Name */}
              <FormField
                label="Credential Name"
                required
                icon={<KeyRound size={14} />}
              >
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Shopify Admin"
                  maxLength={150}
                  required
                  className={inputClass}
                />
              </FormField>

              {/* Category */}
              <FormField label="Category" required icon={<Tag size={14} />}>
                <select
                  value={formData.categoryId}
                  onChange={(event) =>
                    updateField("categoryId", event.target.value)
                  }
                  required
                  className={inputClass}
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Client */}
              <FormField label="Client" required icon={<Building2 size={14} />}>
                <select
                  value={formData.clientId}
                  onChange={(event) => handleClientChange(event.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a client</option>

                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Projects */}
              <FormField
                label={formData.shared ? "Projects" : "Project"}
                icon={<Folder size={14} />}
              >
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                  {!formData.clientId ? (
                    <p className="px-2 py-2 text-[11px] text-[var(--muted)]">
                      Select a client first.
                    </p>
                  ) : isProjectsLoading ? (
                    <p className="px-2 py-2 text-[11px] text-[var(--muted)]">
                      Loading projects...
                    </p>
                  ) : projects.length === 0 ? (
                    <p className="px-2 py-2 text-[11px] text-[var(--muted)]">
                      No projects found for this client.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {projects.map((project) => {
                        const selected = formData.projectIds.includes(
                          project._id,
                        );

                        return (
                          <button
                            key={project._id}
                            type="button"
                            onClick={() => toggleProject(project._id)}
                            className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition ${
                              selected
                                ? "bg-[var(--primary-soft)] text-white"
                                : "text-[var(--muted)] hover:bg-white/[0.03] hover:text-white"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                selected
                                  ? "border-[var(--primary)] bg-[var(--primary)]"
                                  : "border-[var(--border-hover)]"
                              }`}
                            >
                              {selected && (
                                <Check size={11} className="text-black" />
                              )}
                            </span>

                            <span className="min-w-0 truncate text-[11px]">
                              {project.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                  {formData.shared
                    ? "Select multiple projects when this credential is shared."
                    : "Select the project that uses this credential."}
                </p>
              </FormField>
            </div>
          </section>

          {/* Login Credentials */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              icon={<LockKeyhole size={15} className="text-[var(--primary)]" />}
              title="Login Credentials"
              description="Sensitive authentication information."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              {/* Username */}
              <FormField
                label="Username / Email"
                required
                icon={<User size={14} />}
              >
                <input
                  value={formData.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  placeholder="admin@example.com"
                  autoComplete="off"
                  maxLength={255}
                  required
                  className={inputClass}
                />
              </FormField>

              {/* Secret */}
              <FormField
                label="Password / Secret"
                required
                icon={<LockKeyhole size={14} />}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder={
                      isEdit
                        ? "Leave blank to keep existing secret"
                        : "Enter password or secret"
                    }
                    autoComplete="new-password"
                    required={!isEdit}
                    className={`${inputClass} pr-10`}
                  />
                  {isEdit && (
                    <p className="mt-2 text-[10px] text-[var(--muted)]">
                      Leave this field blank to keep the current secret
                      unchanged.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide secret" : "Show secret"}
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
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  placeholder="https://admin.example.com"
                  maxLength={500}
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
                The secret will be encrypted before it is stored in the vault.
                The credential list never receives the decrypted secret.
              </p>
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <SectionHeader
              icon={<Tag size={15} className="text-[var(--primary)]" />}
              title="Tags"
              description="Add existing tags to organize and filter this credential."
            />

            <div className="p-5">
              <label className="mb-2 block text-[11px] font-medium text-[var(--muted)]">
                Credential Tags
              </label>

              <div className="relative">
                <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag._id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2 py-1 font-mono text-[10px] font-medium text-[var(--primary)]"
                    >
                      #{tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag._id)}
                        className="text-[var(--primary)]/60 transition hover:text-[var(--primary)]"
                        aria-label={`Remove ${tag.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={
                      selectedTags.length === 0
                        ? "Search existing tags..."
                        : "Add another tag..."
                    }
                    className="h-7 min-w-[160px] flex-1 bg-transparent px-1 text-[11px] text-white outline-none placeholder:text-[var(--muted)]"
                  />
                </div>

                {tagInput.trim() && filteredTags.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[var(--border)] bg-[#11181e] shadow-xl">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="flex w-full items-center px-3 py-2.5 text-left font-mono text-[11px] text-[var(--muted)] transition hover:bg-white/[0.04] hover:text-white"
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-2 text-[10px] text-[var(--muted)]">
                Select from your existing Tags. New tags can be created from the
                Tags section.
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
                    username, secret and website.
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
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Add notes about this credential..."
                rows={6}
                maxLength={5000}
                className={`${inputClass} min-h-[140px] resize-y py-3`}
              />
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
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

              <Toggle checked={formData.favorite} />
            </button>
          </section>

          {/* Shared */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <button
              type="button"
              onClick={() => updateField("shared", !formData.shared)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  formData.shared
                    ? "bg-[var(--primary-soft)]"
                    : "bg-white/[0.03]"
                }`}
              >
                <Building2
                  size={16}
                  className={
                    formData.shared
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted)]"
                  }
                />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-white">
                  Shared Credential
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-[var(--muted)]">
                  Allow this credential to be used by multiple projects.
                </p>
              </div>

              <Toggle checked={formData.shared} />
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
                label={formData.shared ? "Projects" : "Project"}
                value={
                  selectedProjects.length > 0
                    ? selectedProjects.map((project) => project.name).join(", ")
                    : "Not selected"
                }
              />

              <RelationshipRow
                label="Category"
                value={selectedCategory?.name ?? "Not selected"}
              />

              <RelationshipRow
                label="Tags"
                value={
                  selectedTags.length > 0
                    ? selectedTags.map((tag) => `#${tag.name}`).join(", ")
                    : "None"
                }
              />
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
                  Secrets are encrypted server-side before they are stored in
                  MongoDB.
                </p>
              </div>
            </div>
          </section>

          {/* Information */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-[var(--primary)]" />

                <h2 className="text-[13px] font-semibold text-white">
                  Credential Guidelines
                </h2>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <Guideline
                title="Use a recognizable name"
                description="For example, Shopify Admin, Cloudflare or GitHub Production."
              />

              <Guideline
                title="Choose the correct category"
                description="Categories help keep credentials organized throughout the vault."
              />

              <Guideline
                title="Use shared credentials carefully"
                description="Only mark a credential as shared when multiple projects actually use it."
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------
   Section Header
----------------------------------------- */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--border)] px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          {icon}
        </div>

        <div>
          <h2 className="text-[14px] font-semibold text-white">{title}</h2>

          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Custom Field Row
----------------------------------------- */

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
        {/* Label */}
        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Field Name
          </label>

          <input
            value={field.label}
            onChange={(event) =>
              onChange(field.id, "label", event.target.value)
            }
            placeholder="e.g. Store ID"
            maxLength={100}
            className={inputClass}
          />
        </div>

        {/* Value */}
        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Value
          </label>

          <input
            type={
              field.type === "password"
                ? "password"
                : field.type === "url"
                  ? "url"
                  : "text"
            }
            value={field.value}
            onChange={(event) =>
              onChange(field.id, "value", event.target.value)
            }
            placeholder="Enter value"
            className={inputClass}
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block text-[10px] font-medium text-[var(--muted)]">
            Field Type
          </label>

          <select
            value={field.type}
            onChange={(event) =>
              onChange(
                field.id,
                "type",
                event.target.value as CustomField["type"],
              )
            }
            className={inputClass}
          >
            <option value="text">Text</option>

            <option value="password">Secret</option>

            <option value="url">URL</option>
          </select>
        </div>
      </div>

      {field.type === "password" && (
        <p className="mt-2 text-[10px] text-[var(--primary)]">
          This field will be encrypted before storage.
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------
   Relationship Row
----------------------------------------- */

function RelationshipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <p className="text-[10px] text-[var(--muted)]">{label}</p>

      <p className="mt-1 text-[11px] font-medium leading-5 text-white">
        {value}
      </p>
    </div>
  );
}

/* ----------------------------------------
   Guideline
----------------------------------------- */

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

      <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

/* ----------------------------------------
   Form Field
----------------------------------------- */

function FormField({
  label,
  required,
  icon,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
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

/* ----------------------------------------
   Toggle
----------------------------------------- */

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-[var(--primary)]" : "bg-[#30383d]"
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  );
}

/* ----------------------------------------
   Loading Skeleton
----------------------------------------- */

function CredentialFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1160px]">
      <div className="mb-6">
        <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-5">
          <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <div className="h-[300px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[280px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[180px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[200px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>

        <div className="space-y-5">
          <div className="h-[90px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[110px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-[230px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20";
