"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  FolderKanban,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const projects = [
  {
    id: "1",
    name: "GumJoy E-Commerce Website",
    client: "GumJoy",
    type: "Shopify Store",
    url: "gumjoy.co.uk",
    credentials: 12,
    status: "Active",
    updated: "2 hours ago",
  },
  {
    id: "2",
    name: "GumJoy Marketing",
    client: "GumJoy",
    type: "Marketing / Social",
    url: "—",
    credentials: 3,
    status: "Active",
    updated: "5 hours ago",
  },
  {
    id: "3",
    name: "Wilder Side Main Website",
    client: "Wilder Side of Sports",
    type: "Website",
    url: "wildersideofsports.com",
    credentials: 14,
    status: "Active",
    updated: "1 day ago",
  },
  {
    id: "4",
    name: "Wilder Sports Admin",
    client: "Wilder Side of Sports",
    type: "Internal System",
    url: "admin.wildersideofsports.com",
    credentials: 6,
    status: "Active",
    updated: "2 days ago",
  },
  {
    id: "5",
    name: "SyncSurge Agency Website",
    client: "SyncSurge Agency",
    type: "Website",
    url: "syncsurge.com",
    credentials: 8,
    status: "Active",
    updated: "3 days ago",
  },
  {
    id: "6",
    name: "Afrosmile Backpackers Website",
    client: "Afrosmile Backpackers",
    type: "Website",
    url: "afrosmilebackpackers.com",
    credentials: 7,
    status: "Active",
    updated: "4 days ago",
  },
  {
    id: "7",
    name: "HomeChoice Website",
    client: "HomeChoice",
    type: "WordPress",
    url: "homechoice.com",
    credentials: 6,
    status: "Inactive",
    updated: "1 week ago",
  },
  {
    id: "8",
    name: "Eastern Kitchenware Store",
    client: "Eastern Kitchenware",
    type: "E-Commerce",
    url: "easternkitchenware.com",
    credentials: 9,
    status: "Active",
    updated: "1 week ago",
  },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [client, setClient] = useState("All Clients");
  const [status, setStatus] = useState("All Status");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm) ||
        project.client.toLowerCase().includes(searchTerm) ||
        project.type.toLowerCase().includes(searchTerm) ||
        project.url.toLowerCase().includes(searchTerm);

      const matchesClient =
        client === "All Clients" || project.client === client;

      const matchesStatus =
        status === "All Status" || project.status === status;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [search, client, status]);

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
            Projects
          </h1>

          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Manage projects and websites across all your clients.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-[14px] text-[#041109] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add Project
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex h-10 w-full max-w-[340px] items-center gap-2.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
          <Search size={15} className="shrink-0 text-[#65727a]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-[#59656d]"
          />
        </div>

        {/* Client */}
        <div className="relative">
          <select
            value={client}
            onChange={(event) => setClient(event.target.value)}
            className="h-10 min-w-[150px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)]"
          >
            <option>All Clients</option>
            <option>GumJoy</option>
            <option>Wilder Side of Sports</option>
            <option>SyncSurge Agency</option>
            <option>Afrosmile Backpackers</option>
            <option>HomeChoice</option>
            <option>Eastern Kitchenware</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 min-w-[130px] appearance-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 pr-9 text-[12px] text-[#8b969d] outline-none focus:border-[var(--primary)]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65727a]"
          />
        </div>

        {/* Filter */}
        <button className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[#78858d] transition-colors hover:bg-white/[0.03] hover:text-white">
          <Filter size={15} />
        </button>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Project
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Client
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Website / URL
                </th>

                <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                  Credentials
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Last Updated
                </th>

                <th className="w-12 px-3 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="group border-b border-white/[0.035] transition-colors last:border-0 hover:bg-white/[0.018]"
                >
                  {/* Project */}
                  <td className="px-5 py-4">
                    <a
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <FolderKanban
                          size={16}
                          strokeWidth={1.7}
                          className="text-emerald-400"
                        />
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-medium text-[#dce1e4] transition-colors hover:text-white">
                          {project.name}
                        </span>
                      </span>
                    </a>
                  </td>

                  {/* Client */}
                  <td className="px-5 py-4">
                    <a
                      href="/clients/1"
                      className="text-[12px] text-[#aab4b9] transition-colors hover:text-[var(--primary)]"
                    >
                      {project.client}
                    </a>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-white/[0.045] px-2.5 py-1.5 text-[10px] font-medium text-[#9ca7ad]">
                      {project.type}
                    </span>
                  </td>

                  {/* URL */}
                  <td className="px-5 py-4">
                    {project.url === "—" ? (
                      <span className="text-[12px] text-[#59656d]">—</span>
                    ) : (
                      <a
                        href={`https://${project.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-[220px] items-center gap-1.5 truncate text-[12px] text-[#78858d] transition-colors hover:text-[var(--primary)]"
                      >
                        <span className="truncate">{project.url}</span>

                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                    )}
                  </td>

                  {/* Credentials */}
                  <td className="px-5 py-4 text-center">
                    <span className="text-[12px] font-medium text-[#aab4b9]">
                      {project.credentials}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-md px-2.5 py-1.5 text-[10px] font-medium",
                        project.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/[0.06] text-[#7d8991]",
                      ].join(" ")}
                    >
                      {project.status}
                    </span>
                  </td>

                  {/* Updated */}
                  <td className="px-5 py-4 text-[12px] text-[#78858d]">
                    {project.updated}
                  </td>

                  {/* Menu */}
                  <td className="px-3 py-4">
                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] opacity-70 transition-all hover:bg-white/[0.05] hover:text-white group-hover:opacity-100">
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-[12px] text-[#65727a]"
                  >
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
          <span className="text-[11px] text-[#65727a]">
            Showing {filteredProjects.length} of {projects.length} projects
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#4f5a61] transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--primary)] bg-[var(--primary-soft)] text-[11px] font-medium text-[var(--primary)]">
              1
            </button>

            {[2, 3, 4].map((page) => (
              <button
                key={page}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[11px] text-[#65727a] transition-colors hover:bg-white/[0.03] hover:text-white"
              >
                {page}
              </button>
            ))}

            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[#65727a] transition-colors hover:bg-white/[0.03] hover:text-white">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
