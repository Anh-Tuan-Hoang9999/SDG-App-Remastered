import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router";
import ProfilePicture from "../components/ProfilePicture";

const SDG_COLOURS = [
  "#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2",
  "#FCC30B","#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E",
  "#3F7E44","#0A97D9","#56C02B","#00689D","#19486A",
];

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--app-text2)' }}>
      {label}
    </span>
    <span className="text-sm font-medium" style={{ color: 'var(--app-text1)' }}>
      {value || <span className="italic" style={{ color: 'var(--app-text3)' }}>Not set</span>}
    </span>
  </div>
);

const ProfileCard = ({ user, navigate, roleLabel, extraSection }) => (
  <div className="max-w-2xl mx-auto w-full px-4 py-8">
    {/* Header card */}
    <div
      className="rounded-3xl mb-5"
      style={{ boxShadow: 'var(--app-shadow-dropdown)', background: 'var(--app-card)' }}
    >
      {/* Gradient banner */}
      <div
        className="h-28 relative overflow-hidden rounded-t-3xl z-0"
        style={{ background: 'linear-gradient(135deg, #1A3B2E 0%, #36656B 100%)' }}
      >

      </div>

      {/* Avatar row */}
      <div className="px-6 pb-6">
        <div className="relative z-10 flex items-start justify-between -mt-6 mb-5">
          <div className="relative z-20 ring-4 ring-white rounded-2xl">
            <ProfilePicture
              src={user.avatar_url}
              name={user.name || user.username || 'User'}
              alt={`${user.name || user.username || 'User'} profile`}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'var(--app-muted)', color: '#5E9B7B', border: '1px solid var(--app-border)' }}
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-bold" style={{ color: 'var(--app-text1)' }}>
            {user.name || user.username || user.full_name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--app-text2)' }}>
            {roleLabel} · {user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="User Type" value={roleLabel} />
          <InfoRow label="Course Code" value={user.course_code} />
          <InfoRow label="Email" value={user.email} />
        </div>
      </div>
    </div>

    {/* Description card */}
    <div
      className="rounded-2xl p-5 mb-5"
      style={{ boxShadow: 'var(--app-shadow-card)', border: '1px solid var(--app-border)', background: 'var(--app-card)' }}
    >
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--app-text2)' }}>About</h3>
      <p className="text-sm leading-relaxed" style={{ color: user.description ? 'var(--app-text1)' : 'var(--app-text3)' }}>
        {user.description || 'No description added yet. Click "Edit Profile" to add one.'}
      </p>
    </div>

    {/* Extra section (progress / students / tools) */}
    {extraSection && (
      <div
        className="rounded-2xl p-5"
        style={{ boxShadow: 'var(--app-shadow-card)', border: '1px solid var(--app-border)', background: 'var(--app-card)' }}
      >
        {extraSection}
      </div>
    )}
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#36656B' }} />
      </div>
    );
  }

  const userType = (user.role || user.user_type || '').toLowerCase();

  const studentsSection = (
    <>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#637063' }}>
        Supervised Students
      </h3>
      <div
        className="rounded-xl flex items-center justify-center py-8 text-sm"
        style={{ background: 'var(--app-muted)', color: 'var(--app-text3)', border: '1px dashed var(--app-border)' }}
      >
        Student list coming soon
      </div>
    </>
  );

  const devSection = (
    <>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--app-text2)' }}>
        Developer Tools
      </h3>
      <div
        className="rounded-xl flex items-center justify-center py-8 text-sm"
        style={{ background: 'var(--app-muted)', color: 'var(--app-text3)', border: '1px dashed var(--app-border)' }}
      >
        Admin tools coming soon
      </div>
    </>
  );

  const roleMap = {
    student: 'Co-op Student',
    coordinator: 'Coordinator',
    developer: 'Developer',
  };
  const roleLabel = roleMap[userType] ?? 'Co-op Student';
  const sectionMap = {
    student: null,
    coordinator: studentsSection,
    developer: devSection,
  };
  const extraSection = sectionMap[userType] ?? null;

  return (
    <div style={{ background: 'var(--app-bg)', minHeight: '100%' }}>
      <ProfileCard
        user={user}
        navigate={navigate}
        roleLabel={roleLabel}
        extraSection={extraSection}
      />
    </div>
  );
};

export default Profile;
