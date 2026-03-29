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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">
              SDG Co-op Portal
            </span>
            <span className="font-display font-bold text-lg text-foreground sm:hidden">
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Coordinator
                  <span className="text-xs ml-1 px-1 py-0.5 rounded bg-secondary text-secondary-foreground">Admin</span>
                </button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground leading-none">
                {user?.full_name || "Student"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {isCoordinator ? "Coordinator" : "Co-op Student"}
              </span>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
              <div>
                <p className="font-medium text-sm">{user?.full_name || "Student"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {isCoordinator ? "Coordinator" : "Co-op Student"}
                </p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)}>
                <button
                  className={`w-full justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    location.pathname === path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                <button className="w-full justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center">
                  <Users className="w-4 h-4" />
                  Coordinator View
                  <span className="ml-auto text-xs px-1 py-0.5 rounded bg-secondary text-secondary-foreground">Admin</span>
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
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        SDG Co-op Learning Portal · COIS 4000Y Capstone Project · Trent University
      </footer>
    </div>
  );
}