import MultiChoiceQuiz from "../components/activities/MultiChoiceQuiz";

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
