import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router";
import client from "../api/client";

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = React.useState(user?.name || "");

  React.useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const handleBack = () => navigate('/profile');
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await client.patch("/api/auth/me", { name });
      updateUser(res.data);
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      const message = err.response?.data?.detail ?? "An error occurred. Please try again.";
      alert(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#a2bf87]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px] flex flex-col">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">User Settings</h2>
          <button
            onClick={handleBack}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 shadow ml-4"
          >
            &larr; Back
          </button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col flex-1">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Profile Picture</label>
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              {/* Placeholder for profile image preview */}
              <span className="text-gray-400">Image</span>
            </div>
            <input type="file" className="block w-full" disabled />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="mt-4 p-2 w-full bg-[#6e805c] text-white rounded-lg hover:bg-green-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
