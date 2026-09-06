"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  Globe,
  Info,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ProjectStatus = "Active" | "Inactive" | "Archived";

type ProjectType =
  | "Website"
  | "Shopify Store"
  | "Mobile App"
  | "API"
  | "SaaS"
  | "Internal System"
  | "Server"
  | "Other";

type ProjectFormData = {
  name: string;
  clientId: string;
  type: ProjectType;
  url: string;
  status: ProjectStatus;
  description: string;
};

type ProjectFormProps = {
  mode?: "create" | "edit";
  projectId?: string;
  initialClientId?: string;
};

interface ClientOption {
  _id: string;
  name: string;
  company?: string;
}

interface ClientsResponse {
  success: boolean;
  message?: string;
  clients: ClientOption[];
}

interface ProjectResponse {
  success: boolean;
  message?: string;
  project?: {
    _id: string;
  };
}

interface ProjectDetailResponse {
  success: boolean;
  message?: string;
  project?: {
    _id: string;
    name: string;
    client: {
      _id: string;
      name: string;
      company?: string;
    } | null;
    type:
      | "website"
      | "shopify-store"
      | "mobile-app"
      | "api"
      | "saas"
      | "internal-system"
      | "server"
      | "other";
    url?: string;
    description?: string;
    status: "active" | "inactive" | "completed" | "archived";
    notes?: string;
  };
}

const projectTypes: ProjectType[] = [
  "Website",
  "Shopify Store",
  "Mobile App",
  "API",
  "SaaS",
  "Internal System",
  "Server",
  "Other",
];

const defaultProject: ProjectFormData = {
  name: "",
  clientId: "",
  type: "Website",
  url: "",
  status: "Active",
  description: "",
};

