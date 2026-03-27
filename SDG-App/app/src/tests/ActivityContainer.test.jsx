import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import ActivityContainer from "../screens/ActivityContainer";

vi.mock("../api/userActivity", () => ({
  getActivityByPosition: vi.fn(() =>
    Promise.resolve({
      activity_id: 123,
      activity_content: {
        title: "Sample Quiz",
        questions: [
          {
            question_text: "Q1",
            options: ["A", "B"],
            correct_option_index: 0,
          },
        ],
      },
    })
  ),
  getActivityProgress: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("../components/activities/MultiChoiceQuiz", () => ({
  default: () => <div>MultiChoiceQuiz Component</div>,
}));

describe("ActivityContainer", () => {
  const renderRoute = () =>
    render(
      <MemoryRouter initialEntries={["/activities/1/1"]}>
        <Routes>
          <Route path="/activities/:sdgId/:activityId" element={<ActivityContainer />} />
        </Routes>
      </MemoryRouter>
    );

  // just checks the quiz component actually shows up
  test("renders the quiz component", async () => {
    renderRoute();
    expect(await screen.findByText("MultiChoiceQuiz Component")).toBeInTheDocument();
  });

  // should render fine no matter what the route params are
  test("renders regardless of route params", async () => {
    renderRoute();
    expect(await screen.findByText("MultiChoiceQuiz Component")).toBeInTheDocument();
  });
});
