import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../themeContext";

// Small component that exposes theme state via the DOM
function ThemeDisplay() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeDisplay />
    </ThemeProvider>
  );
}

// jsdom does not implement window.matchMedia; stub it for tests that need it
function stubMatchMedia(prefersDark) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: prefersDark && query.includes("dark"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.unstubAllGlobals();
  });

  test("defaults to light when no localStorage entry and OS prefers light", () => {
    stubMatchMedia(false);
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("defaults to dark when OS prefers dark and no localStorage entry", () => {
    stubMatchMedia(true);
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("saved light theme overrides OS dark preference", () => {
    localStorage.setItem("sdg-theme", "light");
    stubMatchMedia(true); // OS says dark — saved preference wins
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("saved dark theme overrides OS light preference", () => {
    localStorage.setItem("sdg-theme", "dark");
    stubMatchMedia(false); // OS says light — saved preference wins
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("toggleTheme switches light → dark and adds .dark to <html>", () => {
    localStorage.setItem("sdg-theme", "light");
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("toggleTheme switches dark → light and removes .dark from <html>", () => {
    localStorage.setItem("sdg-theme", "dark");
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("persists chosen theme to localStorage after each toggle", () => {
    localStorage.setItem("sdg-theme", "light");
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(localStorage.getItem("sdg-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(localStorage.getItem("sdg-theme")).toBe("light");
  });

  test("double-toggle returns to original theme", () => {
    localStorage.setItem("sdg-theme", "light");
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
