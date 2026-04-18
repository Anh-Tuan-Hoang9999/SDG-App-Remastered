import MultiChoiceQuiz from "../components/activities/MultiChoiceQuiz";

export const quizItemsBySdg = {
  1: [
    { position: 1, title: "Intsssro Quiz" },
    { position: 4, title: "Simulation: Budgeting" },
  ],
  2: [
    { position: 1, title: "Intro Quiz" },
  ],
    3: [
    { position: 1, title: "Intsssro Quiz" },
    { position: 4, title: "Simulation: Budgeting" },
  ],
};

export default function Quiz({
  selectedSdg,
  selectedSdgQuizzes,
  selectedQuizPosition,
  onSelectQuiz,
  quizLoading,
  quizError,
  quizData,
  resolvedActivityId,
  onBack,
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "var(--app-muted)", border: "1px solid var(--app-border)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
          Quiz Practice
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: "var(--app-card)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
        >
          Back to Reflection
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedSdgQuizzes.map((quiz) => (
          <button
            key={quiz.position}
            type="button"
            onClick={() => onSelectQuiz(quiz.position)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={
              selectedQuizPosition === quiz.position
                ? { background: selectedSdg.colour, color: "#fff", border: `1px solid ${selectedSdg.colour}` }
                : { background: "var(--app-card)", color: "#5E9B7B", border: "1px solid var(--app-border)" }
            }
          >
            {quiz.title}
          </button>
        ))}
      </div>

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
    </div>
  );
}
