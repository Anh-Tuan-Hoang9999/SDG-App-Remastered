import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Register from "../screens/Register";
import client from "../api/client";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Register screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function fillForm({
    name = "Student One",
    email = "student@trentu.ca",
    password = "MyPassword@123",
    confirmPassword = "MyPassword@123",
    coordinatorVerifyCode = "",
  } = {}) {
    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: name },
    });
    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: password },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: confirmPassword },
    });
    fireEvent.change(screen.getByPlaceholderText("2101"), {
      target: { value: coordinatorVerifyCode },
    });
  }

  // passwords not matching should be caught on the frontend before even hitting the server
  test("shows error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );
    fillForm({ confirmPassword: "DifferentPass123" });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // if the email is already taken the server error should show up on screen
  test("shows backend error when registration fails", async () => {
    client.post.mockRejectedValue({
      response: { data: { detail: "Email already registered" } },
    });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // successful registration should send the user to the login page
  test("navigates to login when registration succeeds", async () => {
    client.post.mockResolvedValue({ data: {} });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(await screen.findByRole("button", { name: "Create Account" })).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

test("shows network error when register request fails", async () => {
  client.post.mockRejectedValue(new Error("Network down"));

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

  expect(
    await screen.findByText("Unable to connect. Please check your connection and try again.")
  ).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});

// if course code is left blank it should not be sent in the request body
test("submits student registration when coordinator code is left empty", async () => {
  client.post.mockResolvedValue({ data: {} });

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );

  fillForm({ coordinatorVerifyCode: "" });
  fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

  expect(client.post).toHaveBeenCalledTimes(1);
  const [, body] = client.post.mock.calls[0];

  expect(body.name).toBe("Student One");
  expect(body.email).toBe("student@trentu.ca");
  expect(body.password).toBe("MyPassword@123");
  expect(body.role).toBe("student");
});
});
