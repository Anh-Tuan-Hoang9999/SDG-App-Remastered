import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Register from "../screens/Register";
import client from "../api/client";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api/client", () => ({
  default: { post: vi.fn() },
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

// Fill and submit step 1 form
function fillStep1({
  name = "Student One",
  email = "student@trentu.ca",
  password = "MyPassword@123",
  confirmPassword = "MyPassword@123",
  coordinatorVerifyCode = "",
} = {}) {
  fireEvent.change(screen.getByPlaceholderText("Your full name"), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: confirmPassword } });
  fireEvent.change(screen.getByPlaceholderText("2101"), { target: { value: coordinatorVerifyCode } });
}

describe("Register screen", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  // ── Step 1 rendering ──────────────────────────────────────────────────────

  test("renders step 1 form with all expected fields", () => {
    renderRegister();
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("yourname@trentu.ca")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re-enter your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("2101")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  test("shows sign in link on step 1", () => {
    renderRegister();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  // ── Step 1 validation (frontend-only, no API call) ────────────────────────

  test("non-trentu email shows error without calling API", async () => {
    renderRegister();
    fillStep1({ email: "student@gmail.com" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText(/only @trentu\.ca/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  test("mismatched passwords show error without calling API", async () => {
    renderRegister();
    fillStep1({ confirmPassword: "DifferentPass!" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  test("weak password shows frontend strength error without calling API", async () => {
    renderRegister();
    fillStep1({ password: "weak", confirmPassword: "weak" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(
      await screen.findByText("Please create a stronger password before continuing.")
    ).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  test("invalid coordinator code shows error without calling API", async () => {
    renderRegister();
    fillStep1({ coordinatorVerifyCode: "9999" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText("Invalid coordinator verification code.")).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  // ── Step 1 → Step 2 transition ────────────────────────────────────────────

  test("successful code send advances to step 2", async () => {
    client.post.mockResolvedValueOnce({ data: { message: "Code sent." } });
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify & Create Account" })).toBeInTheDocument();
  });

  test("shows live strong password guidance for valid password", () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: "MyPassword@123" },
    });
    expect(screen.getByText("Password strength")).toBeInTheDocument();
    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
  });

  test("step 2 displays the submitted email address", async () => {
    client.post.mockResolvedValueOnce({ data: {} });
    renderRegister();
    fillStep1({ email: "jane@trentu.ca" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText("jane@trentu.ca")).toBeInTheDocument();
  });

  test("API error on send-code shows error and stays on step 1", async () => {
    client.post.mockRejectedValueOnce({
      response: { data: { detail: "Email already registered." } },
    });
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(await screen.findByText("Email already registered.")).toBeInTheDocument();
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });

  test("shows frontend error for non-trent email and does not submit", async () => {
    renderRegister();
    fillStep1({ email: "student@example.com" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    expect(
      await screen.findByText(/only @trentu\.ca/i)
    ).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("calls send-verification-code with the correct email", async () => {
    client.post.mockResolvedValueOnce({ data: {} });
    renderRegister();
    fillStep1({ email: "alice@trentu.ca" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    expect(client.post).toHaveBeenCalledWith("/api/auth/send-verification-code", {
      email: "alice@trentu.ca",
    });
  });

  // ── Step 2 — verification ─────────────────────────────────────────────────

  test("wrong code shows API error on step 2", async () => {
    client.post
      .mockResolvedValueOnce({ data: {} }) // send-code
      .mockRejectedValueOnce({ response: { data: { detail: "Invalid verification code." } } });
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Create Account" }));
    expect(await screen.findByText("Invalid verification code.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("correct code triggers register and navigates to /login", async () => {
    client.post
      .mockResolvedValueOnce({ data: {} })  // send-code
      .mockResolvedValueOnce({ data: { verified: true } })  // verify-code
      .mockResolvedValueOnce({ data: { id: 1 } });          // register
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Create Account" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });

  test("registers as student when coordinator code is blank", async () => {
    client.post
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { verified: true } })
      .mockResolvedValueOnce({ data: { id: 1 } });
    renderRegister();
    fillStep1({ coordinatorVerifyCode: "" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Create Account" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const registerCall = client.post.mock.calls.find((c) => c[0] === "/api/auth/register");
    expect(registerCall[1].role).toBe("student");
  });

  test("registers as coordinator when coordinator code is 2101", async () => {
    client.post
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { verified: true } })
      .mockResolvedValueOnce({ data: { id: 1 } });
    renderRegister();
    fillStep1({ coordinatorVerifyCode: "2101" });
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Create Account" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const registerCall = client.post.mock.calls.find((c) => c[0] === "/api/auth/register");
    expect(registerCall[1].role).toBe("coordinator");
  });

  test("network error on verify shows fallback message", async () => {
    client.post
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("Network down"));
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify & Create Account" }));
    expect(
      await screen.findByText("Unable to connect. Please check your connection and try again.")
    ).toBeInTheDocument();
  });

  // ── Back button ───────────────────────────────────────────────────────────

  test("back button returns to step 1", async () => {
    client.post.mockResolvedValueOnce({ data: {} });
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(screen.getByRole("button", { name: "Send Verification Code" })).toBeInTheDocument();
  });

  // ── Resend button ─────────────────────────────────────────────────────────

  test("resend button appears on step 2", async () => {
    client.post.mockResolvedValueOnce({ data: {} });
    renderRegister();
    fillStep1();
    fireEvent.click(screen.getByRole("button", { name: "Send Verification Code" }));
    await screen.findByText("Check your email");
    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument();
  });
});
