import { describe, test, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ForgotPassword from "../screens/ForgotPassword";
import client from "../api/client";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api/client", () => ({
  default: { post: vi.fn() },
}));

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe("Forgot password screen", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("blocks non-trentu email before calling the API", async () => {
    renderForgotPassword();

    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: "student@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Code" }));

    expect(await screen.findByText(/only @trentu\.ca/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
  });

  test("advances to verification step after requesting a code", async () => {
    client.post.mockResolvedValueOnce({
      data: { message: "If an account exists for that email, a password reset code has been sent." },
    });

    renderForgotPassword();

    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Code" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
  });

  test("moves to the reset form after verifying the code", async () => {
    client.post
      .mockResolvedValueOnce({
        data: { message: "If an account exists for that email, a password reset code has been sent." },
      })
      .mockResolvedValueOnce({
        data: { verified: true, reset_token: "reset-token-123" },
      });

    renderForgotPassword();

    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Code" }));
    await screen.findByText("Check your email");

    fireEvent.change(screen.getByPlaceholderText("000000"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    expect(await screen.findByText("Create a new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a new password")).toBeInTheDocument();
  });

  test("blocks weak password on the reset form before submitting", async () => {
    client.post
      .mockResolvedValueOnce({
        data: { message: "If an account exists for that email, a password reset code has been sent." },
      })
      .mockResolvedValueOnce({
        data: { verified: true, reset_token: "reset-token-123" },
      });

    renderForgotPassword();

    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Code" }));
    await screen.findByText("Check your email");

    fireEvent.change(screen.getByPlaceholderText("000000"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));
    await screen.findByText("Create a new password");

    fireEvent.change(screen.getByPlaceholderText("Create a new password"), {
      target: { value: "weak" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your new password"), {
      target: { value: "weak" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(
      await screen.findByText("Please create a stronger password before continuing.")
    ).toBeInTheDocument();
    expect(client.post).toHaveBeenCalledTimes(2);
  });

  test("submits the reset token and navigates back to login on success", async () => {
    client.post
      .mockResolvedValueOnce({
        data: { message: "If an account exists for that email, a password reset code has been sent." },
      })
      .mockResolvedValueOnce({
        data: { verified: true, reset_token: "reset-token-123" },
      })
      .mockResolvedValueOnce({
        data: { message: "Password updated successfully." },
      });

    renderForgotPassword();

    fireEvent.change(screen.getByPlaceholderText("yourname@trentu.ca"), {
      target: { value: "student@trentu.ca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Code" }));
    await screen.findByText("Check your email");

    fireEvent.change(screen.getByPlaceholderText("000000"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));
    await screen.findByText("Create a new password");

    fireEvent.change(screen.getByPlaceholderText("Create a new password"), {
      target: { value: "NewPass@123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your new password"), {
      target: { value: "NewPass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    expect(client.post).toHaveBeenLastCalledWith("/api/auth/reset-password", {
      email: "student@trentu.ca",
      reset_token: "reset-token-123",
      new_password: "NewPass@123",
    });
  });
});
