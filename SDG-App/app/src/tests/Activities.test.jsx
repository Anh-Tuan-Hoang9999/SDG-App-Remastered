import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Activities from "../screens/Activities";
import CardData from "../data/CardData";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../components/ActivityLinkCard", () => ({
  default: (props) => <div data-testid="activity-card">{props.title || "card"}</div>,
}));

describe("Activities screen", () => {
  beforeEach(() => vi.clearAllMocks());

  // basic check that the main elements show up when the screen loads
  test("renders heading, progress summary, and progress button", () => {
    render(<Activities />);
    expect(screen.getByText("Test Your Knowledge")).toBeInTheDocument();
    expect(screen.getByText("0/17")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Progress" })).toBeInTheDocument();
  });

  // there should be one card for each entry in CardData
  test("renders one activity card per CardData entry", () => {
    render(<Activities />);
    const cards = screen.getAllByTestId("activity-card");
    expect(cards).toHaveLength(CardData.length);
  });

  // clicking the progress button should take the user to their profile
  test("navigates to progress when View Progress is clicked", () => {
    render(<Activities />);
    fireEvent.click(screen.getByRole("button", { name: "View Progress" }));
    expect(mockNavigate).toHaveBeenCalledWith("/progress");
  });
});
