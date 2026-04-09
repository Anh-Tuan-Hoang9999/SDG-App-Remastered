import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import client from "../api/client";

const STEP = { FORM: 1, VERIFY: 2 };
const RESEND_COOLDOWN = 60; // seconds
const TRENTU_DOMAIN   = "@trentu.ca";

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

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep]   = useState(STEP.FORM);
  const [form, setForm]   = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    coordinatorVerifyCode: "",
  });
  const [code, setCode]           = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [cooldown, setCooldown]   = useState(0); // seconds until resend is allowed
  const passwordStrength = getPasswordStrength(form.password);

  // Count down the resend cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isTrentEmail = (email) => email.trim().toLowerCase().endsWith("@trentu.ca");

  // ── Step 1: validate locally then send verification code ──────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.toLowerCase().endsWith(TRENTU_DOMAIN)) {
      setError(`Only ${TRENTU_DOMAIN} email addresses are allowed.`);
      return;
    }
    if (!passwordStrength.isValid) {
      setError("Please create a stronger password before continuing.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const verifyCode = form.coordinatorVerifyCode.trim();
    if (verifyCode && verifyCode !== "2101") {
      setError("Invalid coordinator verification code.");
      return;
    }

    setLoading(true);
    try {
      await client.post("/api/auth/send-verification-code", { email: form.email });
      setStep(STEP.VERIFY);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not send verification code. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await client.post("/api/auth/send-verification-code", { email: form.email });
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Could not resend code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify code then create account ───────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await client.post("/api/auth/verify-code", { email: form.email, code });

      const isCoordinator = form.coordinatorVerifyCode.trim() === "2101";
      await client.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: isCoordinator ? "coordinator" : "student",
      });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Unable to connect. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Shared left panel ─────────────────────────────────────────────────────
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
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-none">SDG Co-op Portal</p>
          <p className="text-sm leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Trent University</p>
        </div>
      </div>

      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(200,169,81,0.2)", color: "#C8A951" }}
        >
          Co-op Learning Platform
        </div>
        <h1 className="text-4xl font-bold text-white leading-snug mb-4">
          Start making an impact<br />
          <span style={{ color: "#C8A951" }}>from day one.</span>
        </h1>
        <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Join Trent University's co-op community. Explore the UN Sustainable
          Development Goals, document your learning, and track the difference
          your work makes in the world.
        </p>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        Career Space · Trent University
      </p>
    </aside>
  );

  // ── Mobile logo ───────────────────────────────────────────────────────────
  const MobileLogo = (
    <div className="lg:hidden mb-8 text-center">
      <div className="inline-flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#36656B" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-bold text-base" style={{ color: "#1A2E1A" }}>SDG Co-op Portal</span>
      </div>
    </div>
  );

  const ErrorBox = error ? (
    <div
      className="px-4 py-3 rounded-xl text-sm"
      style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
    >
      {error}
    </div>
  ) : null;

  // ── Step 1 — registration form ────────────────────────────────────────────
  if (step === STEP.FORM) {
    return (
      <div className="min-h-screen flex">
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
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>Create your account</h2>
            <p className="text-sm mb-8" style={{ color: "#637063" }}>
              Join the SDG co-op learning platform at Trent University.
            </p>

            <form onSubmit={handleSendCode} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                  Full name
                </label>
                <input
                  className="auth-input"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                  Email address
                </label>
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="yourname@trentu.ca"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                  Password
                </label>
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
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
                  Confirm password
                </label>
                <input
                  className="auth-input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div
                className="flex flex-col gap-2 rounded-xl p-4"
                style={{ background: "#F8FBF9", border: "1px solid #DDE6DD" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#36656B" }}>
                  Coordinator Verify (Optional)
                </p>
                <p className="text-xs" style={{ color: "#637063" }}>
                  Enter code 2101 to register as a coordinator.
                </p>
                <input
                  className="auth-input"
                  type="text"
                  name="coordinatorVerifyCode"
                  placeholder="2101"
                  value={form.coordinatorVerifyCode}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              {ErrorBox}

              <button className="btn-primary mt-1" type="submit" disabled={loading}>
                {loading ? "Sending code…" : "Send Verification Code"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: "#637063" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold transition-colors hover:underline"
                style={{ color: "#36656B" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Step 2 — enter verification code ─────────────────────────────────────
  return (
    <div className="min-h-screen flex">
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
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>Check your email</h2>
          <p className="text-sm mb-2" style={{ color: "#637063" }}>
            We sent a 6-digit verification code to
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: "#36656B" }}>
            {form.email}
          </p>

          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#637063" }}>
                Verification code
              </label>
              <input
                className="auth-input text-center text-xl tracking-[0.4em] font-mono"
                type="text"
                name="verificationCode"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
            </div>

            {ErrorBox}

            <button className="btn-primary mt-1" type="submit" disabled={loading || code.length < 6}>
              {loading ? "Verifying…" : "Verify & Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: "#637063" }}>
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: "#36656B", background: "none", border: "none", padding: 0, cursor: cooldown > 0 ? "not-allowed" : "pointer" }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setStep(STEP.FORM); setError(""); setCode(""); }}
            className="mt-4 w-full text-center text-sm transition-colors hover:underline"
            style={{ color: "#9BAA9B", background: "none", border: "none", cursor: "pointer" }}
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
}
