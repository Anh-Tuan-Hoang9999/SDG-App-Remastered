
import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router";
import ProfilePicture from "../components/ProfilePicture";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div className="flex flex-col items-center justify-center h-screen">Loading...</div>;
  }

  // Render different layouts based on user type
  const userType = (user.user_type || '').toLowerCase();

  // Student profile layout
  const StudentProfile = () => (
    <div className="bg-white p-12 rounded-3xl shadow-lg w-[600px] min-h-[420px] flex flex-col relative">
      <div className="absolute top-10 right-6 flex flex-col gap-2 items-end">
        <button
          onClick={handleLogout}
          className="px-4 py-1 text-sm bg-[#6e805c] text-white rounded hover:bg-green-700 shadow"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 shadow"
        >
          Settings
        </button>
      </div>
      <div className="flex flex-row items-start mb-8">
        <ProfilePicture />
        <div className="ml-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
          <div className="mb-1"><span className="font-semibold">Email:</span> {user.email}</div>
          <div className="mb-1"><span className="font-semibold">User Type:</span> {user.user_type}</div>
          <div className="mb-1"><span className="font-semibold">Course Code:</span> {user.course_code || <span className="italic text-gray-400">N/A</span>}</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <div className="w-full min-h-[48px] bg-[#f5f5f5] rounded-lg flex items-center px-4 py-2 text-gray-700">
          {/* Placeholder for user description */}
          {user.description || <span className="italic text-gray-400">No description set. Edit your profile to add one.</span>}
        </div>
      </div>
      <div className="mt-2 mb-8">
        <h3 className="text-lg font-semibold mb-2">Progress</h3>
        <div className="w-full h-20 bg-[#e0e0e0] rounded-lg flex items-center justify-center text-gray-500">
          {/* Placeholder for progress tracking */}
          Progress tracking placeholder
        </div>
      </div>
    </div>
  );

  // Supervisor profile layout (future: add student list, progress viewing, etc.)
  const SupervisorProfile = () => (
    <div className="bg-white p-12 rounded-2xl shadow-lg w-[600px] min-h-[420px] flex flex-col relative">
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-[#6e805c] text-white rounded hover:bg-green-700 shadow"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 shadow"
        >
          Settings
        </button>
      </div>
      <div className="flex flex-row items-start mb-8">
        <ProfilePicture />
        <div className="ml-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2">{user.username} <span className="text-base font-normal text-gray-500">(Supervisor)</span></h2>
          <div className="mb-1"><span className="font-semibold">Email:</span> {user.email}</div>
          <div className="mb-1"><span className="font-semibold">User Type:</span> {user.user_type}</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <div className="w-full min-h-[48px] bg-[#f5f5f5] rounded-lg flex items-center px-4 py-2 text-gray-700">
          {/* Placeholder for user description */}
          {user.description || <span className="italic text-gray-400">No description set. Edit your profile to add one.</span>}
        </div>
      </div>
      <div className="mt-2 mb-8">
        <h3 className="text-lg font-semibold mb-2">Supervised Students</h3>
        <div className="w-full h-20 bg-[#e0e0e0] rounded-lg flex items-center justify-center text-gray-500">
          {/* Placeholder for supervised students list */}
          Student list and progress coming soon...
        </div>
      </div>
    </div>
  );

  // Developer profile layout (future: add admin/dev tools, etc.)
  const DeveloperProfile = () => (
    <div className="bg-white p-12 rounded-2xl shadow-lg w-[600px] min-h-[420px] flex flex-col relative">
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-[#6e805c] text-white rounded hover:bg-green-700 shadow"
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 shadow"
        >
          Settings
        </button>
      </div>
      <div className="flex flex-row items-start mb-8">
        <ProfilePicture />
        <div className="ml-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2">{user.username} <span className="text-base font-normal text-gray-500">(Developer)</span></h2>
          <div className="mb-1"><span className="font-semibold">Email:</span> {user.email}</div>
          <div className="mb-1"><span className="font-semibold">User Type:</span> {user.user_type}</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <div className="w-full min-h-[48px] bg-[#f5f5f5] rounded-lg flex items-center px-4 py-2 text-gray-700">
          {/* Placeholder for user description */}
          {user.description || <span className="italic text-gray-400">No description set. Edit your profile to add one.</span>}
        </div>
      </div>
      <div className="mt-2 mb-8">
        <h3 className="text-lg font-semibold mb-2">Developer Tools</h3>
        <div className="w-full h-20 bg-[#e0e0e0] rounded-lg flex items-center justify-center text-gray-500">
          {/* Placeholder for developer/admin tools */}
          Developer/admin tools coming soon...
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#a2bf87]">
      {userType === "student" && <StudentProfile />}
      {userType === "coordinator" && <SupervisorProfile />}
      {userType === "developer" && <DeveloperProfile />}
      {/* fallback: show student profile if unknown type */}
      {!["student", "coordinator", "developer"].includes(userType) && <StudentProfile />}
    </div>
  );
};

export default Profile;
