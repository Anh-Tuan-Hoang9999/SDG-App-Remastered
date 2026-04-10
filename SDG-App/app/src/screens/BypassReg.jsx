import { useState } from "react";
import { useNavigate, Link } from "react-router";
import client from "../api/client";

const TRENTU_DOMAIN = "@trentu.ca";

export default function BypassReg() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    coordinatorVerifyCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.toLowerCase().endsWith(TRENTU_DOMAIN)) {
      setError(`Only ${TRENTU_DOMAIN} email addresses are allowed.`);
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
      const isCoordinator = form.coordinatorVerifyCode.trim() === "2101";
      await client.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: isCoordinator ? "coordinator" : "student",
      }, {
        headers: {
          "X-Bypass-Verification": "true",
        },
      });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Unable to create account. Please check your connection and try again."
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
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>Bypass Register (Dev)</h2>
          <p className="text-sm mb-8" style={{ color: "#637063" }}>
            Test-only registration page that creates accounts without the email code step.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
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
              {loading ? "Creating account…" : "Create Account (Bypass)"}
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
