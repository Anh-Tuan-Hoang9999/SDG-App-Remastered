import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import client from "../api/client";

const STEP = { REQUEST: 1, VERIFY: 2, RESET: 3 };
const RESEND_COOLDOWN = 60;
const TRENTU_DOMAIN = "@trentu.ca";

function getPasswordChecks(password) {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "One lowercase letter", passed: /[a-z]/.test(password) },
    { label: "One number", passed: /\d/.test(password) },
    { label: "One special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getPasswordStrength(password) {
  const checks = getPasswordChecks(password);
  const score = checks.filter((check) => check.passed).length;

  if (!password) return { label: "Not entered", color: "#9BAA9B", checks, isValid: false };
  if (score <= 2) return { label: "Weak", color: "#DC2626", checks, isValid: false };
  if (score <= 4) return { label: "Medium", color: "#A07C28", checks, isValid: false };
  return { label: "Strong", color: "#2F7D50", checks, isValid: true };
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.REQUEST);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const passwordStrength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.toLowerCase().endsWith(TRENTU_DOMAIN)) {
      setError(`Only ${TRENTU_DOMAIN} email addresses are allowed.`);
      return;
    }

    setLoading(true);
    try {
      const response = await client.post("/api/auth/request-password-reset", { email });
      setInfo(response.data.message ?? "If an account exists for that email, a password reset code has been sent.");
      setStep(STEP.VERIFY);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not send password reset code. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await client.post("/api/auth/verify-password-reset-code", {
        email,
        code,
      });
      setResetToken(response.data.reset_token);
      setStep(STEP.RESET);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not verify the reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!passwordStrength.isValid) {
      setError("Please create a stronger password before continuing.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await client.post("/api/auth/reset-password", {
        email,
        reset_token: resetToken,
        new_password: newPassword,
      });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await client.post("/api/auth/request-password-reset", { email });
      setInfo(response.data.message ?? "If an account exists for that email, a password reset code has been sent.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not resend password reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const LeftPanel = (
    <aside
      className="hidden lg:flex lg:w-[44%] flex-col justify-between px-12 py-10"
      style={{ background: "linear-gradient(160deg, #1A3B2E 0%, #2a5458 100%)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <path
              d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-none">SDG Co-op Portal</p>
          <p className="text-sm leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Trent University
          </p>
        </div>
      </div>

      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(200,169,81,0.2)", color: "#C8A951" }}
        >
          Account Recovery
        </div>
        <h1 className="text-4xl font-bold text-white leading-snug mb-4">
          Get back into your<br />
          <span style={{ color: "#C8A951" }}>SDG learning journey.</span>
        </h1>
        <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          We&apos;ll send a verification code to your Trent email, confirm it&apos;s really you,
          then let you choose a new password.
        </p>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        Career Space · Trent University
      </p>
    </aside>
  );

  const MobileLogo = (
    <div className="lg:hidden mb-8 text-center">
      <div className="inline-flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#36656B" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <path
              d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="font-bold text-base" style={{ color: "#1A2E1A" }}>
          SDG Co-op Portal
        </span>
      </div>
    </div>
  );

  const MessageBlock = (
    <>
      {info && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: "#F0F9F4", border: "1px solid #B9E3C4", color: "#25683A" }}
        >
          {info}
        </div>
      )}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
        >
          {error}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex" data-auth-page>
      {LeftPanel}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "#F4F7F5" }}
      >
        {MobileLogo}

        <div
          className="w-full max-w-md bg-white rounded-2xl p-8"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px #DDE6DD" }}
        >
          {step === STEP.REQUEST && (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>
                Forgot your password?
              </h2>
              <p className="text-sm mb-8" style={{ color: "#637063" }}>
                Enter your Trent email and we&apos;ll send you a verification code.
              </p>

              <form onSubmit={handleRequestCode} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                    Trent email
                  </label>
                  <input
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="yourname@trentu.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                {MessageBlock}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Sending code…" : "Send Reset Code"}
                </button>
              </form>
            </>
          )}

          {step === STEP.VERIFY && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep(STEP.REQUEST);
                  setError("");
                  setInfo("");
                }}
                className="text-sm font-semibold mb-6"
                style={{ color: "#36656B" }}
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>
                Check your email
              </h2>
              <p className="text-sm mb-6" style={{ color: "#637063" }}>
                Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
              </p>

              <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                    Verification code
                  </label>
                  <input
                    className="auth-input text-center tracking-[0.3em]"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                {MessageBlock}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="text-sm font-semibold"
                  style={{ color: cooldown > 0 ? "#9BAA9B" : "#36656B" }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </form>
            </>
          )}

          {step === STEP.RESET && (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>
                Create a new password
              </h2>
              <p className="text-sm mb-8" style={{ color: "#637063" }}>
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                    New password
                  </label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <div
                    className="rounded-xl px-3 py-3 mt-1"
                    style={{ background: "#F8FBF9", border: "1px solid #DDE6DD" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                        Password strength
                      </span>
                      <span className="text-xs font-semibold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {passwordStrength.checks.map((check) => (
                        <p
                          key={check.label}
                          className="text-xs"
                          style={{ color: check.passed ? "#2F7D50" : "#637063" }}
                        >
                          {check.passed ? "✓" : "•"} {check.label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                    Confirm new password
                  </label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {MessageBlock}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Updating password…" : "Update Password"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: "#637063" }}>
            Remembered it?{" "}
            <Link
              to="/login"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "#36656B" }}
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
