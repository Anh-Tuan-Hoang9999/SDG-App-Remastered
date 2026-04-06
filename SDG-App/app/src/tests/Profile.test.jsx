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
    const { container } = render(<Profile />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("renders student profile view", () => {
    authState.user = {
      username: "student_user",
      email: "student@trentu.ca",
      user_type: "student",
      course_code: "COIS-4000Y",
    };
    render(<Profile />);
    expect(screen.getByText("student_user")).toBeInTheDocument();
    expect(screen.getAllByText(/Co-op Student/)).toHaveLength(2);
    expect(screen.getByText("COIS-4000Y")).toBeInTheDocument();
    expect(screen.queryByText("Supervised Students")).not.toBeInTheDocument();
  });

  test("renders coordinator profile view", () => {
    authState.user = {
      username: "coord_user",
      email: "coord@trentu.ca",
      user_type: "coordinator",
    };
    render(<Profile />);
    expect(screen.getByText("Supervised Students")).toBeInTheDocument();
    expect(screen.getByText("Student list coming soon")).toBeInTheDocument();
  });

  test("renders developer profile view", () => {
    authState.user = {
      username: "dev_user",
      email: "dev@trentu.ca",
      user_type: "developer",
    };
    render(<Profile />);
    expect(screen.getByText("Developer Tools")).toBeInTheDocument();
    expect(screen.getByText("Admin tools coming soon")).toBeInTheDocument();
  });

  test("falls back to student profile for unknown role", () => {
    authState.user = {
      username: "unknown_user",
      email: "unknown@trentu.ca",
      user_type: "guest",
      course_code: "COIS-4000Y",
    };
    render(<Profile />);
    expect(screen.getByText("unknown_user")).toBeInTheDocument();
    expect(screen.getAllByText(/Co-op Student/)).toHaveLength(2);
    expect(screen.queryByText("Developer Tools")).not.toBeInTheDocument();
    expect(screen.queryByText("Supervised Students")).not.toBeInTheDocument();
  });

test("navigates to settings when Edit Profile is clicked", () => {
  authState.user = {
    username: "student_user",
    email: "student@trentu.ca",
    user_type: "student",
    course_code: "COIS-4000Y",
  };

  render(<Profile />);

  fireEvent.click(screen.getByRole("button", { name: "Edit Profile" }));

  expect(mockNavigate).toHaveBeenCalledWith("/settings");
});
});
