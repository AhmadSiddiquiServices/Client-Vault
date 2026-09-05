import { KeyRound } from "lucide-react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]/[0.045] blur-[100px]" />

      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--card)] shadow-[0_0_40px_rgba(0,230,118,0.08)]">
          <div className="absolute inset-0 rounded-2xl bg-[var(--primary)]/[0.06] animate-pulse" />

          <KeyRound
            size={24}
            strokeWidth={1.8}
            className="relative text-[var(--primary)]"
          />
        </div>

        {/* Brand */}
        <p className="mt-4 text-[15px] font-semibold tracking-tight text-white">
          ClientVault
        </p>

        <p className="mt-1 text-[10px] text-[#59656d]">
          Securing your workspace
        </p>

        {/* Loader */}
        <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-1/2 animate-[loader_1.4s_ease-in-out_infinite] rounded-full bg-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}
