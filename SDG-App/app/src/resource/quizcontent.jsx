import MultiChoiceQuiz from "../components/activities/MultiChoiceQuiz";

export const quizContentBySdg = {
  1: {
    1: {
      title: "SDG 1 Mock Quiz: No Poverty Basics",
      questions: [
        {
          questionText: "What is the core aim of SDG 1?",
          options: [
            "End poverty in all its forms everywhere",
            "Increase private sector profit only",
            "Build more highways globally",
            "Focus only on food imports",
          ],
          correctOptionIndex: 0,
        },
        {
          questionText: "Which co-op workplace action best supports SDG 1?",
          options: [
            "Removing paid training opportunities",
            "Creating inclusive hiring and fair wages",
            "Reducing access to community services",
            "Limiting employee development",
          ],
          correctOptionIndex: 1,
        },
        {
          questionText: "Why are social protection programs linked to SDG 1?",
          options: [
            "They increase inequality by design",
            "They only benefit high-income groups",
            "They help vulnerable people meet basic needs",
            "They replace all employment policies",
          ],
          correctOptionIndex: 2,
        },
      ],
    },
  },
};

export function getQuizContent(sdgNumber, position) {
  return quizContentBySdg[sdgNumber]?.[position] ?? null;
}

export default function QuizContent({
  quizLoading,
  quizError,
  quizData,
  resolvedActivityId,
  onBack,
}) {
  return (
    <>
      {quizLoading && (
        <p className="text-sm" style={{ color: "var(--app-text2)" }}>
          Loading quiz...
        </p>
      )}

      {quizError && !quizLoading && (
        <div
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}
        >
          {quizError}
        </div>
      )}

      {!quizLoading && !quizError && quizData && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <MultiChoiceQuiz
            data={quizData}
            activityId={resolvedActivityId ?? undefined}
            onBack={() => onBack()}
          />
        </div>
      )}
    </>
  );
}
