"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type LoginMode = "login" | "twoFactor" | "recovery";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null,
  );
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  /**
   * Prevent the OTP field from accepting
   * anything other than 6 digits.
   */
  function handleCodeChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

    setCode(digitsOnly);
  }

  function handleRecoveryCodeChange(value: string) {
    const normalized = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16)
      .toUpperCase();

    const groups = normalized.match(/.{1,4}/g) ?? [];

    setRecoveryCode(groups.join("-"));
  }

  /**
   * ----------------------------------------
   * Login
   * ----------------------------------------
   */
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
       * ----------------------------------------
       * 2FA required
       * ----------------------------------------
       *
       * The backend intentionally did NOT create
       * the authenticated session yet.
       */
      if (data.requiresTwoFactor) {
        if (!data.challengeId) {
          setError(
            "Unable to start two-factor verification. Please try again.",
          );

          return;
        }

        setChallengeId(data.challengeId);
        setResendAvailableAt(
          data.resendAvailableAt
            ? new Date(data.resendAvailableAt).getTime()
            : null,
        );
        setMode("twoFactor");
        setCode("");

        return;
      }

      /**
       * ----------------------------------------
       * Normal login
       * ----------------------------------------
       *
       * The API has already set the HTTP-only
       * session cookie.
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

  /**
   * ----------------------------------------
   * Verify 2FA code
   * ----------------------------------------
   */
  async function handleVerifyTwoFactor(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!challengeId) {
      setError(
        "Your verification request is no longer valid. Please sign in again.",
      );

      return;
    }

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");

      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          challengeId,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to verify the code. Please try again.",
        );

        return;
      }

      /**
       * OTP verification succeeded.
       *
       * The backend has now created the actual
       * authenticated session cookie.
       */
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("2FA verification request failed:", error);

      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * ----------------------------------------
   * Resend 2FA code
   * ----------------------------------------
   */
  async function handleResendTwoFactor() {
    if (loading || resending) {
      return;
    }

    if (!challengeId) {
      setError(
        "Your verification request is no longer valid. Please sign in again.",
      );

      return;
    }

    if (resendCountdown > 0) {
      return;
    }

    setError("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/2fa/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          challengeId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (
          response.status === 429 &&
          typeof data.retryAfterSeconds === "number"
        ) {
          setResendAvailableAt(Date.now() + data.retryAfterSeconds * 1000);
        }

        setError(data.message || "Unable to resend the verification code.");

        return;
      }

      /**
       * The server may return the same challenge ID,
       * but we use the response value as the source of truth.
       */
      if (data.challengeId) {
        setChallengeId(data.challengeId);
      }

      setCode("");

      if (data.resendAvailableAt) {
        setResendAvailableAt(new Date(data.resendAvailableAt).getTime());
      }

      toast.success("A new verification code has been sent.");
    } catch (error) {
      console.error("2FA resend request failed:", error);

      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setResending(false);
    }
  }

  /**
   * Return from OTP verification to normal login.
   */
  function handleBackToLogin() {
    if (loading || resending) {
      return;
    }

    setMode("login");
    setChallengeId("");
    setCode("");
    setRecoveryCode("");
    setError("");
    setResendAvailableAt(null);
    setResendCountdown(0);
  }

  async function handleRecoveryCodeVerification(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!challengeId) {
      setError(
        "Your verification request is no longer valid. Please sign in again.",
      );

      return;
    }

    const normalizedCode = recoveryCode.replace(/-/g, "");

    if (normalizedCode.length !== 16) {
      setError("Please enter a valid recovery code.");

      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/recovery/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          challengeId,
          recoveryCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to verify the recovery code. Please try again.",
        );

        return;
      }

      /**
       * Recovery code verification succeeded.
       *
       * The backend has created the authenticated
       * session cookie.
       */
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Recovery code verification request failed:", error);

      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode !== "twoFactor" || resendAvailableAt === null) {
      setResendCountdown(0);
      return;
    }

    const targetTime = resendAvailableAt;

    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.ceil((targetTime - Date.now()) / 1000),
      );

      setResendCountdown(remaining);
    }

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [mode, resendAvailableAt]);

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

        {/* Authentication panel */}
        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[54%] lg:px-12">
          <div className="w-full max-w-[410px]">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-black">
                <KeyRound size={18} />
              </div>

              <span className="text-[16px] font-semibold">ClientVault</span>
            </div>

            {mode === "login" ? (
              <>
                {/* Login heading */}
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

                {/* Login form */}
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
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
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
              </>
            ) : mode === "twoFactor" ? (
              <>
                {/* 2FA heading */}
                <div className="mb-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                    <Mail size={18} className="text-[var(--primary)]" />
                  </div>

                  <h2 className="text-[26px] font-semibold tracking-tight">
                    Verify your sign-in
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
                    We sent a 6-digit verification code to{" "}
                    <span className="font-medium text-white">{email}</span>.
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

                {/* 2FA form */}
                <form onSubmit={handleVerifyTwoFactor} className="space-y-5">
                  <div>
                    <label
                      htmlFor="two-factor-code"
                      className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                    >
                      Verification Code
                    </label>

                    <input
                      id="two-factor-code"
                      name="two-factor-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(event) => handleCodeChange(event.target.value)}
                      disabled={loading}
                      autoFocus
                      required
                      className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 text-center text-[20px] font-semibold tracking-[0.45em] text-white outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-black transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Verify Code
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px]">
                    <span className="text-[var(--muted)]">
                      Didn't receive the code?
                    </span>

                    {resendCountdown > 0 ? (
                      <span className="font-medium text-[var(--muted)]">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendTwoFactor}
                        disabled={loading || resending}
                        className="font-medium text-[var(--primary)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resending ? "Sending..." : "Resend Code"}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (loading || resending) return;

                      setMode("recovery");
                      setRecoveryCode("");
                      setError("");
                    }}
                    disabled={loading || resending}
                    className="text-[11px] font-medium text-[var(--primary)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Use a recovery code
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft size={14} />
                    Back to sign in
                  </button>
                </form>

                {/* Verification note */}
                <div className="mt-8 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--primary)]"
                  />

                  <p className="text-[10px] leading-5 text-[var(--muted)]">
                    Never share your verification code with anyone. ClientVault
                    will never ask you to provide this code outside of the
                    sign-in process.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Recovery heading */}
                <div className="mb-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                    <KeyRound size={18} className="text-[var(--primary)]" />
                  </div>

                  <h2 className="text-[26px] font-semibold tracking-tight">
                    Use a recovery code
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
                    Enter one of your saved recovery codes to complete your
                    sign-in.
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

                {/* Recovery code form */}
                <form
                  onSubmit={handleRecoveryCodeVerification}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="recovery-code"
                      className="mb-2 block text-[11px] font-medium text-[var(--muted)]"
                    >
                      Recovery Code
                    </label>

                    <input
                      id="recovery-code"
                      name="recovery-code"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      maxLength={19}
                      placeholder="ABCD-2345-EFGH-6789"
                      value={recoveryCode}
                      onChange={(event) =>
                        handleRecoveryCodeChange(event.target.value)
                      }
                      disabled={loading}
                      autoFocus
                      required
                      className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 text-center text-[15px] font-semibold tracking-[0.12em] text-white outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading || recoveryCode.replace(/-/g, "").length !== 16
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-black transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Verify Recovery Code
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (loading) return;

                      setMode("twoFactor");
                      setRecoveryCode("");
                      setError("");
                    }}
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] text-[11px] font-medium text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft size={14} />
                    Back to verification code
                  </button>
                </form>

                {/* Recovery note */}
                <div className="mt-8 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--primary)]"
                  />

                  <p className="text-[10px] leading-5 text-[var(--muted)]">
                    Each recovery code can only be used once. Keep your
                    remaining recovery codes stored in a secure location.
                  </p>
                </div>
              </>
            )}

            {/* Security note */}
            {mode === "login" && (
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
            )}

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
