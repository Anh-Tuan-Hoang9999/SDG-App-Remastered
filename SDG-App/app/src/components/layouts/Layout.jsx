import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";
import {
  LayoutDashboard, BookOpen, Shuffle, FileText, TrendingUp,
  Library, Users, Menu, X, LogOut, ChevronRight, Leaf
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "SDG Cards", path: "/sdg-cards", icon: BookOpen },
  { label: "Card Sort", path: "/card-sort", icon: Shuffle },
  { label: "Reflection Log", path: "/reflection-log", icon: FileText },
  { label: "Progress", path: "/progress", icon: TrendingUp },
  { label: "Resources", path: "/resources", icon: Library },
];

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isCoordinator = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F7FAFA] flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#D6E3E3] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#36656B] rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[#24484D] hidden sm:block">
              SDG Co-op Portal
            </span>
            <span className="font-display font-bold text-lg text-[#24484D] sm:hidden">
              SDG Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path}>
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? "bg-[#36656B] text-white"
                      : "text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              </Link>
            ))}
            {isCoordinator && (
              <Link to="/coordinator">
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/coordinator"
                      ? "bg-[#36656B] text-white"
                      : "text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Coordinator
                  <span className="text-xs ml-1 px-1 py-0.5 rounded bg-[#E1ECEC] text-[#2E5A60]">Admin</span>
                </button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-[#24484D] leading-none">
                {user?.full_name || "Student"}
              </span>
              <span className="text-xs text-[#6F8589] capitalize">
                {isCoordinator ? "Coordinator" : "Co-op Student"}
              </span>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2]">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#D6E3E3] bg-white px-4 py-3 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D6E3E3]">
              <div>
                <p className="font-medium text-sm">{user?.full_name || "Student"}</p>
                <p className="text-xs text-[#6F8589] capitalize">
                  {isCoordinator ? "Coordinator" : "Co-op Student"}
                </p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#9B2C2C] hover:bg-[#FDECEC]">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)}>
                <button
                  className={`w-full justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    location.pathname === path
                      ? "bg-[#36656B] text-white"
                      : "text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </button>
              </Link>
            ))}
            {isCoordinator && (
              <Link to="/coordinator" onClick={() => setMenuOpen(false)}>
                <button className="w-full justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#4F666A] hover:text-[#24484D] hover:bg-[#EAF2F2] flex items-center">
                  <Users className="w-4 h-4" />
                  Coordinator View
                  <span className="ml-auto text-xs px-1 py-0.5 rounded bg-[#E1ECEC] text-[#2E5A60]">Admin</span>
                </button>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D6E3E3] bg-white py-4 text-center text-xs text-[#6F8589]">
        SDG Co-op Learning Portal · COIS 4000Y Capstone Project · Trent University
      </footer>
    </div>
  );
}