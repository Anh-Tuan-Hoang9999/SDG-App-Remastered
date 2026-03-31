
import React, { useState } from "react";
import { useNavigate } from "react-router";
import DefaultFooter from "../components/DefaultFooter";
import client from "../api/client";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await client.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.detail ?? "Network error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full bg-[#334d34] h-1/3 flex items-center justify-center relative overflow-hidden mt-[-90px]">
        <h1 className="text-3xl font-bold bg-[#334d34] text-white p-4 rounded-t-lg mt-[-50px]">
          Register
        </h1>
        <svg
          className="absolute bottom-[0px] w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 30 1240 190"
        >
          <path
            fill="#a2bf87"
            d="M0,128C120,160,240,192,360,186.7C480,181,600,139,720,122.7C840,107,960,117,1080,144C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="w-full bg-[#a2bf87] flex-1 flex items-center justify-center mt-[-150px]">
        <form className="flex flex-col gap-3 w-72" onSubmit={handleSubmit}>
          <label className="text-black font-bold">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <label className="text-black font-bold">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@trent.ca"
            value={form.email}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <label className="text-black font-bold">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <label className="text-black font-bold">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="p-3 bg-[#6e805c] text-white rounded-lg hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
          <p className="mt-4 text-sm text-center">
            <a href="/login" className="text-black hover:underline">
              Or Login Here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;