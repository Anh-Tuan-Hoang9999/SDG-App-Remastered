import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import {
  LayoutDashboard, BookOpen, Shuffle, FileText, TrendingUp,
  Library, Users, Leaf,
  User, Settings, LogOut
} from "lucide-react";

const navItems = [
  { label: "Dashboard",    path: "/dashboard",      icon: LayoutDashboard },
  { label: "SDG Cards",    path: "/sdg-cards",      icon: BookOpen        },
  { label: "Card Sort",    path: "/card-sort",      icon: Shuffle         },
  { label: "Reflection Log", path: "/reflection-log", icon: FileText      },
  { label: "Progress",     path: "/progress",       icon: TrendingUp      },
  { label: "Resources",    path: "/resources",      icon: Library         },
];

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

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = useRef(null);

  const isCoordinator = user?.role === "admin";
  const displayName   = user?.full_name || user?.username || "Student";
  const initial       = displayName[0].toUpperCase();
  const bgColor       = avatarColor(displayName);

  // Close on outside click or route change
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F7F5' }}>

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: '1px solid #DDE6DD', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#36656B' }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: '#1A2E1A' }}>
              <span className="hidden sm:inline">SDG Co-op Portal</span>
              <span className="sm:hidden">SDG Portal</span>
            </span>
          </Link>

          {/* ── Desktop inline nav (md+) ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path}>
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: active ? '#36656B' : 'transparent',
                      color:      active ? '#fff'     : '#4F666A',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#EEF2EE'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </Link>
              );
            })}
            {isCoordinator && (
              <Link to="/coordinator">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: location.pathname === '/coordinator' ? '#36656B' : 'transparent',
                    color:      location.pathname === '/coordinator' ? '#fff'     : '#4F666A',
                  }}
                >
                  <Users className="w-4 h-4" />
                  Coordinator
                  <span
                    className="text-[10px] ml-1 px-1.5 py-0.5 rounded font-bold"
                    style={{ background: '#EEF2EE', color: '#36656B' }}
                  >
                    ADMIN
                  </span>
                </button>
              </Link>
            )}
          </nav>

          {/* ── Right: user name (desktop) + avatar (all sizes) ── */}
          <div className="flex items-center gap-3">
            {/* User name — desktop only (nav is visible, so context is clear) */}
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold" style={{ color: '#1A2E1A' }}>
                {displayName}
              </span>
              <span className="text-xs capitalize" style={{ color: '#637063' }}>
                {isCoordinator ? 'Coordinator' : 'Co-op Student'}
              </span>
            </div>

            {/* ── Avatar button — SINGLE nav trigger on mobile ── */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpen(v => !v)}
                aria-label="Open navigation menu"
                aria-expanded={open}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform active:scale-90 select-none"
                style={{ backgroundColor: bgColor }}
              >
                {initial}
              </button>

              {/* ── Unified dropdown ── */}
              {open && (
                <div
                  className="absolute right-0 mt-2 bg-white rounded-2xl overflow-hidden z-50"
                  style={{
                    width: 'min(288px, calc(100vw - 24px))',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 0 0 1px #DDE6DD',
                    transformOrigin: 'top right',
                    animation: 'dropdownIn 0.15s ease',
                    maxHeight: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                  }}
                >
                  {/* ── User info header ── */}
                  <div
                    className="px-4 py-4 flex items-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #1A3B2E 0%, #36656B 100%)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 ring-2"
                      style={{ backgroundColor: bgColor, ringColor: 'rgba(255,255,255,0.3)' }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-tight">
                        {displayName}
                      </p>
                      <p className="text-xs truncate leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {user?.email}
                      </p>
                      <span
                        className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 capitalize"
                        style={{ background: 'rgba(200,169,81,0.25)', color: '#C8A951' }}
                      >
                        {isCoordinator ? 'Coordinator' : 'Co-op Student'}
                      </span>
                    </div>
                  </div>

                  {/* ── Navigation section (mobile only — hidden on desktop where nav bar exists) ── */}
                  <div className="md:hidden">
                    <div className="px-4 pt-3 pb-1">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: '#9BAA9B' }}
                      >
                        Navigate
                      </p>
                    </div>
                    <div className="px-2 pb-2">
                      {navItems.map(({ label, path, icon: Icon }) => {
                        const active = location.pathname === path;
                        return (
                          <button
                            key={path}
                            onClick={() => go(path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                            style={{
                              background: active ? 'rgba(54,101,107,0.1)' : 'transparent',
                              color:      active ? '#36656B' : '#1A2E1A',
                            }}
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background: active ? '#36656B' : '#EEF2EE',
                                color:      active ? '#fff'     : '#637063',
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            {label}
                            {active && (
                              <span
                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                style={{ background: '#36656B' }}
                              />
                            )}
                          </button>
                        );
                      })}
                      {isCoordinator && (
                        <button
                          onClick={() => go('/coordinator')}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                          style={{ color: '#1A2E1A' }}
                        >
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EEF2EE', color: '#637063' }}>
                            <Users className="w-3.5 h-3.5" />
                          </span>
                          Coordinator
                          <span
                            className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: '#EEF2EE', color: '#36656B' }}
                          >
                            ADMIN
                          </span>
                        </button>
                      )}
                    </div>
                    <div style={{ height: '1px', background: '#EEF2EE', margin: '0 16px' }} />
                  </div>

                  {/* ── Account section (always visible) ── */}
                  <div className="px-2 py-2">
                    <div className="px-2 pt-1 pb-1">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: '#9BAA9B' }}
                      >
                        Account
                      </p>
                    </div>
                    <button
                      onClick={() => go('/profile')}
                      className="dropdown-item w-full rounded-xl"
                    >
                      <span className="dropdown-item-icon">
                        <User className="w-3.5 h-3.5" style={{ color: '#36656B' }} />
                      </span>
                      Profile
                    </button>
                    <button
                      onClick={() => go('/settings')}
                      className="dropdown-item w-full rounded-xl"
                    >
                      <span className="dropdown-item-icon">
                        <Settings className="w-3.5 h-3.5" style={{ color: '#36656B' }} />
                      </span>
                      Settings
                    </button>
                  </div>

                  {/* ── Logout ── */}
                  <div className="px-2 pb-2" style={{ borderTop: '1px solid #EEF2EE' }}>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item danger w-full rounded-xl mt-1"
                    >
                      <span className="dropdown-item-icon danger">
                        <LogOut className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />
                      </span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* ── NO hamburger button — avatar is the only mobile trigger ── */}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 text-center text-xs"
        style={{ borderColor: '#DDE6DD', background: '#fff', color: '#637063' }}
      >
        SDG Co-op Learning Portal · COIS 4000Y Capstone · Trent University
      </footer>
    </div>
  );
}
