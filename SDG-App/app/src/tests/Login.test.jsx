import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Login from "../screens/Login";
import client from "../api/client";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const authState = {
  login: mockLogin,
  user: null,
  sessionExpired: false,
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../authContext", () => ({
  useAuth: () => authState,
}));

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Login screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    authState.sessionExpired = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("shows a backend error message when credentials are wrong", async () => {
    client.post.mockRejectedValue({
      response: { data: { detail: "Incorrect username or password" } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill in the login form with bad credentials
    fireEvent.change(screen.getByPlaceholderText("example@trent.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    // The error from the server should appear on screen
    expect(
      await screen.findByText("Incorrect username or password")
    ).toBeInTheDocument();

    // Since login failed, the user should NOT be logged in or redirected
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("logs in and navigates to learning on successful login", async () => {
    client.post.mockResolvedValue({
      data: { access_token: "fake-token" },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("example@trent.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "goodpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith("fake-token");
  });

  test("shows session expired message when auth reports expired session", async () => {
    authState.sessionExpired = true;

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Your session has expired. Please log in again.")
    ).toBeInTheDocument();
  });

  test("redirects authenticated user to learning screen", async () => {
  authState.user = { username: "student_user" };

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  expect(mockNavigate).toHaveBeenCalledWith("/learning");
});

test("shows network error message when login request fails", async () => {
  client.post.mockRejectedValue(new Error("Network down"));

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("example@trent.ca"), {
    target: { value: "student@trentu.ca" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "somepass" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(
    await screen.findByText(
      "Unable to connect to the server. Please check your internet connection and try again.",
    ),
  ).toBeInTheDocument();

  expect(mockLogin).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});

});
