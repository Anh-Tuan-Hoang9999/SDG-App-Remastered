import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import * as authContext from "../authContext";

vi.mock("../authContext", async () => {
  const actual = await vi.importActual("../authContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockUseAuth = authContext.useAuth;

function renderProtectedRoute(element, path = "/profile") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/protected" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  // someone who isn't logged in shouldn't be able to access protected pages
  test("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderProtectedRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      "/protected"
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  // while we're still checking if the user is logged in, show a loading screen
  test("shows a loading screen while auth is being checked", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    renderProtectedRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      "/protected"
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // a logged in user with no role restriction should just see the page normally
  test("allows authenticated users when allowedRoles is not provided", () => {
    mockUseAuth.mockReturnValue({ user: { user_type: "STUDENT" }, loading: false });
    renderProtectedRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      "/protected"
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  // a developer trying to access a developer-only page should get in
  test("allows users with a matching role", () => {
    mockUseAuth.mockReturnValue({ user: { user_type: "developer" }, loading: false });
    renderProtectedRoute(
      <ProtectedRoute allowedRoles={["DEVELOPER"]}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      "/protected"
    );
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  // a student trying to access a developer-only page should get sent back to their profile
  test("blocks users with non-matching roles and redirects to profile", () => {
    mockUseAuth.mockReturnValue({ user: { user_type: "STUDENT" }, loading: false });
    renderProtectedRoute(
      <ProtectedRoute allowedRoles={["DEVELOPER"]}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      "/protected"
    );
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  test("treats mixed-case role values as matching", () => {
  mockUseAuth.mockReturnValue({
    user: { user_type: "dEvElOpEr" },
    loading: false,
  });

  renderProtectedRoute(
    <ProtectedRoute allowedRoles={["developer"]}>
      <div>Admin Content</div>
    </ProtectedRoute>,
    "/protected"
  );

  expect(screen.getByText("Admin Content")).toBeInTheDocument();
});
});