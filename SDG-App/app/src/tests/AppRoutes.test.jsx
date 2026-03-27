import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../routes/App";

const authState = {
  user: null,
  loading: false,
  sessionExpired: false,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock("../authContext", () => ({
  useAuth: () => authState,
}));

describe("App route integration", () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    authState.sessionExpired = false;
    vi.clearAllMocks();
  });

  // someone not logged in trying to go to /profile should end up on the login page
  test("redirects unauthenticated users from /profile to login", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  // a logged in student should be able to access their profile normally
  test("allows authenticated users to access /profile", async () => {
    authState.user = {
      username: "student_user",
      email: "student@trentu.ca",
      user_type: "student",
      course_code: "COIS-4000Y",
    };
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findAllByText("student_user")).not.toHaveLength(0);
  });

  test("redirects unknown route to login flow", () => {
  render(
    <MemoryRouter initialEntries={["/unknownroute"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});
});
