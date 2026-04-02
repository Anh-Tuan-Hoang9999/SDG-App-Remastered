import React, { useId, useState } from "react";

const DEFAULT_PROFILE_IMG =
  "https://ui-avatars.com/api/?name=User&background=36656B&color=fff&size=128";

export default function ProfilePicture({ src, alt, onChange }) {
  const [preview, setPreview] = useState(src || DEFAULT_PROFILE_IMG);
  const inputId = useId();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      if (onChange) onChange(file);
    }
  };

  return (
    <div className="relative w-20 h-20">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id={inputId}
      />
      <label htmlFor={inputId} className="cursor-pointer block">
        <img
          src={preview}
          alt={alt || "Profile"}
          className="w-20 h-20 rounded-2xl object-cover hover:opacity-85 transition-opacity"
          style={{
            border: '3px solid #36656B',
            boxShadow: '0 2px 8px rgba(54,101,107,0.2)',
          }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: '#36656B', border: '2px solid #fff' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </label>
    </div>
  );
}
