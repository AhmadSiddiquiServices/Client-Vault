"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to process your request.");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTryAnotherEmail() {
    setSubmitted(false);
    setError("");
    setEmail("");
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
              Get back into your
              <span className="block text-[var(--primary)]">secure vault.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-[var(--muted)]">
              Reset your password and securely regain access to your clients,
              projects and credentials.
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

            {/* Back */}
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>

            {!submitted ? (
              <>
                {/* Heading */}
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10">
                    <LockKeyhole className="h-5 w-5 text-[var(--primary)]" />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight">
                    Forgot your password?
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
                    No problem. Enter the email address associated with your
                    account and we&apos;ll send you a password reset link.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3.5 py-3">
                    <p className="text-[11px] leading-5 text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-[12px] text-white outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-black transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending reset link..." : "Send reset link"}
                  </button>
                </form>

                {/* Security Note */}
                <div className="mt-8 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />

                  <p className="text-[10px] leading-5 text-[var(--muted)]">
                    For security, password reset links are temporary and can
                    only be used once.
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
                  Check your email
                </h2>

                <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">
                  If an account exists for{" "}
                  <span className="font-medium text-white">{email}</span>, a
                  password reset link has been sent to that address.
                </p>

                <div className="mt-7 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                  <p className="text-[11px] leading-5 text-[var(--muted)]">
                    Didn&apos;t receive the email? Check your spam folder or try
                    again with a different email address.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTryAnotherEmail}
                  className="mt-5 h-11 w-full rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-white transition-colors hover:border-[var(--border-hover)] hover:bg-white/[0.03]"
                >
                  Try another email
                </button>

                <Link
                  href="/login"
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-lg text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-white"
                >
                  Back to sign in
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
