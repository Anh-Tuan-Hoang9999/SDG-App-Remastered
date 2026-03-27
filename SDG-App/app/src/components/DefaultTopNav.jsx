import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router";
import { useAuth } from '../authContext';
import gsap from 'gsap';

const AVATAR_COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#7986CB',
  '#4FC3F7', '#4DB6AC', '#81C784', '#FFD54F',
  '#FF8A65', '#A1887F',
];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const DefaultTopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  // Track whether we've ever opened so we don't animate on mount
  const hasOpenedRef = useRef(false);

  const initial = (user?.username ?? user?.email ?? '?')[0].toUpperCase();
  const bgColor = avatarColor(user?.username ?? user?.email ?? '');

  // Animate dropdown in/out with GSAP
  useEffect(() => {
    if (!dropdownRef.current) return;

    if (open) {
      hasOpenedRef.current = true;
      // Make interactive immediately
      gsap.set(dropdownRef.current, { pointerEvents: 'auto' });
      // Panel slides + fades in
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.94, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
      // Menu items stagger in from slight left offset
      gsap.fromTo(
        dropdownRef.current.querySelectorAll('.menu-item'),
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.16, stagger: 0.04, ease: 'power2.out', delay: 0.07 }
      );
    } else if (hasOpenedRef.current) {
      // Slide + fade out, then lock interaction
      gsap.to(dropdownRef.current, {
        opacity: 0, scale: 0.94, y: -6,
        duration: 0.14, ease: 'power2.in',
        onComplete: () => gsap.set(dropdownRef.current, { pointerEvents: 'none' }),
      });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className='flex justify-end px-4 pt-4 pb-1'>
      <div ref={menuRef} className='relative'>
        {/* Avatar button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className='w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-sm active:scale-90 transition-transform select-none'
          style={{ backgroundColor: bgColor }}
        >
          {initial}
        </button>

        {/* Dropdown — always in DOM so exit animation works */}
        <div
          ref={dropdownRef}
          className='absolute right-0 mt-1.5 w-40 bg-white rounded-xl overflow-hidden z-50'
          style={{
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            opacity: 0,
            pointerEvents: 'none',
            transformOrigin: 'top right',
          }}
        >
          {/* User info */}
          <div className='menu-item px-3 py-2.5 border-b border-gray-100'>
            <p className='text-[11px] text-gray-400 truncate'>{user?.email}</p>
            <p className='text-xs font-semibold text-gray-800 truncate'>{user?.username}</p>
          </div>
          <button
            // onClick={() => handleNav('/profile')}
            className='menu-item w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Profile
          </button>
          <button
            // onClick={() => handleNav('/settings')}
            className='menu-item w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Settings
          </button>
          <div className='border-t border-gray-100'>
            <button
              onClick={handleLogout}
              className='menu-item w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors'
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DefaultTopNav