import React, { useId, useState } from "react";

// Placeholder profile image
const DEFAULT_PROFILE_IMG =
  "https://ui-avatars.com/api/?name=User&background=6e805c&color=fff&size=128";

export default function ProfilePicture({ src, alt, onChange }) {
  const [preview, setPreview] = useState(src || DEFAULT_PROFILE_IMG);
  const inputId = useId();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);

      // Optional: send file to parent (for API upload later)
      // We need to save the file to backend later
      if (onChange) {
        onChange(file);
      }
    }
  };

  return (
    <div className="relative w-24 h-24">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id={inputId}
      />

      {/* Clickable image */}
      <label htmlFor={inputId} className="cursor-pointer">
        <img
          src={preview}
          alt={alt || "Profile"}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#a2bf87] shadow-md hover:opacity-80 transition"
          style={{ background: "#e0e0e0" }}
        />
      </label>
    </div>
  );
}