"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password],
  );

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isValidPassword =
    passwordRequirements.length &&
    passwordRequirements.uppercase &&
    passwordRequirements.number;

  const canSubmit = Boolean(token && isValidPassword && passwordsMatch);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to reset your password.");
      }

      setResetComplete(true);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[1fr_0.9fr]">
        {/* Left Branding Panel */}
        <section className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[var(--primary)]/10 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--primary)]/5 blur-[140px]" />

          <div className="relative z-10 p-10 xl:p-12">
            <Link href="/login" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                <KeyRound className="h-5 w-5 text-[var(--primary)]" />
              </div>

              <div>
                <div className="text-[17px] font-semibold tracking-tight">
                  ClientVault
                </div>
                <div className="text-[10px] text-[var(--muted)]">
                  Secure client management
                </div>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl px-10 pb-20 xl:px-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-1.5 text-[11px] font-medium text-[var(--primary)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure credential management
            </div>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl">
              Create a new
              <span className="block text-[var(--primary)]">
                secure password.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-[var(--muted)]">
              Choose a strong password to keep your ClientVault account and
              sensitive credentials protected.
            </p>
          </div>

          <div className="relative z-10 border-t border-[var(--border)] px-10 py-5 text-[11px] text-[var(--muted)] xl:px-12">
            Your credentials. Your clients. Protected.
          </div>
        </section>

        {/* Right Form Panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex lg:hidden">
              <Link href="/login" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                  <KeyRound className="h-5 w-5 text-[var(--primary)]" />
                </div>

                <div>
                  <div className="text-[17px] font-semibold tracking-tight">
                    ClientVault
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Secure client management
                  </div>
                </div>
              </Link>
            </div>

            {!resetComplete ? (
              <>
                {/* Back */}
                <Link
                  href="/login"
                  className="mb-8 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>

                {/* Heading */}
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                    <LockKeyhole className="h-5 w-5 text-[var(--primary)]" />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight">
                    Reset your password
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
                    Create a new password for your ClientVault account.
                  </p>
                </div>

                {/* Missing Token */}
                {!token && (
                  <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
                    <p className="text-[11px] leading-5 text-red-400">
                      This password reset link is invalid or missing its reset
                      token.
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
                    <p className="text-[11px] leading-5 text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        disabled={!token || isSubmitting}
                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-11 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={!token || isSubmitting}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-white disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                      <PasswordRequirement
                        active={passwordRequirements.length}
                        text="8+ characters"
                      />

                      <PasswordRequirement
                        active={passwordRequirements.uppercase}
                        text="Uppercase"
                      />

                      <PasswordRequirement
                        active={passwordRequirements.number}
                        text="Number"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        disabled={!token || isSubmitting}
                        className={`h-11 w-full rounded-lg border bg-[var(--card)] pl-10 pr-11 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                          confirmPassword.length > 0 && !passwordsMatch
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-[var(--border)] focus:border-[var(--primary)]"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        disabled={!token || isSubmitting}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-white disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="mt-2 text-[10px] text-red-400">
                        Passwords do not match.
                      </p>
                    )}

                    {passwordsMatch && (
                      <p className="mt-2 text-[10px] text-[var(--primary)]">
                        Passwords match.
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? "Resetting password..." : "Reset password"}
                  </button>
                </form>

                {/* Security Note */}
                <div className="mt-8 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />

                  <p className="text-[10px] leading-5 text-[var(--muted)]">
                    Use a unique password that you don&apos;t use for other
                    accounts. Your password will be securely protected once
                    saved.
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                  <CheckCircle2 className="h-6 w-6 text-[var(--primary)]" />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Password reset successful
                </h2>

                <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">
                  Your password has been updated successfully. You can now sign
                  in using your new password.
                </p>

                <Link
                  href="/login"
                  className="mt-7 flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-all hover:bg-[var(--primary-hover)]"
                >
                  Continue to sign in
                </Link>

                <div className="mt-5 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />

                  <p className="text-[10px] leading-5 text-[var(--muted)]">
                    Your account is ready. Keep your new password private and
                    never share it with anyone.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordRequirement({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {
  return (
    <div
      className={`rounded-md border px-2.5 py-2 text-[10px] transition-colors ${
        active
          ? "border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
      }`}
    >
      {text}
    </div>
  );
}
