import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router";
import { useAuth } from '../authContext';
import gsap from 'gsap';

const AVATAR_COLORS = [
  '#36656B', '#2a5458', '#1A3B2E',
  '#3F7E44', '#0A97D9', '#C8A951',
  '#E5243B', '#FD6925', '#A21942',
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
  const hasOpenedRef = useRef(false);

  const initial = (user?.username ?? user?.email ?? '?')[0].toUpperCase();
  const bgColor = avatarColor(user?.username ?? user?.email ?? '');

  useEffect(() => {
    if (!dropdownRef.current) return;
    if (open) {
      hasOpenedRef.current = true;
      gsap.set(dropdownRef.current, { pointerEvents: 'auto' });
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.94, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo(
        dropdownRef.current.querySelectorAll('.menu-item'),
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.16, stagger: 0.04, ease: 'power2.out', delay: 0.07 }
      );
    } else if (hasOpenedRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0, scale: 0.94, y: -6,
        duration: 0.14, ease: 'power2.in',
        onComplete: () => gsap.set(dropdownRef.current, { pointerEvents: 'none' }),
      });
    }
  }, [open]);

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
    <header className='flex items-center justify-between px-5 pt-4 pb-2'>
      {/* ── Brand wordmark ── */}
      <button
        onClick={() => navigate('/learning')}
        className='flex items-center gap-2.5 group active:scale-95 transition-transform'
      >
        <img
          src="/LOGO_TRENT.png"
          alt="SDG-Remastered Logo"
          className='w-8 h-8 rounded-xl flex-shrink-0 object-cover'
        />
        <span className='text-sm font-bold leading-tight' style={{ color: '#1A2E1A' }}>
          SDG-Remastered
        </span>
      </button>

      {/* ── Avatar + dropdown ── */}
      <div ref={menuRef} className='relative'>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Account menu"
          className='w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm active:scale-90 transition-transform select-none'
          style={{ backgroundColor: bgColor }}
        >
          {initial}
        </button>

        {/* Dropdown — always in DOM so exit animation works */}
        <div
          ref={dropdownRef}
          className='absolute right-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-50'
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px #DDE6DD',
            opacity: 0,
            pointerEvents: 'none',
            transformOrigin: 'top right',
          }}
        >
          {/* User info header */}
          <div
            className='menu-item px-4 py-3.5'
            style={{ borderBottom: '1px solid #EEF2EE', background: '#F4F7F5' }}
          >
            <div className='flex items-center gap-3'>
              <div
                className='w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0'
                style={{ backgroundColor: bgColor }}
              >
                {initial}
              </div>
              <div className='min-w-0'>
                <p className='text-xs font-semibold truncate' style={{ color: '#1A2E1A' }}>
                  {user?.username}
                </p>
                <p className='text-[11px] truncate' style={{ color: '#637063' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div className='py-1'>
            <button
              onClick={() => handleNav('/profile')}
              className='menu-item dropdown-item'
            >
              <span className='dropdown-item-icon'>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#36656B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              Profile
            </button>
            {user?.role === 'coordinator' && (
              <button
                onClick={() => handleNav('/coordinator')}
                className='menu-item dropdown-item'
              >
                <span className='dropdown-item-icon'>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#36656B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6" />
                    <path d="M17 11h6" />
                  </svg>
                </span>
                Coordinator
              </button>
            )}
            <button
              onClick={() => handleNav('/settings')}
              className='menu-item dropdown-item'
            >
              <span className='dropdown-item-icon'>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#36656B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              </span>
              Settings
            </button>
          </div>

          {/* Logout */}
          <div style={{ borderTop: '1px solid #EEF2EE' }} className='py-1'>
            <button
              onClick={handleLogout}
              className='menu-item dropdown-item danger'
            >
              <span className='dropdown-item-icon danger'>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DefaultTopNav;
