import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MultiChoiceQuiz from "../components/activities/MultiChoiceQuiz";
import * as userActivityApi from "../api/userActivity";

vi.mock("../api/userActivity", () => ({
  startOrResumeActivity: vi.fn(() => Promise.resolve({ user_activity_id: 1 })),
  saveActivityProgress: vi.fn(() => Promise.resolve({})),
  completeActivity: vi.fn(() => Promise.resolve({})),
}));

const quizData = {
  title: "SDG 1 Quiz",
  questions: [
    {
      questionText: "What is the primary goal of SDG 1?",
      options: [
        "End poverty in all its forms everywhere",
        "End hunger",
      ],
      correctOptionIndex: 0,
    },
    {
      questionText:
        "Extreme poverty is defined by the World Bank as living on less than how much per day?",
      options: ["$2.15", "$5.00"],
      correctOptionIndex: 0,
    },
  ],
};

describe("MultiChoiceQuiz", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    userActivityApi.startOrResumeActivity.mockResolvedValue({ user_activity_id: 1 });
    userActivityApi.saveActivityProgress.mockResolvedValue({});
    userActivityApi.completeActivity.mockResolvedValue({});
  });

  // on load the first question should show and next should be disabled until an answer is picked
  test("renders first question and disabled next button initially", async () => {
    render(<MultiChoiceQuiz data={quizData} activityId={1} onBack={vi.fn()} />);
    expect(await screen.findByText("What is the primary goal of SDG 1?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next question/i })).toBeDisabled();
    expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
  });

  // picking an answer should unlock the next button and clicking it should move to q2
  test("enables next button after selecting a choice and moves to next question", async () => {
    render(<MultiChoiceQuiz data={quizData} activityId={1} onBack={vi.fn()} />);
    await screen.findByText("What is the primary goal of SDG 1?");
    fireEvent.click(screen.getByRole("button", { name: /End poverty in all its forms everywhere/i }));
    const nextBtn = screen.getByRole("button", { name: /next question/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(
      screen.getByText(/Extreme poverty is defined by the World Bank as living on less than how much per day\?/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/question 2 of 2/i)).toBeInTheDocument();
  });
});
