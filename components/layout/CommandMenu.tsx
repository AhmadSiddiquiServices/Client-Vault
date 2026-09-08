"use client";

import {
  ArrowRight,
  Command,
  FolderKanban,
  KeyRound,
  Loader2,
  Search,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchType = "Client" | "Project" | "Credential" | "Category" | "Tag";

type SearchItem = {
  id: string;
  name: string;
  description: string;
  type: SearchType;
  href: string;
};

type SearchClient = {
  _id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  email?: string;
};

type SearchProject = {
  _id: string;
  name: string;
  type?: string;
  status?: string;
  client?: {
    _id: string;
    name: string;
    company?: string;
  } | null;
};

type SearchCredential = {
  _id: string;
  name: string;
  username?: string;
  url?: string;
  isFavorite: boolean;
  isShared: boolean;
  client?: {
    _id: string;
    name: string;
    company?: string;
  } | null;
  projects: {
    _id: string;
    name: string;
    type?: string;
  }[];
  category?: {
    _id: string;
    name: string;
  } | null;
  tags: {
    _id: string;
    name: string;
  }[];
};

type SearchCategory = {
  _id: string;
  name: string;
  description?: string;
};

type SearchTag = {
  _id: string;
  name: string;
};

type SearchResponse = {
  success: boolean;
  message?: string;
  query: string;
  total: number;
  results: {
    clients: SearchClient[];
    projects: SearchProject[];
    credentials: SearchCredential[];
    categories: SearchCategory[];
    tags: SearchTag[];
  };
};

const typeOrder: SearchType[] = [
  "Client",
  "Project",
  "Credential",
  "Category",
  "Tag",
];

function getTypeIcon(type: SearchType) {
  switch (type) {
    case "Client":
      return Users;

    case "Project":
      return FolderKanban;

    case "Credential":
      return KeyRound;

    case "Category":
    case "Tag":
      return Tag;
  }
}

function getTypeColor(type: SearchType) {
  switch (type) {
    case "Client":
      return "text-blue-400 bg-blue-400/10";

    case "Project":
      return "text-purple-400 bg-purple-400/10";

    case "Credential":
      return "text-[var(--primary)] bg-[var(--primary-soft)]";

    case "Category":
      return "text-orange-400 bg-orange-400/10";

    case "Tag":
      return "text-cyan-400 bg-cyan-400/10";
  }
}

export const openCommandMenu = () => {
  window.dispatchEvent(new Event("clientvault:open-command-menu"));
};

export function CommandMenu() {
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [items, setItems] = useState<SearchItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * ----------------------------------------
   * Keyboard Shortcut
   * ----------------------------------------
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /*
   * ----------------------------------------
   * Open from Header
   * ----------------------------------------
   */
  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };

    window.addEventListener("clientvault:open-command-menu", handleOpen);

    return () => {
      window.removeEventListener("clientvault:open-command-menu", handleOpen);
    };
  }, []);

  /*
   * ----------------------------------------
   * Reset when closed
   * ----------------------------------------
   */
  useEffect(() => {
    if (!open) {
      setQuery("");

      setItems([]);

      setError(null);

      setIsLoading(false);

      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /*
   * ----------------------------------------
   * Search API
   *
   * Debounced by 250ms.
   * ----------------------------------------
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setItems([]);

      setError(null);

      setIsLoading(false);

      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const params = new URLSearchParams();

        params.set("q", normalizedQuery);

        const response = await fetch(`/api/search?${params.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data: SearchResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to search.");
        }

        setItems(transformSearchResults(data));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Global search error:", error);

        setItems([]);

        setError(error instanceof Error ? error.message : "Failed to search.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);

      controller.abort();
    };
  }, [query, open]);

  /*
   * ----------------------------------------
   * Group Results
   * ----------------------------------------
   */
  const groupedItems = useMemo(() => {
    return typeOrder
      .map((type) => ({
        type,
        items: items.filter((item) => item.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [items]);

  const closeMenu = () => {
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search size={17} className="shrink-0 text-[var(--muted)]" />

          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients, projects, credentials..."
            className="h-14 min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[var(--muted)]"
          />

          {isLoading && (
            <Loader2
              size={15}
              className="shrink-0 animate-spin text-[var(--muted)]"
            />
          )}

          <button
            type="button"
            onClick={closeMenu}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {/* Initial state */}
          {!query.trim() && !isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--muted)]">
                <Search size={17} />
              </div>

              <p className="mt-3 text-[12px] font-medium text-white">
                Search your vault
              </p>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Search clients, projects, credentials, categories and tags.
              </p>
            </div>
          )}

          {/* Loading */}
          {query.trim() && isLoading && items.length === 0 && (
            <SearchSkeleton />
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Search size={17} />
              </div>

              <p className="mt-3 text-[12px] font-medium text-white">
                Search failed
              </p>

              <p className="mt-1 text-[11px] text-[var(--muted)]">{error}</p>
            </div>
          )}

          {/* No Results */}
          {query.trim() &&
            !isLoading &&
            !error &&
            groupedItems.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--muted)]">
                  <Search size={17} />
                </div>

                <p className="mt-3 text-[12px] font-medium text-white">
                  No results found
                </p>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Try searching for a client, project, credential, category or
                  tag.
                </p>
              </div>
            )}

          {/* Results */}
          {!error &&
            groupedItems.length > 0 &&
            groupedItems.map((group) => (
              <div key={group.type} className="mb-2 last:mb-0">
                <div className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  {group.type}s
                </div>

                {group.items.map((item) => {
                  const Icon = getTypeIcon(item.type);

                  const iconColor = getTypeColor(item.type);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={closeMenu}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                      >
                        <Icon size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-white">
                          {item.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                          {item.description}
                        </p>
                      </div>

                      <span className="hidden text-[10px] text-[var(--muted)] sm:block">
                        {item.type}
                      </span>

                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[var(--muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  );
                })}
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2.5">
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <Command size={12} />

            <span>Quick Search</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <span className="rounded border border-[var(--border)] px-1.5 py-0.5">
              ESC
            </span>

            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Transform API Results
----------------------------------------- */

function transformSearchResults(data: SearchResponse): SearchItem[] {
  const items: SearchItem[] = [];

  /*
   * Clients
   */
  data.results.clients.forEach((client) => {
    items.push({
      id: `client-${client._id}`,

      name: client.name,

      description:
        client.company || client.email || client.contactPerson || "Client",

      type: "Client",

      href: `/clients/${client._id}`,
    });
  });

  /*
   * Projects
   */
  data.results.projects.forEach((project) => {
    const clientName = project.client?.name;

    const type = formatProjectType(project.type);

    items.push({
      id: `project-${project._id}`,

      name: project.name,

      description: [clientName, type].filter(Boolean).join(" • "),

      type: "Project",

      href: `/projects/${project._id}`,
    });
  });

  /*
   * Credentials
   */
  data.results.credentials.forEach((credential) => {
    const parts = [credential.client?.name, credential.category?.name].filter(
      Boolean,
    );

    if (credential.projects.length > 0) {
      parts.push(credential.projects[0].name);
    }

    items.push({
      id: `credential-${credential._id}`,

      name: credential.name,

      description: parts.join(" • ") || "Credential",

      type: "Credential",

      href: `/credentials/${credential._id}`,
    });
  });

  /*
   * Categories
   */
  data.results.categories.forEach((category) => {
    items.push({
      id: `category-${category._id}`,

      name: category.name,

      description: category.description || "Credential category",

      type: "Category",

      /*
       * There is no category detail
       * page in the current structure,
       * so navigate to the category
       * management page.
       */
      href: "/categories",
    });
  });

  /*
   * Tags
   */
  data.results.tags.forEach((tag) => {
    items.push({
      id: `tag-${tag._id}`,

      name: tag.name,

      description: "Credential tag",

      type: "Tag",

      href: "/tags",
    });
  });

  return items;
}

/* ----------------------------------------
   Project Type
----------------------------------------- */

function formatProjectType(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ----------------------------------------
   Search Skeleton
----------------------------------------- */

function SearchSkeleton() {
  return (
    <div className="space-y-1">
      <div className="px-3 pb-1.5 pt-2">
        <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.05]" />
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-white/[0.05]" />

          <div className="min-w-0 flex-1">
            <div className="h-3 w-32 animate-pulse rounded bg-white/[0.05]" />

            <div className="mt-2 h-2.5 w-48 max-w-full animate-pulse rounded bg-white/[0.035]" />
          </div>

          <div className="h-2.5 w-14 animate-pulse rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}
