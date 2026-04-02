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
    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#637063' }}>
      {label}
    </span>
    <span className="text-sm font-medium" style={{ color: '#1A2E1A' }}>
      {value || <span className="italic" style={{ color: '#9BAA9B' }}>Not set</span>}
    </span>
  </div>
);

const ProfileCard = ({ user, navigate, roleLabel, extraSection }) => (
  <div className="max-w-2xl mx-auto w-full px-4 py-8">
    {/* Header card */}
    <div
      className="rounded-3xl overflow-hidden mb-5"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px #DDE6DD', background: '#fff' }}
    >
      {/* Gradient banner */}
      <div
        className="h-24 relative"
        style={{ background: 'linear-gradient(135deg, #1A3B2E 0%, #36656B 100%)' }}
      >
        {/* SDG mini-strip */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1">
          {SDG_COLOURS.map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Avatar row */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-10 mb-5">
          <div className="ring-4 ring-white rounded-full">
            <ProfilePicture />
          </div>
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#EEF2EE', color: '#36656B', border: '1px solid #DDE6DD' }}
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#1A2E1A' }}>
            {user.username || user.full_name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#637063' }}>
            {roleLabel} · {user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="User Type" value={user.user_type} />
          <InfoRow label="Course Code" value={user.course_code} />
          <InfoRow label="Email" value={user.email} />
        </div>
      </div>
    </div>

    {/* Description card */}
    <div
      className="rounded-2xl p-5 mb-5"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px #DDE6DD', background: '#fff' }}
    >
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#637063' }}>About</h3>
      <p className="text-sm leading-relaxed" style={{ color: user.description ? '#1A2E1A' : '#9BAA9B' }}>
        {user.description || 'No description added yet. Click "Edit Profile" to add one.'}
      </p>
    </div>

    {/* Extra section (progress / students / tools) */}
    {extraSection && (
      <div
        className="rounded-2xl p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px #DDE6DD', background: '#fff' }}
      >
        {extraSection}
      </div>
    )}
  </div>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#36656B' }} />
      </div>
    );
  }

  const userType = (user.user_type || '').toLowerCase();

  const progressSection = (
    <>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#637063' }}>
        Activity Progress
      </h3>
      <div
        className="rounded-xl flex items-center justify-center py-8 text-sm"
        style={{ background: '#F4F7F5', color: '#9BAA9B', border: '1px dashed #DDE6DD' }}
      >
        Progress tracking coming soon
      </div>
    </>
  );

  const studentsSection = (
    <>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#637063' }}>
        Supervised Students
      </h3>
      <div
        className="rounded-xl flex items-center justify-center py-8 text-sm"
        style={{ background: '#F4F7F5', color: '#9BAA9B', border: '1px dashed #DDE6DD' }}
      >
        Student list coming soon
      </div>
    </>
  );

  const devSection = (
    <>
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#637063' }}>
        Developer Tools
      </h3>
      <div
        className="rounded-xl flex items-center justify-center py-8 text-sm"
        style={{ background: '#F4F7F5', color: '#9BAA9B', border: '1px dashed #DDE6DD' }}
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
    student: progressSection,
    coordinator: studentsSection,
    developer: devSection,
  };
  const extraSection = sectionMap[userType] ?? progressSection;

  return (
    <div style={{ background: '#F4F7F5', minHeight: '100%' }}>
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
