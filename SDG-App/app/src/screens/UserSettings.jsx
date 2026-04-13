import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router";
import client from "../api/client";
import ProfilePicture from "../components/ProfilePicture";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = React.useState(user?.name || user?.username || "");
  const [description, setDescription] = React.useState(user?.description || "");
  const [courseCode, setCourseCode] = React.useState(user?.course_code || "");
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || "");
  const [selectedImageFile, setSelectedImageFile] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const DISPLAY_NAME_MAX_LENGTH = 20;
  const COURSE_CODE_MAX_LENGTH = 10;
  const DESCRIPTION_MAX_LENGTH = 1500;

  React.useEffect(() => {
    setName(user?.name || user?.username || "");
    setDescription(user?.description || "");
    setCourseCode(user?.course_code || "");
    setAvatarUrl(user?.avatar_url || "");
    setSelectedImageFile(null);
  }, [user]);

  const handleBack = () => navigate("/profile");

  const handleImageFileChange = (file) => {
    setSelectedImageFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleResetAvatar = () => {
    setAvatarUrl("");
    setSelectedImageFile(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      let nextAvatarUrl = avatarUrl;

      if (selectedImageFile) {
        nextAvatarUrl = await readFileAsDataUrl(selectedImageFile);
      }

      const res = await client.patch("/api/auth/me", {
        name,
        description,
        course_code: courseCode || null,
        avatar_url: nextAvatarUrl || null,
      });

      updateUser(res.data);
      setAvatarUrl(res.data.avatar_url || "");
      setSelectedImageFile(null);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ?? "An error occurred. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 w-full">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "var(--app-muted)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--app-text1)" }}>
            Edit Profile
          </h1>
          <p className="text-xs" style={{ color: "var(--app-text2)" }}>
            Update your account information
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div
          className="rounded-2xl p-6 mb-5 flex flex-col items-center gap-3"
          style={{ background: "var(--app-card)", boxShadow: "var(--app-shadow-card)", border: "1px solid var(--app-border)" }}
        >
          <ProfilePicture
            src={avatarUrl}
            name={name || user?.email || "User"}
            alt={`${name || "User"} profile`}
            editable
            onFileChange={handleImageFileChange}
          />
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--app-text1)" }}>
              {name || "Student"}
            </p>
            <p className="text-xs" style={{ color: "var(--app-text2)" }}>{user?.email}</p>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--app-text3)" }}>
            Choose a new image here. It will be saved when you click Save Changes.
          </p>
          <button
            type="button"
            onClick={handleResetAvatar}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: "var(--app-muted)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
          >
            Reset to Default Photo
          </button>
          {selectedImageFile && (
            <p className="text-xs font-medium" style={{ color: "#5E9B7B" }}>
              Selected: {selectedImageFile.name}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "var(--app-card)", boxShadow: "var(--app-shadow-card)", border: "1px solid var(--app-border)" }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
              Display Name
            </label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your display name"
              value={name}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              onChange={(e) =>
                setName(e.target.value.slice(0, DISPLAY_NAME_MAX_LENGTH))
              }
              autoComplete="name"
            />
            <p className="text-xs" style={{ color: "var(--app-text3)" }}>
              Max {DISPLAY_NAME_MAX_LENGTH} characters ({name.length}/
              {DISPLAY_NAME_MAX_LENGTH})
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
              Course Code
            </label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. COIS 4000Y"
              value={courseCode}
              maxLength={COURSE_CODE_MAX_LENGTH}
              onChange={(e) =>
                setCourseCode(e.target.value.slice(0, COURSE_CODE_MAX_LENGTH))
              }
            />
            <p className="text-xs" style={{ color: "var(--app-text3)" }}>
              Max {COURSE_CODE_MAX_LENGTH} characters ({courseCode.length}/
              {COURSE_CODE_MAX_LENGTH})
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
              Description
            </label>
            <textarea
              className="auth-input min-h-28 resize-y"
              placeholder="Add a short description about yourself..."
              value={description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
              }
            />
            <p className="text-xs" style={{ color: "var(--app-text3)" }}>
              Max {DESCRIPTION_MAX_LENGTH} characters ({description.length}/
              {DESCRIPTION_MAX_LENGTH})
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
              Email Address
            </label>
            <input
              className="auth-input"
              type="email"
              value={user?.email || ""}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <p className="text-xs" style={{ color: "var(--app-text3)" }}>Email cannot be changed</p>
          </div>

          {successMessage && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "#EEF8F1", color: "#256C3A", border: "1px solid #B7E0C1" }}
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
            >
              {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
