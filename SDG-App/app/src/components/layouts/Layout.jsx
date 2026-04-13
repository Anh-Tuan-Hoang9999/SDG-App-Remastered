import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { useTheme } from "../../themeContext";
import {
  LayoutDashboard, BookOpen, Shuffle, FileText, TrendingUp,
  Library, Users, Globe,
  User, Settings, LogOut, Sun, Moon,
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

const NAV_GREEN = 'var(--app-accent, #4A8A70)';

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
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef(null);

  const normalizedRole = (user?.role || user?.user_type || "").toLowerCase();
  const isCoordinator = normalizedRole === "coordinator" || normalizedRole === "admin";
  const displayName   = user?.name || user?.full_name || user?.username || "Student";
  const initial       = displayName[0].toUpperCase();
  const bgColor       = avatarColor(displayName);

  const isDark = theme === "dark";

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--app-bg)' }}>

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--app-header)',
          borderBottom: '1px solid var(--app-border)',
          boxShadow: 'var(--app-shadow-sm)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${NAV_GREEN} 0%, var(--app-accent-2, #57B4D8) 100%)`,
                boxShadow: '0 10px 18px var(--app-glow, rgba(74,138,112,0.18))',
              }}
            >
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--app-text1)' }}>
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
                      background: active ? 'var(--app-nav-active-bg)' : 'transparent',
                      color:      active ? 'var(--app-nav-active-fg)' : 'var(--app-text2)',
                      boxShadow:  active ? '0 10px 20px var(--app-glow, rgba(74,138,112,0.18))' : 'none',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
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
                    background: location.pathname === '/coordinator' ? 'var(--app-nav-active-bg)' : 'transparent',
                    color:      location.pathname === '/coordinator' ? 'var(--app-nav-active-fg)' : 'var(--app-text2)',
                    boxShadow:  location.pathname === '/coordinator' ? '0 10px 20px var(--app-glow, rgba(74,138,112,0.18))' : 'none',
                  }}
                >
                  <Users className="w-4 h-4" />
                  Coordinator
                  <span
                    className="text-[10px] ml-1 px-1.5 py-0.5 rounded font-bold"
                    style={{
                      background: 'color-mix(in srgb, var(--app-muted) 75%, var(--app-accent-gold, #D4A84B) 25%)',
                      color: 'var(--app-accent-gold, #D4A84B)',
                    }}
                  >
                    ADMIN
                  </span>
                </button>
              </Link>
            )}
          </nav>

          {/* ── Right: user name (desktop) + avatar (all sizes) ── */}
          <div className="flex items-center gap-3">
            {/* User name — desktop only */}
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold" style={{ color: 'var(--app-text1)' }}>
                {displayName}
              </span>
              <span className="text-xs capitalize" style={{ color: 'var(--app-text2)' }}>
                {isCoordinator ? 'Coordinator' : 'Co-op Student'}
              </span>
            </div>

            {/* ── Avatar button ── */}
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
                  className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: 'var(--app-card)',
                    width: 'min(288px, calc(100vw - 24px))',
                    boxShadow: 'var(--app-shadow-dropdown)',
                    transformOrigin: 'top right',
                    animation: 'dropdownIn 0.15s ease',
                    maxHeight: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                  }}
                >
                  {/* ── User info header ── */}
                  <div
                    className="px-4 py-4 flex items-center gap-3"
                    style={{
                      background: isDark
                        ? `linear-gradient(135deg, #102519 0%, #245239 55%, var(--app-accent-2, #57B4D8) 100%)`
                        : `linear-gradient(135deg, #1A3B2E 0%, ${NAV_GREEN} 100%)`,
                    }}
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
                        style={{
                          background: isDark ? 'rgba(212,168,75,0.22)' : 'rgba(200,169,81,0.25)',
                          color: 'var(--app-accent-gold, #C8A951)',
                          boxShadow: isDark ? '0 0 0 1px rgba(212,168,75,0.15)' : 'none',
                        }}
                      >
                        {isCoordinator ? 'Coordinator' : 'Co-op Student'}
                      </span>
                    </div>
                  </div>

                  {/* ── Navigation section (mobile only) ── */}
                  <div className="md:hidden">
                    <div className="px-4 pt-3 pb-1">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--app-text3)' }}
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
                              background: active ? 'var(--app-nav-active-bg)' : 'transparent',
                              color:      active ? 'var(--app-nav-active-fg)' : 'var(--app-text1)',
                            }}
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background: active ? `linear-gradient(135deg, ${NAV_GREEN} 0%, var(--app-accent-2, #57B4D8) 100%)` : 'var(--app-muted)',
                                color:      active ? '#fff'    : 'var(--app-text2)',
                                boxShadow:  active ? '0 10px 18px var(--app-glow, rgba(74,138,112,0.18))' : 'none',
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            {label}
                            {active && (
                              <span
                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: 'var(--app-accent, #4A8A70)',
                                  boxShadow: '0 0 10px var(--app-glow, rgba(74,138,112,0.18))',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                      {isCoordinator && (
                        <button
                          onClick={() => go('/coordinator')}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                          style={{ color: 'var(--app-text1)' }}
                        >
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--app-muted)', color: 'var(--app-text2)' }}>
                            <Users className="w-3.5 h-3.5" />
                          </span>
                          Coordinator
                          <span
                            className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: 'color-mix(in srgb, var(--app-muted) 75%, var(--app-accent-gold, #D4A84B) 25%)',
                              color: 'var(--app-accent-gold, #D4A84B)',
                            }}
                          >
                            ADMIN
                          </span>
                        </button>
                      )}
                    </div>
                    <div style={{ height: '1px', background: 'var(--app-border)', margin: '0 16px' }} />
                  </div>

                  {/* ── Account section ── */}
                  <div className="px-2 py-2">
                    <div className="px-2 pt-1 pb-1">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--app-text3)' }}
                      >
                        Account
                      </p>
                    </div>
                    <button
                      onClick={() => go('/profile')}
                      className="dropdown-item w-full rounded-xl"
                    >
                      <span className="dropdown-item-icon">
                        <User className="w-3.5 h-3.5" style={{ color: NAV_GREEN }} />
                      </span>
                      Profile
                    </button>
                    <button
                      onClick={() => go('/settings')}
                      className="dropdown-item w-full rounded-xl"
                    >
                      <span className="dropdown-item-icon">
                        <Settings className="w-3.5 h-3.5" style={{ color: NAV_GREEN }} />
                      </span>
                      Settings
                    </button>

                    {/* ── Theme toggle ── */}
                    <button
                      onClick={toggleTheme}
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                      className="dropdown-item w-full rounded-xl"
                    >
                      <span className="dropdown-item-icon">
                        {isDark
                          ? <Sun  className="w-3.5 h-3.5" style={{ color: '#C8A951' }} />
                          : <Moon className="w-3.5 h-3.5" style={{ color: NAV_GREEN }} />
                        }
                      </span>
                      <span className="flex-1 text-left">{isDark ? "Light mode" : "Dark mode"}</span>
                      {/* Pill indicator */}
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(212,168,75,0.2) 0%, rgba(87,180,216,0.12) 100%)'
                            : 'var(--app-muted)',
                          color: isDark ? 'var(--app-accent-gold, #C8A951)' : 'var(--app-text2)',
                          boxShadow: isDark ? '0 0 0 1px rgba(212,168,75,0.14)' : 'none',
                        }}
                      >
                        {isDark ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>

                  {/* ── Logout ── */}
                  <div className="px-2 pb-2" style={{ borderTop: '1px solid var(--app-border)' }}>
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
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 text-center text-xs"
        style={{
          borderColor: 'var(--app-border)',
          background: 'var(--app-footer)',
          color: 'var(--app-text2)',
        }}
      >
        SDG Co-op Learning Portal · COIS 4000Y Capstone · Trent University
      </footer>
    </div>
  );
}
