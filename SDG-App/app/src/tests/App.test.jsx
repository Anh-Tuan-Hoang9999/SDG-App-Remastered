import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router";
import { screen } from "@testing-library/react";
import { AuthProvider } from "../authContext";
import App from "../routes/App";

vi.mock("../components/layouts/Layout", () => ({
  default: () => (
    <div data-testid="app-layout-shell">
      <Outlet />
    </div>
  ),
}));

describe("App smoke test", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }))
    );
  });

  test("renders without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(container).toBeTruthy();
  });

  test("redirects protected routes to login when unauthenticated", async () => {
  localStorage.removeItem("token");

  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(await screen.findByText("Welcome back")).toBeInTheDocument();
});
});
