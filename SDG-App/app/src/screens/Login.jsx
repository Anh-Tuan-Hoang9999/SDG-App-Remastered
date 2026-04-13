import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../authContext";
import client from "../api/client";

const SDG_COLOURS = [
  "#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2",
  "#FCC30B","#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E",
  "#3F7E44","#0A97D9","#56C02B","#00689D","#19486A",
];

const SDG_NAMES = [
  "No Poverty","Zero Hunger","Good Health","Quality Education","Gender Equality",
  "Clean Water","Clean Energy","Decent Work","Industry","Reduced Inequalities",
  "Sustainable Cities","Responsible Consumption","Climate Action",
  "Life Below Water","Life on Land","Peace & Justice","Partnerships",
];

export default function Login() {
  const navigate = useNavigate();
  const { login, user, sessionExpired } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);
  useEffect(() => {
    if (sessionExpired) setError("Your session has expired. Please log in again.");
  }, [sessionExpired]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      login(res.data.access_token);
    } catch (err) {
      setError(
        err.response?.data?.detail ??
        "Unable to connect. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-auth-page>

      {/* ── Left branding panel (desktop only) ─────────────────── */}
      <aside
        className="hidden lg:flex lg:w-[44%] flex-col justify-between px-12 py-10"
        style={{ background: "linear-gradient(160deg, #1A3B2E 0%, #2a5458 100%)" }}
      >
        {/* Logo + name */}
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

        {/* Main copy */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(200,169,81,0.2)", color: "#C8A951" }}
          >
            Co-op Learning Platform
          </div>
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Connect your work to a<br />
            <span style={{ color: "#C8A951" }}>sustainable future.</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Explore the 17 UN Sustainable Development Goals, complete learning activities,
            and reflect on how your co-op experience creates real impact.
          </p>


        </div>

        {/* Bottom tagline */}
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          Career Space · Trent University
        </p>
      </aside>

      {/* ── Right form panel ───────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "#F4F7F5" }}
      >
        {/* Mobile-only header */}
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

        {/* Card */}
        <div
          className="w-full max-w-md bg-white rounded-2xl p-8"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px #DDE6DD" }}
        >
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A2E1A" }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: "#637063" }}>
            Sign in to continue your SDG learning journey.
          </p>

          {sessionExpired && !error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#FEF9EC", border: "1px solid #F5D97A", color: "#92681A" }}
            >
              Your session has expired. Please sign in again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="-mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold transition-colors hover:underline"
                style={{ color: "#36656B" }}
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
              >
                {error}
              </div>
            )}

            <button className="btn-primary mt-1" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#637063" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "#36656B" }}
            >
              Create account
            </Link>
          </p>
        </div>


      </main>
    </div>
  );
}
