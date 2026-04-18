import QuizContent from "./quizcontent";

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

      <QuizContent
        quizLoading={quizLoading}
        quizError={quizError}
        quizData={quizData}
        resolvedActivityId={resolvedActivityId}
        onBack={onBack}
      />
    </div>
  );
}
