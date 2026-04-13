import React, { useEffect, useMemo, useState } from "react";
import { SDG_DATA } from "@/data/sdgData";
import { FileText, Save, BookOpen } from "lucide-react";
import CardData from "../data/CardData";
import MultiChoiceQuiz from "../components/activities/MultiChoiceQuiz";
import { getActivityByPosition } from "../api/userActivity";
import client from "../api/client";
import { useAuth } from "../authContext";

const SDG1_MOCK_QUIZ = {
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
};

const SectionCard = ({ children, className = "", ...props }) => (
  <div
    {...props}
    className={`bg-white rounded-2xl ${className}`}
    style={{ border: "1px solid var(--app-border)", boxShadow: "var(--app-shadow-card)" }}
  >
    {children}
  </div>
);

// Helper to get SDG names from numbers
function getSdgNames(sdgNumbers) {
  if (!Array.isArray(sdgNumbers) || sdgNumbers.length === 0) return "Reflection";
  const names = sdgNumbers
    .map(num => SDG_DATA.find(sdg => sdg.number === num)?.title)
    .filter(Boolean);
  return names.length > 0 ? names.join(", ") : "Reflection";
}

export default function ReflectionLog() {
  const { user } = useAuth();
  const sortedSdgData = useMemo(() => [...SDG_DATA].sort((a, b) => a.number - b.number), []);

  const [reflectionsBySdg, setReflectionsBySdg] = useState({});
  const [reflectionRecordBySdg, setReflectionRecordBySdg] = useState({});
  const [selectedSdgNumber, setSelectedSdgNumber] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [showPractice, setShowPractice] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [selectedQuizPosition, setSelectedQuizPosition] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [resolvedActivityId, setResolvedActivityId] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");

  const loadReflectionsFromDb = async () => {
    if (!user?.id) return;

    setLoadingReflections(true);
    setSaveMessage("");
    const initialReflections = {};
    const latestBySdg = {};

    sortedSdgData.forEach((sdg) => {
      initialReflections[sdg.number] = "";
      latestBySdg[sdg.number] = null;
    });

    try {
      const res = await client.get(`/api/reflections/${user.id}`);
      const rows = Array.isArray(res.data) ? res.data : [];

      // API returns newest first, so first match per SDG is the latest entry.
      rows.forEach((row) => {
        const numbers = Array.isArray(row.sdg_numbers) ? row.sdg_numbers : [];
        numbers.forEach((n) => {
          if (!(n in initialReflections)) return;
          if (latestBySdg[n]) return;
          latestBySdg[n] = row;
          initialReflections[n] = row.reflection_text || "";
        });
      });

      setReflectionRecordBySdg(latestBySdg);
      setReflectionsBySdg(initialReflections);
    } catch {
      setSaveMessage("Unable to load reflections from database.");
      setReflectionsBySdg(initialReflections);
      setReflectionRecordBySdg(latestBySdg);
    } finally {
      setLoadingReflections(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadReflectionsFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sortedSdgData]);

  const handleChangeReflection = (sdgNumber, value) => {
    setReflectionsBySdg((prev) => ({ ...prev, [sdgNumber]: value }));
    setSaveMessage("");
  };

  const handleSaveAll = async () => {
    if (!user?.id) {
      setSaveMessage("Please log in to save reflections.");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      let createdCount = 0;

      for (const sdg of sortedSdgData) {
        const text = (reflectionsBySdg[sdg.number] || "").trim();
        if (!text) continue;

        const existingText = (reflectionRecordBySdg[sdg.number]?.reflection_text || "").trim();
        if (text === existingText) continue;

        await client.post("/api/reflections", {
          user_id: user.id,
          title: `SDG ${sdg.number}: ${sdg.title}`,
          type: sdg.title,
          sdg_numbers: [sdg.number],
          reflection_text: text,
          employer_discussion: false,
        });
        createdCount += 1;
      }

      // Keep user_progress reflection_count in sync for today's progress.
      const allReflectionsRes = await client.get(`/api/reflections/${user.id}`);
      const today = new Date();
      const isSameDay = (isoLike) => {
        const d = new Date(isoLike);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      };
      const todayReflections = Array.isArray(allReflectionsRes.data)
        ? allReflectionsRes.data.filter((r) => r?.created_at && isSameDay(r.created_at)).length
        : 0;
      await client.patch(`/api/progress/${user.id}`, { reflection_count: todayReflections });

      await loadReflectionsFromDb();
      setSavedAt(new Date());
      setSaveMessage(createdCount > 0 ? "Saved reflections to database." : "No changes to save.");
    } catch {
      setSaveMessage("Unable to save reflections to database.");
    } finally {
      setSaving(false);
    }
  };

  const selectedSdg = sortedSdgData.find((sdg) => sdg.number === selectedSdgNumber) ?? null;
  const selectedText = selectedSdg ? (reflectionsBySdg[selectedSdg.number] ?? "") : "";
  const selectedCard = useMemo(
    () => CardData.find((card) => card.id === selectedSdgNumber) ?? null,
    [selectedSdgNumber]
  );
  const selectedSdgQuizzes = useMemo(() => {
    if (!selectedCard) return [];

    const path = selectedCard.learningPath ?? [{ id: 1, type: "activity", title: "Intro Quiz" }];
    const quizItems = path
      .filter((item) => item.type === "activity")
      .map((item) => ({ position: item.id, title: item.title || `Quiz ${item.id}` }));

    return quizItems.length > 0 ? quizItems : [{ position: 1, title: "Intro Quiz" }];
  }, [selectedCard]);
  const selectedSdgReadings = useMemo(() => {
    if (!selectedCard) return [];

    const path = selectedCard.learningPath ?? [{ id: 2, type: "learning", title: "Read: SDG Overview" }];
    const readingItems = path
      .filter((item) => item.type === "learning")
      .map((item) => ({ id: item.id, title: item.title || `Reading ${item.id}` }));

    return readingItems.length > 0 ? readingItems : [{ id: 2, title: `Read: ${selectedCard.title} Facts` }];
  }, [selectedCard]);

  const loadQuizByPosition = async (position) => {
    if (!selectedSdg) return;

    setQuizLoading(true);
    setQuizError("");
    setQuizData(null);
    setResolvedActivityId(null);

    if (selectedSdg.number === 1 && position === 1) {
      setQuizData(SDG1_MOCK_QUIZ);
      setQuizLoading(false);
      return;
    }

    try {
      const activity = await getActivityByPosition(selectedSdg.number, position);
      const content = activity.activity_content;

      setResolvedActivityId(activity.activity_id);
      setQuizData({
        title: content.title,
        questions: content.questions.map((q) => ({
          questionText: q.question_text,
          options: q.options,
          correctOptionIndex: q.correct_option_index,
        })),
      });
    } catch {
      setQuizError("Quiz is not available for this SDG yet.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handlePracticeClick = () => {
    const next = !showPractice;
    setShowPractice(next);
    setShowReading(false);

    if (!next || selectedSdgQuizzes.length === 0) return;

    const firstQuiz = selectedSdgQuizzes[0].position;
    if (selectedQuizPosition == null) {
      setSelectedQuizPosition(firstQuiz);
      loadQuizByPosition(firstQuiz);
    }
  };

  const handleReadingClick = () => {
    const next = !showReading;
    setShowReading(next);
    setShowPractice(false);
  };

  useEffect(() => {
    setShowPractice(false);
    setShowReading(false);
    setSelectedQuizPosition(null);
    setQuizData(null);
    setResolvedActivityId(null);
    setQuizError("");
    setQuizLoading(false);
  }, [selectedSdgNumber]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--app-muted)" }}
            >
              <FileText className="w-4 h-4" style={{ color: "#4A8A70" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--app-text1)" }}>
              Reflection Log
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--app-text2)" }}>
            Pick an SDG from Quick Jump, then write your reflection for that topic below.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto transition-all active:scale-95"
          style={{ background: "#36656B", color: "#fff", boxShadow: "0 2px 8px rgba(54,101,107,0.25)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Reflections"}
        </button>
      </div>

      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs mb-4"
        style={{ background: "rgba(74,138,112,0.10)", border: "1px solid rgba(74,138,112,0.22)", color: "var(--app-text2)" }}
      >
        <span>
          Only one SDG reflection editor is shown at a time to keep this page clean.
        </span>
      </div>

      {savedAt && (
        <p className="text-xs mb-4" style={{ color: "var(--app-text3)" }}>
          Saved at {savedAt.toLocaleTimeString()}
        </p>
      )}

      {loadingReflections && (
        <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: "var(--app-muted)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}>
          Loading reflections from database...
        </div>
      )}

      {saveMessage && (
        <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(74,138,112,0.10)", color: "#6AAF8A", border: "1px solid var(--app-border)" }}>
          {saveMessage}
        </div>
      )}

      <SectionCard className="p-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--app-text3)" }}>
          Quick Jump
        </h2>
        <div className="flex flex-wrap gap-2">
          {sortedSdgData.map((sdg) => (
            <button
              key={sdg.number}
              type="button"
              onClick={() => setSelectedSdgNumber(sdg.number)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={
                selectedSdgNumber === sdg.number
                  ? { background: sdg.colour, color: "#fff", border: `1px solid ${sdg.colour}` }
                  : { background: `${sdg.colour}1A`, color: sdg.colour, border: `1px solid ${sdg.colour}55` }
              }
            >
              {sdg.title}
            </button>
          ))}
        </div>
      </SectionCard>

      {!selectedSdg && (
        <SectionCard className="p-6 text-center">
          <p className="text-sm" style={{ color: "var(--app-text2)" }}>
            Select any SDG section from quick jump to view its reflection.
          </p>
        </SectionCard>
      )}

      {selectedSdg && (
        <SectionCard className="overflow-hidden" id={`sdg-reflection-${selectedSdg.number}`}>
          <div className="px-4 sm:px-5 py-4" style={{ borderBottom: "1px solid var(--app-border)" }}>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: selectedSdg.colour }}>
                SDG {selectedSdg.number}
              </p>
              <h3 className="text-sm sm:text-base font-bold leading-tight" style={{ color: "var(--app-text1)" }}>
                {selectedSdg.title}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--app-text2)" }}>
                {selectedSdg.desc}
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-5 py-4">
            {!showPractice && !showReading && (
              <>
                <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--app-text2)" }}>
                  Reflection for {selectedSdg.title}
                </label>

                <textarea
                  className="auth-input min-h-[120px] resize-y"
                  placeholder={`Write your reflection for SDG ${selectedSdg.number} - ${selectedSdg.title}...`}
                  value={selectedText}
                  onChange={(e) => handleChangeReflection(selectedSdg.number, e.target.value)}
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs" style={{ color: "var(--app-text3)" }}>
                    {selectedText.trim().length} characters
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReadingClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={{ background: "var(--app-muted)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
                    >
                      Reading
                    </button>

                    <button
                      type="button"
                      onClick={handlePracticeClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={{ background: "var(--app-muted)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
                    >
                      Practice
                    </button>
                  </div>
                </div>
              </>
            )}

            {showReading && (
              <div
                className="p-4 rounded-xl"
                style={{ background: "var(--app-muted)", border: "1px solid var(--app-border)" }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--app-text2)" }}>
                    Reading
                  </p>
                  <button
                    type="button"
                    onClick={handleReadingClick}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ background: "var(--app-card)", color: "#5E9B7B", border: "1px solid var(--app-border)" }}
                  >
                    Back to Reflection
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedSdgReadings.map((reading) => (
                    <a
                      key={reading.id}
                      href="https://www.youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-3xl px-5 py-4 transition-all active:scale-[0.99]"
                      style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-shadow-card)" }}
                    >
                      <div className="flex items-center gap-4">
                        <BookOpen className="w-9 h-9 shrink-0" style={{ color: "#E73E45" }} />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm uppercase tracking-wide font-semibold" style={{ color: "#E73E45" }}>
                            {reading.id} · Reading
                          </p>
                          <p className="text-xl font-bold truncate" style={{ color: "var(--app-text1)" }}>
                            {reading.title}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {showPractice && (
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
                    onClick={handlePracticeClick}
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
                      onClick={() => {
                        setSelectedQuizPosition(quiz.position);
                        loadQuizByPosition(quiz.position);
                      }}
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
                      onBack={() => {
                        setQuizData(null);
                        setResolvedActivityId(null);
                        setSelectedQuizPosition(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
