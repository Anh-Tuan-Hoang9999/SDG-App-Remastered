import React, { useEffect, useId, useState } from "react";

const DEFAULT_BACKGROUND = "#36656B";

export default function ProfilePicture({
  src,
  alt,
  name = "User",
  size = 80,
  editable = false,
  onFileChange,
}) {
  const inputId = useId();
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=36656B&color=fff&size=128`;
  const [preview, setPreview] = useState(src || fallback);

  useEffect(() => {
    setPreview(src || fallback);
  }, [src, fallback]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileChange?.(file);
  };

  const image = (
    <img
      src={preview}
      alt={alt || "Profile"}
      width={size}
      height={size}
      className="block object-cover"
      style={{
        width: size,
        height: size,
        borderRadius: 18,
        border: "3px solid #36656B",
        boxShadow: "0 2px 8px rgba(54,101,107,0.2)",
        background: "#EEF2EE",
      }}
    />
  );

  if (!editable) {
    return image;
  }

  return (
    <div className="relative inline-block">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <label htmlFor={inputId} className="cursor-pointer block">
        {image}
        <div
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: DEFAULT_BACKGROUND, border: "2px solid #fff" }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </label>
    </div>
  );
}
