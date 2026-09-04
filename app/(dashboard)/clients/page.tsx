"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const clients = [
  {
    id: 1,
    name: "GumJoy",
    email: "enquiries@gumjoy.co.uk",
    projects: 2,
    credentials: 18,
    status: "Active",
    activity: "2 hours ago",
    initials: "G",
    color: "bg-emerald-500",
  },
  {
    id: 2,
    name: "Wilder Side of Sports",
    email: "mike@wildersideofsports.com",
    projects: 3,
    credentials: 26,
    status: "Active",
    activity: "5 hours ago",
    initials: "W",
    color: "bg-yellow-500",
  },
  {
    id: 3,
    name: "SyncSurge Agency",
    email: "hello@syncsurge.com",
    projects: 2,
    credentials: 14,
    status: "Active",
    activity: "1 day ago",
    initials: "S",
    color: "bg-red-500",
  },
  {
    id: 4,
    name: "Afrosmile Backpackers",
    email: "info@afrosmilebackpackers.com",
    projects: 1,
    credentials: 7,
    status: "Active",
    activity: "2 days ago",
    initials: "A",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Eastern Kitchenware",
    email: "info@easternkitchenware.com",
    projects: 1,
    credentials: 9,
    status: "Inactive",
    activity: "5 days ago",
    initials: "E",
    color: "bg-slate-300",
  },
  {
    id: 6,
    name: "HomeChoice",
    email: "support@homechoice.com",
    projects: 1,
    credentials: 6,
    status: "Active",
    activity: "1 week ago",
    initials: "H",
    color: "bg-blue-500",
  },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All Status" || client.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
            Clients
          </h1>

          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Manage all your clients in one place.
          </p>
        </div>

        {/* <button className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-[12px] font-semibold text-[#041109] transition-colors hover:bg-[var(--primary-hover)]">
          <Plus size={15} strokeWidth={2.2} />
          Add Client
        </button> */}
        <Link
          href="/clients/new"
          className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-[14px] text-[#041109] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add Client
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
            placeholder="Search clients..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-[#59656d]"
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Client
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Contact
                </th>

                <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                  Projects
                </th>

                <th className="px-5 py-4 text-center text-[11px] font-medium text-[#65727a]">
                  Credentials
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-medium text-[#65727a]">
                  Last Activity
                </th>

                <th className="w-12 px-3 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="group border-b border-white/[0.035] transition-colors last:border-0 hover:bg-white/[0.018]"
                >
                  {/* Client */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${client.color} text-[12px] font-semibold text-white`}
                      >
                        {client.initials}
                      </span>

                      <span className="text-[12px] font-medium text-[#dce1e4] transition-colors hover:text-white">
                        {client.name}
                      </span>
                    </Link>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <span className="text-[12px] text-[#78858d]">
                      {client.email}
                    </span>
                  </td>

                  {/* Projects */}
                  <td className="px-5 py-4 text-center text-[12px] text-[#aab4b9]">
                    {client.projects}
                  </td>

                  {/* Credentials */}
                  <td className="px-5 py-4 text-center text-[12px] text-[#aab4b9]">
                    {client.credentials}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-md px-2.5 py-1.5 text-[10px] font-medium",
                        client.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/[0.06] text-[#7d8991]",
                      ].join(" ")}
                    >
                      {client.status}
                    </span>
                  </td>

                  {/* Activity */}
                  <td className="px-5 py-4 text-[12px] text-[#78858d]">
                    {client.activity}
                  </td>

                  {/* Menu */}
                  <td className="px-3 py-4">
                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#65727a] opacity-70 transition-all hover:bg-white/[0.05] hover:text-white group-hover:opacity-100">
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-[12px] text-[#65727a]"
                  >
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <span className="text-[11px] text-[#65727a]">
            Showing {filteredClients.length} of {clients.length} clients
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
