import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../authContext";
import { jwtDecode } from "jwt-decode";
import client from "../api/client";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

function Probe() {
  const { token, sessionExpired } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ? "present" : "empty"}</span>
      <span data-testid="expired">{sessionExpired ? "yes" : "no"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("clears token and flags session as expired when JWT is expired", async () => {
  localStorage.setItem("token", "expired-token");
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 60 });

  client.get.mockResolvedValue({ data: { username: "test" } });

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("expired").textContent).toBe("yes");
    expect(screen.getByTestId("token").textContent).toBe("empty");
  });
});

test("keeps session active and fetches user when JWT is valid", async () => {
  localStorage.setItem("token", "valid-token");
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

  client.get.mockResolvedValue({
    data: { username: "ahmed", user_type: "student" },
  });

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("expired").textContent).toBe("no");
    expect(screen.getByTestId("token").textContent).toBe("present");
  });

  expect(client.get).toHaveBeenCalledWith("/users/me");
});

test("marks session expired when JWT decode throws (invalid token)", async () => {
  localStorage.setItem("token", "bad-token");
  jwtDecode.mockImplementation(() => {
    throw new Error("Invalid token");
  });

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("expired").textContent).toBe("yes");
    expect(screen.getByTestId("token").textContent).toBe("empty");
  });

  expect(client.get).not.toHaveBeenCalled();
});

test("expires session when /users/me returns unauthorized", async () => {
  localStorage.setItem("token", "valid-token");
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

  client.get.mockRejectedValue(new Error("Unauthorized"));

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("expired").textContent).toBe("yes");
    expect(screen.getByTestId("token").textContent).toBe("empty");
  });

  expect(client.get).toHaveBeenCalledWith("/users/me");
});

test("handles /users/me network failure without crashing", async () => {
  localStorage.setItem("token", "valid-token");
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

  client.get.mockRejectedValue(new Error("Network error"));

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("token").textContent).toBe("empty");
    expect(screen.getByTestId("expired").textContent).toBe("yes");
  });
});

// probe component to test the login function specifically
function LoginProbe() {
  const { token, sessionExpired, login } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || "empty"}</span>
      <span data-testid="expired">{sessionExpired ? "yes" : "no"}</span>
      <button onClick={() => login("new-token")} type="button">
        Do Login
      </button>
    </div>
  );
}

// calling login should save the token and clear the expired flag, user should stay logged in
test("login stores token and resets sessionExpired", async () => {
  localStorage.clear();

  // pretend that the token is valid for one more hour
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

  client.get.mockResolvedValue({
    data: { username: "ahmed", user_type: "student" },
  });

  render(
    <AuthProvider>
      <LoginProbe />
    </AuthProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Do Login" }));

  await waitFor(() => {
    expect(screen.getByTestId("token").textContent).toBe("new-token");
    expect(screen.getByTestId("expired").textContent).toBe("no");
  });

  expect(localStorage.getItem("token")).toBe("new-token");
});

function LogoutProbe() {
  const { token, sessionExpired, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || "empty"}</span>
      <span data-testid="expired">{sessionExpired ? "yes" : "no"}</span>
      <button type="button" onClick={logout}>
        Do Logout
      </button>
    </div>
  );
}

test("logout clears token and resets sessionExpired", async () => {
  localStorage.setItem("token", "existing-token");
  jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

  client.get.mockResolvedValue({
    data: { username: "ahmed", user_type: "student" },
  });

  render(
    <AuthProvider>
      <LogoutProbe />
    </AuthProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Do Logout" }));

  await waitFor(() => {
    expect(screen.getByTestId("token").textContent).toBe("empty");
    expect(screen.getByTestId("expired").textContent).toBe("no");
  });

  expect(localStorage.getItem("token")).toBe(null);
});
});
