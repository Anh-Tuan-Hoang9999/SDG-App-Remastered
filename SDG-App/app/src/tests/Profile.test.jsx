import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Profile from "../screens/Profile";

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

const authState = {
  user: null,
  logout: mockLogout,
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../authContext", () => ({
  useAuth: () => authState,
}));

vi.mock("../components/ProfilePicture", () => ({
  default: () => <div>Profile Picture</div>,
}));

describe("Profile role rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
  });

  test("shows loading when user is missing", () => {
    render(<Profile />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders student profile view", () => {
    authState.user = {
      username: "student_user",
      email: "student@trentu.ca",
      user_type: "student",
      course_code: "COIS-4000Y",
    };
    render(<Profile />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Progress tracking placeholder")).toBeInTheDocument();
  });

  // coordinators should see their supervised students section
  test("renders coordinator profile view", () => {
    authState.user = {
      username: "coord_user",
      email: "coord@trentu.ca",
      user_type: "coordinator",
    };
    render(<Profile />);
    expect(screen.getByText("Supervised Students")).toBeInTheDocument();
    expect(screen.getByText("Student list and progress coming soon...")).toBeInTheDocument();
  });

  // developers should see their tools section
  test("renders developer profile view", () => {
    authState.user = {
      username: "dev_user",
      email: "dev@trentu.ca",
      user_type: "developer",
    };
    render(<Profile />);
    expect(screen.getByText("Developer Tools")).toBeInTheDocument();
    expect(screen.getByText("Developer/admin tools coming soon...")).toBeInTheDocument();
  });

  // unknown roles should fall back to the student view instead of breaking
  test("falls back to student profile for unknown role", () => {
    authState.user = {
      username: "unknown_user",
      email: "unknown@trentu.ca",
      user_type: "guest",
      course_code: "COIS-4000Y",
    };
    render(<Profile />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.queryByText("Developer Tools")).not.toBeInTheDocument();
    expect(screen.queryByText("Supervised Students")).not.toBeInTheDocument();
  });

  test("logs out and navigates to login when Logout is clicked", () => {
  authState.user = {
    username: "student_user",
    email: "student@trentu.ca",
    user_type: "student",
    course_code: "COIS-4000Y",
  };

  render(<Profile />);

  fireEvent.click(screen.getByRole("button", { name: "Logout" }));

  expect(mockLogout).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/login");
});

test("navigates to settings when Settings is clicked", () => {
  authState.user = {
    username: "student_user",
    email: "student@trentu.ca",
    user_type: "student",
    course_code: "COIS-4000Y",
  };

  render(<Profile />);

  fireEvent.click(screen.getByRole("button", { name: "Settings" }));

  expect(mockNavigate).toHaveBeenCalledWith("/settings");
});
});