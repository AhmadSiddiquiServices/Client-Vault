"use client";

import Link from "next/link";
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to sign in. Please check your credentials.",
        );

        return;
      }

      /**
       * The API has already set the HTTP-only session cookie.
       *
       * We do NOT store the token in localStorage/sessionStorage.
       */
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login request failed:", error);

      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <div className="flex min-h-screen">
        {/* Left branding panel */}
        <div className="relative hidden overflow-hidden border-r border-[var(--border)] lg:flex lg:w-[46%]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,230,118,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(0,230,118,0.06),transparent_35%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-black">
                <KeyRound size={20} />
              </div>

              <span className="text-[17px] font-semibold tracking-tight">
                ClientVault
              </span>
            </div>

            {/* Main message */}
            <div className="max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5">
                <ShieldCheck size={13} className="text-[var(--primary)]" />

                <span className="text-[10px] font-medium text-[var(--muted)]">
                  Secure credential management
                </span>
              </div>

              <h1 className="text-[38px] font-semibold leading-[1.08] tracking-tight text-white xl:text-[44px]">
                Your clients.
                <br />
                Your projects.
                <br />
                <span className="text-[var(--primary)]">One secure vault.</span>
              </h1>

              <p className="mt-6 max-w-sm text-[13px] leading-6 text-[var(--muted)]">
                Keep client credentials, projects, domains, hosting,
                subscriptions and sensitive information organized in one secure
                workspace.
              </p>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-[var(--muted)]">
              © {new Date().getFullYear()} ClientVault. All rights reserved.
            </p>
          </div>
        </div>

        {/* Login panel */}
        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[54%] lg:px-12">
          <div className="w-full max-w-[410px]">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-black">
                <KeyRound size={18} />
              </div>

              <span className="text-[16px] font-semibold">ClientVault</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-[26px] font-semibold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
                Sign in to access your ClientVault workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-[11px] leading-5 text-red-400"
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  required
                  className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 text-[12px] text-white outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium text-[var(--muted)]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium text-[var(--primary)] transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    required
                    className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 pr-11 text-[12px] text-white outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--border)] bg-[var(--card)] accent-[var(--primary)]"
                />

                <span className="text-[11px] text-[var(--muted)]">
                  Remember me
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-black transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={15} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="mt-8 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--primary)]"
              />

              <p className="text-[10px] leading-5 text-[var(--muted)]">
                Your connection is protected. ClientVault keeps sensitive
                credential information private and secure.
              </p>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-[10px] text-[var(--muted)]">
              Access to this application is restricted to authorized users.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
