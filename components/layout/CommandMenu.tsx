"use client";

import {
  ArrowRight,
  Command,
  FolderKanban,
  KeyRound,
  Search,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  id: string;
  name: string;
  description: string;
  type: "Client" | "Project" | "Credential" | "Category" | "Tag";
  href: string;
};

const searchItems: SearchItem[] = [
  // Clients
  {
    id: "client-1",
    name: "GumJoy",
    description: "enquiries@gumjoy.co.uk",
    type: "Client",
    href: "/clients/1",
  },
  {
    id: "client-2",
    name: "Wilder Side of Sports",
    description: "Sports & media client",
    type: "Client",
    href: "/clients/2",
  },
  {
    id: "client-3",
    name: "SyncSurge Agency",
    description: "Digital agency client",
    type: "Client",
    href: "/clients/3",
  },
  {
    id: "client-4",
    name: "Afrosmile Backpackers",
    description: "Travel & hospitality client",
    type: "Client",
    href: "/clients/4",
  },

  // Projects
  {
    id: "project-1",
    name: "GumJoy E-Commerce Website",
    description: "GumJoy • Shopify Store",
    type: "Project",
    href: "/projects/1",
  },
  {
    id: "project-2",
    name: "GumJoy Marketing",
    description: "GumJoy • Marketing",
    type: "Project",
    href: "/projects/2",
  },
  {
    id: "project-3",
    name: "SyncSurge Website",
    description: "SyncSurge Agency • Website",
    type: "Project",
    href: "/projects/3",
  },
  {
    id: "project-4",
    name: "Wilder Sports Store",
    description: "Wilder Side of Sports • Website",
    type: "Project",
    href: "/projects/4",
  },

  // Credentials
  {
    id: "credential-1",
    name: "Shopify Admin",
    description: "GumJoy • E-Commerce",
    type: "Credential",
    href: "/credentials/cred-1",
  },
  {
    id: "credential-2",
    name: "Cloudinary",
    description: "GumJoy • Storage / Media",
    type: "Credential",
    href: "/credentials/cred-2",
  },
  {
    id: "credential-3",
    name: "Google Analytics",
    description: "GumJoy • Analytics",
    type: "Credential",
    href: "/credentials/cred-3",
  },
  {
    id: "credential-4",
    name: "GitHub - Main Account",
    description: "GumJoy • Development",
    type: "Credential",
    href: "/credentials/cred-4",
  },
  {
    id: "credential-5",
    name: "Cloudflare",
    description: "GumJoy • Domain / DNS",
    type: "Credential",
    href: "/credentials/cred-6",
  },
  {
    id: "credential-6",
    name: "Vercel",
    description: "SyncSurge Agency • Hosting",
    type: "Credential",
    href: "/credentials/cred-7",
  },

  // Categories
  {
    id: "category-1",
    name: "E-Commerce",
    description: "Online stores and e-commerce platforms",
    type: "Category",
    href: "/categories/1",
  },
  {
    id: "category-2",
    name: "Development",
    description: "Development and source control",
    type: "Category",
    href: "/categories/2",
  },
  {
    id: "category-3",
    name: "Hosting",
    description: "Hosting and deployment services",
    type: "Category",
    href: "/categories/3",
  },
  {
    id: "category-4",
    name: "Database",
    description: "Database and data services",
    type: "Category",
    href: "/categories/4",
  },

  // Tags
  {
    id: "tag-1",
    name: "production",
    description: "Environment",
    type: "Tag",
    href: "/tags/1",
  },
  {
    id: "tag-2",
    name: "admin",
    description: "Access",
    type: "Tag",
    href: "/tags/2",
  },
  {
    id: "tag-3",
    name: "shopify",
    description: "Technology",
    type: "Tag",
    href: "/tags/3",
  },
  {
    id: "tag-4",
    name: "wordpress",
    description: "Technology",
    type: "Tag",
    href: "/tags/4",
  },
  {
    id: "tag-5",
    name: "development",
    description: "Technology",
    type: "Tag",
    href: "/tags/5",
  },
];

const typeOrder: SearchItem["type"][] = [
  "Client",
  "Project",
  "Credential",
  "Category",
  "Tag",
];

function getTypeIcon(type: SearchItem["type"]) {
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

function getTypeColor(type: SearchItem["type"]) {
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

  // Keyboard shortcut
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

  // Open from Header search button
  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };

    window.addEventListener("clientvault:open-command-menu", handleOpen);

    return () => {
      window.removeEventListener("clientvault:open-command-menu", handleOpen);
    };
  }, []);

  // Lock page scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchItems;
    }

    return searchItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.type.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  const groupedItems = useMemo(() => {
    return typeOrder
      .map((type) => ({
        type,
        items: filteredItems.filter((item) => item.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems]);

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

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {groupedItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--muted)]">
                <Search size={17} />
              </div>

              <p className="mt-3 text-[12px] font-medium text-white">
                No results found
              </p>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Try searching for a client, project, credential or tag.
              </p>
            </div>
          ) : (
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
                      onClick={() => setOpen(false)}
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
            ))
          )}
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
