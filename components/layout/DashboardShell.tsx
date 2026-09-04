import { CommandMenu } from "./CommandMenu";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="lg:pl-[156px]">
        <Header />

        <main className="p-4 sm:p-5">{children}</main>

        <CommandMenu />
      </div>
    </div>
  );
}
