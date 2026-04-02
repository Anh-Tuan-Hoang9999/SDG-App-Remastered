import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router";
import client from "../api/client";

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = React.useState(user?.name || user?.username || "");

  React.useEffect(() => {
    setName(user?.name || user?.username || "");
  }, [user]);

  const handleBack = () => navigate('/profile');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await client.patch("/api/auth/me", { name });
      updateUser(res.data);
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.detail ?? "An error occurred. Please try again.");
    }
  };

  // Avatar initials
  const initial = (user?.username ?? user?.email ?? '?')[0].toUpperCase();

  return (
    <div className="max-w-lg mx-auto px-4 py-10 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: '#EEF2EE', color: '#36656B', border: '1px solid #DDE6DD' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A2E1A' }}>Edit Profile</h1>
          <p className="text-xs" style={{ color: '#637063' }}>Update your account information</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Avatar section */}
        <div
          className="rounded-2xl p-6 mb-5 flex flex-col items-center gap-3"
          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px #DDE6DD' }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
            style={{ background: '#36656B' }}
          >
            {initial}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: '#1A2E1A' }}>
              {user?.username}
            </p>
            <p className="text-xs" style={{ color: '#637063' }}>{user?.email}</p>
          </div>
          <p className="text-xs" style={{ color: '#9BAA9B' }}>
            Avatar is generated from your name initials
          </p>
        </div>

        {/* Fields */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px #DDE6DD' }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
              Display Name
            </label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
              Email Address
            </label>
            <input
              className="auth-input"
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p className="text-xs" style={{ color: '#9BAA9B' }}>Email cannot be changed</p>
          </div>

          <button type="submit" className="btn-primary mt-2">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
