"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Filter,
  KeyRound,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

type Credential = {
  id: string;
  name: string;
  category: string;
  client: string;
  clientId: string;
  project: string;
  projectId: string;
  username: string;
  secret: string;
  tags: string[];
  favorite: boolean;
  updated: string;
};

const credentials: Credential[] = [
  {
    id: "cred-1",
    name: "Shopify Admin",
    category: "E-Commerce",
    client: "GumJoy",
    clientId: "1",
    project: "GumJoy E-Commerce Website",
    projectId: "1",
    username: "admin@gumjoy.co.uk",
    secret: "••••••••••••",
    tags: ["shopify", "admin", "production"],
    favorite: true,
    updated: "2 hours ago",
  },
  {
    id: "cred-2",
    name: "Cloudinary",
    category: "Storage / Media",
    client: "GumJoy",
    clientId: "1",
    project: "GumJoy E-Commerce Website",
    projectId: "1",
    username: "gumjoy-media",
    secret: "••••••••••••",
    tags: ["cloudinary", "media"],
    favorite: true,
    updated: "5 hours ago",
  },
  {
    id: "cred-3",
    name: "Google Analytics",
    category: "Analytics",
    client: "GumJoy",
    clientId: "1",
    project: "GumJoy E-Commerce Website",
    projectId: "1",
    username: "admin@gumjoy.co.uk",
    secret: "••••••••••••",
    tags: ["google", "analytics"],
    favorite: false,
    updated: "1 day ago",
  },
  {
    id: "cred-4",
    name: "GitHub - Main Account",
    category: "Development",
    client: "GumJoy",
    clientId: "1",
    project: "GumJoy E-Commerce Website",
    projectId: "1",
    username: "gumjoy-dev",
    secret: "••••••••••••",
    tags: ["github", "development", "git"],
    favorite: true,
    updated: "1 day ago",
  },
  {
    id: "cred-5",
    name: "WordPress Admin",
    category: "CMS",
    client: "Wilder Side of Sports",
    clientId: "2",
    project: "Wilder Side Website",
    projectId: "2",
    username: "admin@wildersideofsports.com",
    secret: "••••••••••••",
    tags: ["wordpress", "admin"],
    favorite: false,
    updated: "2 days ago",
  },
  {
    id: "cred-6",
    name: "Cloudflare",
    category: "Domain / DNS",
    client: "Wilder Side of Sports",
    clientId: "2",
    project: "Wilder Side Website",
    projectId: "2",
    username: "wilder-admin",
    secret: "••••••••••••",
    tags: ["cloudflare", "dns", "domain"],
    favorite: true,
    updated: "3 days ago",
  },
  {
    id: "cred-7",
    name: "Vercel",
    category: "Hosting",
    client: "SyncSurge Agency",
    clientId: "3",
    project: "SyncSurge Website",
    projectId: "3",
    username: "dev@syncsurge.com",
    secret: "••••••••••••",
    tags: ["vercel", "hosting", "deployment"],
    favorite: false,
    updated: "4 days ago",
  },
  {
    id: "cred-8",
    name: "MongoDB Atlas",
    category: "Database",
    client: "SyncSurge Agency",
    clientId: "3",
    project: "SyncSurge Website",
    projectId: "3",
    username: "syncsurge-db",
    secret: "••••••••••••",
    tags: ["mongodb", "database"],
    favorite: true,
    updated: "5 days ago",
  },
  {
    id: "cred-9",
    name: "Instagram",
    category: "Social Media",
    client: "Afrosmile Backpackers",
    clientId: "4",
    project: "Afrosmile Website",
    projectId: "4",
    username: "@afrosmilebackpackers",
    secret: "••••••••••••",
    tags: ["instagram", "social"],
    favorite: false,
    updated: "1 week ago",
  },
  {
    id: "cred-10",
    name: "Google Workspace",
    category: "Email",
    client: "Eastern Kitchenware",
    clientId: "5",
    project: "Eastern Kitchenware Website",
    projectId: "5",
    username: "admin@easternkitchenware.com",
    secret: "••••••••••••",
    tags: ["google", "email", "workspace"],
    favorite: false,
    updated: "1 week ago",
  },
];

const categories = [
  "All Categories",
  "E-Commerce",
  "Storage / Media",
  "Analytics",
  "Development",
  "CMS",
  "Domain / DNS",
  "Hosting",
  "Database",
  "Social Media",
  "Email",
];

const clients = [
  "All Clients",
  "GumJoy",
  "Wilder Side of Sports",
  "SyncSurge Agency",
  "Afrosmile Backpackers",
  "Eastern Kitchenware",
];

