import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import RealProgress from "../screens/RealProgress";
import client from "../api/client";

vi.mock("../authContext", () => ({
  useAuth: () => ({ user: { id: 42, name: "Test User" } }),
}));

vi.mock("../api/client", () => ({
  default: { get: vi.fn() },
}));

// A progress record where 4 of 5 activities are complete:
//   ✓ viewed_sdg_cards  (non-empty array)
//   ✓ completed_card_sort
//   ✓ reflection_count >= 1  (count = 2)
//   ✗ reflection_count_3     (count = 2, threshold = 3)
//   ✓ viewed_resources  (non-empty array)
const FULL_PROGRESS = {
  id: 1,
  user_id: 42,
  viewed_sdg_cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  completed_card_sort: true,
  completed_quiz: false,
  reflection_count: 2,
  viewed_resources: ["resources"],
};

const EMPTY_PROGRESS = {
  id: 2,
  user_id: 42,
  viewed_sdg_cards: null,
  completed_card_sort: false,
  completed_quiz: false,
  reflection_count: 0,
  viewed_resources: null,
};

function renderProgress() {
  return render(
    <MemoryRouter>
      <RealProgress />
    </MemoryRouter>
  );
}

describe("RealProgress screen", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────

  test("renders the Progress Tracker heading", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS });
    renderProgress();
    expect(screen.getByText("Progress Tracker")).toBeInTheDocument();
  });

  // ── API call ───────────────────────────────────────────────────────────────

  test("fetches progress using the authenticated user id", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS });
    renderProgress();
    await waitFor(() =>
      expect(client.get).toHaveBeenCalledWith("/api/progress/42")
    );
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  test("shows a spinner while the request is in flight", () => {
    // never resolves → stays in loading state
    client.get.mockImplementation(() => new Promise(() => {}));
    renderProgress();
    // The loading spinner is the only animated element; stat cards are absent
    expect(screen.queryByText("Activity Checklist")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────────────────

  test("shows an error message when the API call fails", async () => {
    client.get.mockRejectedValue(new Error("Network error"));
    renderProgress();
    expect(
      await screen.findByText("Could not load your progress. Please try again.")
    ).toBeInTheDocument();
  });

  test("does not render stat cards when the API fails", async () => {
    client.get.mockRejectedValue(new Error("fail"));
    renderProgress();
    await waitFor(() =>
      expect(screen.queryByText("Completed")).not.toBeInTheDocument()
    );
  });

  // ── Progress data ──────────────────────────────────────────────────────────

  test("marks 4 of 5 activities as done for FULL_PROGRESS fixture", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS });
    renderProgress();
    await waitFor(() => {
      const donePills = screen.getAllByText("Done");
      expect(donePills).toHaveLength(4);
    });
  });

  test("marks 0 activities as done when progress is all zeros/null", async () => {
    client.get.mockResolvedValue({ data: EMPTY_PROGRESS });
    renderProgress();
    await waitFor(() => {
      expect(screen.queryByText("Done")).not.toBeInTheDocument();
    });
  });

  test("shows correct completed count in stat card", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS });
    renderProgress();
    // 4 completed out of 5 activities
    await screen.findByText("Activity Checklist");
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  test("reflection_count >= 1 but < 3 marks first threshold done, second not done", async () => {
    const progress = { ...EMPTY_PROGRESS, reflection_count: 1 };
    client.get.mockResolvedValue({ data: progress });
    renderProgress();
    await screen.findByText("Activity Checklist");
    // "Submit a Reflection" is done (count >= 1)
    // "Submit 3 Reflections" is NOT done (count < 3)
    const donePills = screen.getAllByText("Done");
    expect(donePills).toHaveLength(1);
  });

  test("reflection_count >= 3 marks both reflection thresholds as done", async () => {
    const progress = { ...EMPTY_PROGRESS, reflection_count: 3 };
    client.get.mockResolvedValue({ data: progress });
    renderProgress();
    await screen.findByText("Activity Checklist");
    const donePills = screen.getAllByText("Done");
    expect(donePills).toHaveLength(2);
  });

  test("viewed_sdg_cards null is treated as not done", async () => {
    const progress = { ...EMPTY_PROGRESS, viewed_sdg_cards: null };
    client.get.mockResolvedValue({ data: progress });
    renderProgress();
    await screen.findByText("Activity Checklist");
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
  });

  test("viewed_sdg_cards with entries is treated as done", async () => {
    const progress = { ...EMPTY_PROGRESS, viewed_sdg_cards: [1, 2, 3] };
    client.get.mockResolvedValue({ data: progress });
    renderProgress();
    await screen.findByText("Activity Checklist");
    expect(screen.getAllByText("Done")).toHaveLength(1);
  });

  // ── No mock content ────────────────────────────────────────────────────────

  test("does not render any mock-only messaging", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS });
    renderProgress();
    await screen.findByText("Activity Checklist");
    expect(screen.queryByText(/mock only/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/simulated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no backend data/i)).not.toBeInTheDocument();
  });

  // ── Completion banner ──────────────────────────────────────────────────────

  test("shows completion banner when all activities are done", async () => {
    const allDone = {
      ...FULL_PROGRESS,
      reflection_count: 3, // satisfies both 1 and 3 thresholds
    };
    client.get.mockResolvedValue({ data: allDone });
    renderProgress();
    expect(
      await screen.findByText("All Activities Complete!")
    ).toBeInTheDocument();
  });

  test("does not show completion banner when progress is partial", async () => {
    client.get.mockResolvedValue({ data: FULL_PROGRESS }); // reflection_count=2, misses threshold_3
    renderProgress();
    await screen.findByText("Activity Checklist");
    expect(screen.queryByText("All Activities Complete!")).not.toBeInTheDocument();
  });
});