export function ProjectForm({
  mode = "create",
  projectId,
  initialClientId,
}: ProjectFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [formData, setFormData] = useState<ProjectFormData>(defaultProject);

  const [clients, setClients] = useState<ClientOption[]>([]);

  const [loadingClients, setLoadingClients] = useState(true);

  const [loadingProject, setLoadingProject] = useState(isEdit);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load clients.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchClients() {
      try {
        setLoadingClients(true);

        const response = await fetch("/api/clients", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result: ClientsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load clients.");
        }

        if (cancelled) return;

        setClients(result.clients);

        /*
         * Create mode:
         * Preselect client from ?client=...
         */
        if (!isEdit && initialClientId) {
          const clientExists = result.clients.some(
            (client) => client._id === initialClientId,
          );

          if (clientExists) {
            setFormData((current) => ({
              ...current,
              clientId: initialClientId,
            }));
          }
        }
      } catch (error) {
        console.error("Project clients fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load clients.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingClients(false);
        }
      }
    }

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, [initialClientId, isEdit]);

  /*
   * Load existing project in edit mode.
   */
  useEffect(() => {
    if (!isEdit) {
      setLoadingProject(false);
      return;
    }

    if (!projectId) {
      setError("Project ID is missing.");
      setLoadingProject(false);
      return;
    }

    let cancelled = false;

    async function fetchProject() {
      try {
        setLoadingProject(true);
        setError("");

        const response = await fetch(`/api/projects/${projectId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result: ProjectDetailResponse = await response.json();

        if (!response.ok || !result.success || !result.project) {
          throw new Error(result.message || "Failed to load project.");
        }

        if (cancelled) return;

        setFormData({
          name: result.project.name || "",

          clientId: result.project.client?._id || "",

          type: mapProjectTypeFromApi(result.project.type),

          url: result.project.url || "",

          status: mapProjectStatusFromApi(result.project.status),

          description: result.project.description || "",
        });
      } catch (error) {
        console.error("Project fetch error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load project.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProject(false);
        }
      }
    }

    fetchProject();

    return () => {
      cancelled = true;
    };
  }, [isEdit, projectId]);

  const updateField = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K],
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

    if (isEdit && !projectId) {
      setError("Project ID is missing.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.clientId) {
      setError("Please select a client.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),

        client: formData.clientId,

        type: mapProjectTypeToApi(formData.type),

        url: formData.url.trim() || undefined,

        status: mapProjectStatusToApi(formData.status),

        description: formData.description.trim() || undefined,
      };

      const endpoint = isEdit ? `/api/projects/${projectId}` : "/api/projects";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ProjectResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (isEdit
              ? "Failed to update project."
              : "Failed to create project."),
        );
      }

      toast.success(
        isEdit
          ? "Project updated successfully."
          : "Project created successfully.",
      );

      const targetProjectId = result.project?._id || projectId;

      if (targetProjectId) {
        router.push(`/projects/${targetProjectId}`);
      } else {
        router.push("/projects");
      }

      router.refresh();
    } catch (error) {
      console.error(
        isEdit ? "Update project error:" : "Create project error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : isEdit
            ? "Something went wrong while updating the project."
            : "Something went wrong while creating the project.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const selectedClient = clients.find(
    (client) => client._id === formData.clientId,
  );

  /*
   * Loading state for edit mode.
   */
  if (loadingProject) {
    return <ProjectFormSkeleton />;
  }

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
              disabled={
                isSaving ||
                loadingClients ||
                !formData.name.trim() ||
                !formData.clientId
              }
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

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
          <p className="text-[11px] leading-5 text-red-400">{error}</p>
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
                  disabled={isSaving}
                  className={inputClass}
                />
              </FormField>

              {/* Client */}
              <FormField label="Client" required icon={<Building2 size={14} />}>
                <select
                  value={formData.clientId}
                  onChange={(e) => updateField("clientId", e.target.value)}
                  required
                  disabled={loadingClients || isSaving}
                  className={inputClass}
                >
                  <option value="">
                    {loadingClients ? "Loading clients..." : "Select a client"}
                  </option>

                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
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
                  onChange={(e) =>
                    updateField("type", e.target.value as ProjectType)
                  }
                  disabled={isSaving}
                  className={inputClass}
                >
                  {projectTypes.map((projectType) => (
                    <option key={projectType} value={projectType}>
                      {projectType}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                  className={`${inputClass} min-h-[140px] resize-y py-3`}
                />
              </FormField>
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
                disabled={isSaving}
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

            {selectedClient ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-[12px] font-medium text-white">
                  {selectedClient.name}
                </p>

                {selectedClient.company && (
                  <p className="mt-0.5 text-[10px] text-[#65727a]">
                    {selectedClient.company}
                  </p>
                )}

                <p className="mt-2 text-[10px] leading-5 text-[var(--muted)]">
                  This project will belong to this client.
                </p>
              </div>
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

function mapProjectTypeToApi(type: ProjectType) {
  const map: Record<ProjectType, string> = {
    Website: "website",
    "Shopify Store": "shopify-store",
    "Mobile App": "mobile-app",
    API: "api",
    SaaS: "saas",
    "Internal System": "internal-system",
    Server: "server",
    Other: "other",
  };

  return map[type];
}

function mapProjectTypeFromApi(
  type:
    | "website"
    | "shopify-store"
    | "mobile-app"
    | "api"
    | "saas"
    | "internal-system"
    | "server"
    | "other",
): ProjectType {
  const map: Record<string, ProjectType> = {
    website: "Website",
    "shopify-store": "Shopify Store",
    "mobile-app": "Mobile App",
    api: "API",
    saas: "SaaS",
    "internal-system": "Internal System",
    server: "Server",
    other: "Other",
  };

  return map[type] ?? "Other";
}

function mapProjectStatusToApi(status: ProjectStatus) {
  const map: Record<ProjectStatus, string> = {
    Active: "active",
    Inactive: "inactive",
    Archived: "archived",
  };

  return map[status];
}

function mapProjectStatusFromApi(
  status: "active" | "inactive" | "completed" | "archived",
): ProjectStatus {
  if (status === "inactive") {
    return "Inactive";
  }

  if (status === "archived") {
    return "Archived";
  }

  /*
   * The form currently doesn't have a "Completed"
   * option, so keep completed projects visually
   * editable as Active.
   */
  return "Active";
}

const inputClass =
  "h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60";

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

function ProjectFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1120px] animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-white/[0.05]" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-7 w-36 rounded bg-white/[0.06]" />
          <div className="mt-2 h-3 w-72 rounded bg-white/[0.04]" />
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-lg bg-white/[0.04]" />
          <div className="h-9 w-32 rounded-lg bg-white/[0.06]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SkeletonBox rows={5} />
        </div>

        <div className="space-y-5">
          <SkeletonBox rows={2} />
          <SkeletonBox rows={2} />
          <SkeletonBox rows={3} />
        </div>
      </div>
    </div>
  );
}

function SkeletonBox({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="h-4 w-36 rounded bg-white/[0.06]" />

      <div className="mt-6 space-y-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index}>
            <div className="mb-2 h-3 w-24 rounded bg-white/[0.04]" />
            <div className="h-10 w-full rounded-lg bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