export default function CredentialsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [client, setClient] = useState("All Clients");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredCredentials = useMemo(() => {
    return credentials.filter((credential) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        credential.name.toLowerCase().includes(searchTerm) ||
        credential.username.toLowerCase().includes(searchTerm) ||
        credential.client.toLowerCase().includes(searchTerm) ||
        credential.project.toLowerCase().includes(searchTerm) ||
        credential.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      const matchesCategory =
        category === "All Categories" || credential.category === category;

      const matchesClient =
        client === "All Clients" || credential.client === client;

      const matchesFavorites = !favoritesOnly || credential.favorite;

      return (
        matchesSearch && matchesCategory && matchesClient && matchesFavorites
      );
    });
  }, [search, category, client, favoritesOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <KeyRound size={18} className="text-[var(--primary)]" />
            </div>

            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white">
                Credentials
              </h1>

              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                Securely manage credentials across all clients and projects.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/credentials/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[14px] text-black transition hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} />
          Add Credential
        </Link>
      </div>

      {/* Security banner */}
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
          <ShieldCheck size={16} className="text-[var(--primary)]" />
        </div>

        <div className="min-w-0">
          <p className="text-[12px] font-medium text-white">
            Your credentials are protected
          </p>

          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            Sensitive values are hidden by default and should only be revealed
            when needed.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search credentials, clients, projects, tags..."
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
            />
          </div>

          {/* Category */}
          <FilterSelect
            value={category}
            options={categories}
            onChange={setCategory}
          />

          {/* Client */}
          <FilterSelect value={client} options={clients} onChange={setClient} />

          {/* Favorites */}
          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-medium transition ${
              favoritesOnly
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-white"
            }`}
          >
            <Star size={14} fill={favoritesOnly ? "currentColor" : "none"} />
            Favorites
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_1.15fr_1.5fr_1.4fr_1.2fr_100px_44px] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] lg:grid">
          <div>Credential</div>
          <div>Category</div>
          <div>Client</div>
          <div>Project</div>
          <div>Username</div>
          <div>Updated</div>
          <div />
        </div>

        {/* Rows */}
        <div>
          {filteredCredentials.length > 0 ? (
            filteredCredentials.map((credential) => (
              <div
                key={credential.id}
                className="group grid gap-4 border-b border-[var(--border)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--background)] lg:grid-cols-[2fr_1.15fr_1.5fr_1.4fr_1.2fr_100px_44px] lg:items-center"
              >
                {/* Credential */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]">
                      <KeyRound size={15} className="text-[var(--primary)]" />
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/credentials/${credential.id}`}
                        className="block truncate text-[12px] font-semibold text-white transition hover:text-[var(--primary)]"
                      >
                        {credential.name}
                      </Link>

                      <div className="mt-1 flex items-center gap-2">
                        {credential.favorite && (
                          <Star
                            size={11}
                            fill="currentColor"
                            className="text-[var(--primary)]"
                          />
                        )}

                        <span className="text-[10px] text-[var(--muted)]">
                          Secure credential
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="inline-flex rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[10px] font-medium text-[var(--muted)]">
                    {credential.category}
                  </span>
                </div>

                {/* Client */}
                <div className="min-w-0">
                  <Link
                    href={`/clients/${credential.clientId}`}
                    className="block truncate text-[12px] font-medium text-white transition hover:text-[var(--primary)]"
                  >
                    {credential.client}
                  </Link>
                </div>

                {/* Project */}
                <div className="min-w-0">
                  <Link
                    href={`/projects/${credential.projectId}`}
                    className="block truncate text-[11px] text-[var(--muted)] transition hover:text-white"
                  >
                    {credential.project}
                  </Link>
                </div>

                {/* Username */}
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-white">
                    {credential.username}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-mono text-[10px] tracking-wider text-[var(--muted)]">
                      {credential.secret}
                    </span>

                    <button
                      type="button"
                      title="Reveal secret"
                      className="text-[var(--muted)] transition hover:text-white"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </div>

                {/* Updated */}
                <div>
                  <span className="text-[10px] text-[var(--muted)]">
                    {credential.updated}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    title="More actions"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] opacity-100 transition hover:bg-[var(--background)] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>

                {/* Tags - mobile/tablet */}
                <div className="flex flex-wrap gap-1.5 lg:hidden">
                  {credential.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[var(--background)] px-2 py-1 text-[10px] text-[var(--muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <KeyRound size={20} className="text-[var(--muted)]" />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold text-white">
                No credentials found
              </h3>

              <p className="mt-1 max-w-sm text-[11px] text-[var(--muted)]">
                Try changing your search or filters to find the credential
                you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {filteredCredentials.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[var(--muted)]">
              Showing{" "}
              <span className="font-medium text-white">
                1–{filteredCredentials.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white">
                {filteredCredentials.length}
              </span>{" "}
              credentials
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[var(--primary)] px-2 text-[11px] font-semibold text-black"
              >
                1
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Filter Select
----------------------------------------- */

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[170px] appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-[12px] text-white outline-none focus:border-[var(--primary)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
  );
}
