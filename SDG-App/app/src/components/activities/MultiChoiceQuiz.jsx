import React, { useState, useEffect } from 'react'
import {
    startOrResumeActivity,
    saveActivityProgress,
    completeActivity,
} from '../../api/userActivity'

const THEME = {
    brand: '#36656B',
    brandDark: '#2D5358',
    pageBg: '#F4F7F5',
    cardBorder: '#DDE6DD',
    textMain: '#1A2E1A',
    textMuted: '#637063',
};

// Shuffles indices of the original array rather than the objects themselves
function shuffleIndices(length) {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

const MultiChoiceQuiz = ({ data, activityId, onBack }) => {
    const { title, questions } = data;

    // shuffledOrder holds original-array indices in shuffled order
    const [shuffledOrder, setShuffledOrder] = useState(() => shuffleIndices(questions.length));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [scoreCount, setScoreCount] = useState(0);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    // Persistence state — key: shuffled position, value: selected option index
    const [userActivityId, setUserActivityId] = useState(null);
    const [savedAnswers, setSavedAnswers] = useState({});

    useEffect(() => {
        if (!activityId) return;

        startOrResumeActivity(activityId)
            .then((record) => {
                setUserActivityId(record.user_activity_id);

                const saved = record.user_activity_data;
                if (saved?.shuffledQuestionIds?.length) {
                    // shuffledQuestionIds stores original-array indices in shuffled order
                    setShuffledOrder(saved.shuffledQuestionIds);
                    setCurrentIndex(saved.currentQuestionIndex ?? 0);
                    setSavedAnswers(saved.answers ?? {});

                    // Recompute score from past answers
                    const restoredScore = saved.shuffledQuestionIds
                        .slice(0, saved.currentQuestionIndex ?? 0)
                        .reduce((acc, originalIdx, shuffledPos) => {
                            const selected = saved.answers?.[shuffledPos];
                            return acc + (selected === questions[originalIdx].correctOptionIndex ? 1 : 0);
                        }, 0);
                    setScoreCount(restoredScore);

                    // Pre-select answer for the current question if already answered
                    const currentShuffledPos = saved.currentQuestionIndex ?? 0;
                    if (saved.answers?.[currentShuffledPos] !== undefined) {
                        setSelectedOptionIndex(Number(saved.answers[currentShuffledPos]));
                    }
                }
            })
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityId]);

    const currentOriginalIndex = shuffledOrder[currentIndex];
    const currentQuestion = questions[currentOriginalIndex];
    const isLastQuestion = currentIndex === shuffledOrder.length - 1;

    const handleOptionSelect = (optionIndex) => {
        setSelectedOptionIndex(optionIndex);

        if (!userActivityId || !currentQuestion) return;

        const updatedAnswers = { ...savedAnswers, [currentIndex]: optionIndex };
        setSavedAnswers(updatedAnswers);

        const saveData = {
            answers: updatedAnswers,
            currentQuestionIndex: currentIndex,
            shuffledQuestionIds: shuffledOrder,
        };
        saveActivityProgress(userActivityId, saveData).catch(console.error);
    };

    const handleNext = () => {
        const isCorrect = selectedOptionIndex === currentQuestion.correctOptionIndex;
        const newTotalScore = scoreCount + (isCorrect ? 1 : 0);

        if (isLastQuestion) {
            setScoreCount(newTotalScore);
            setFinalScore(newTotalScore);
            setIsQuizComplete(true);

            if (userActivityId) {
                const grade = `${Math.round((newTotalScore / shuffledOrder.length) * 100)}%`;
                const finalData = {
                    answers: { ...savedAnswers, [currentIndex]: selectedOptionIndex },
                    currentQuestionIndex: currentIndex,
                    shuffledQuestionIds: shuffledOrder,
                };
                completeActivity(userActivityId, grade, finalData).catch(console.error);
            }
        } else {
            setScoreCount(newTotalScore);
            setCurrentIndex(prev => prev + 1);
            setSelectedOptionIndex(null);
        }
    };

    const handleRetake = () => {
        const newOrder = shuffleIndices(questions.length);
        setShuffledOrder(newOrder);
        setCurrentIndex(0);
        setSelectedOptionIndex(null);
        setScoreCount(0);
        setFinalScore(0);
        setIsQuizComplete(false);
        setSavedAnswers({});

        if (activityId) {
            startOrResumeActivity(activityId)
                .then((record) => {
                    setUserActivityId(record.user_activity_id);
                    const saveData = {
                        answers: {},
                        currentQuestionIndex: 0,
                        shuffledQuestionIds: newOrder,
                    };
                    saveActivityProgress(record.user_activity_id, saveData).catch(console.error);
                })
                .catch(console.error);
        }
    };

    // Results Screen
    if (isQuizComplete) {
        const percentage = (finalScore / shuffledOrder.length) * 100;
        const allCorrect = finalScore === shuffledOrder.length;

        return (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-4 sm:p-5 text-center">
                <div
                    className="w-full rounded-2xl p-5 sm:p-7"
                    style={{ background: '#fff', border: `1px solid ${THEME.cardBorder}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
                >
                    <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: THEME.textMain }}>{title}</h1>
                    <h2 className="text-base sm:text-lg font-semibold mb-6" style={{ color: THEME.textMuted }}>Quiz Complete!</h2>

                    <div
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 flex items-center justify-center mb-6 mx-auto"
                        style={{ borderColor: THEME.brand }}
                    >
                        <span className="text-2xl sm:text-3xl font-bold" style={{ color: THEME.brand }}>{percentage.toFixed(0)}%</span>
                    </div>

                    <p className="text-base sm:text-lg mb-2" style={{ color: THEME.textMain }}>
                        You scored <span className="font-bold" style={{ color: THEME.brand }}>{finalScore}</span> out of <span className="font-bold">{shuffledOrder.length}</span>
                    </p>

                    {!allCorrect && (
                        <p className="text-sm mb-8" style={{ color: THEME.textMuted }}>
                            {percentage >= 80
                                ? "Great job! Review the ones you missed to master this topic."
                                : percentage >= 50
                                    ? "Good effort! Consider revisiting the material to improve your score."
                                    : "Keep learning! Try reviewing the content and retake the quiz."}
                        </p>
                    )}

                    {allCorrect && (
                        <p className="text-sm font-medium mb-8" style={{ color: '#2F7D50' }}>
                            Perfect score! You've mastered this topic. 🎉
                        </p>
                    )}

                    <button
                        onClick={handleRetake}
                        className="w-full py-3.5 rounded-xl font-bold text-base text-white shadow-md active:scale-95 transition-all"
                        style={{ background: THEME.brand }}
                    >
                        Retake Quiz
                    </button>

                    {onBack && (
                        <button
                            onClick={onBack}
                            className="w-full mt-3 py-3.5 rounded-xl font-bold text-base active:scale-95 transition-all"
                            style={{ background: '#EEF2EE', color: THEME.brand, border: `1px solid ${THEME.cardBorder}` }}
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full p-4 sm:p-5 rounded-2xl" style={{ background: THEME.pageBg }}>
            {/* Header with Progress */}
            <div className="mb-7">
                <h1 className="text-lg sm:text-xl font-bold mb-2" style={{ color: THEME.textMain }}>{title}</h1>
                <div className="w-full rounded-full h-2.5" style={{ background: '#DDE6DD' }}>
                    <div
                        className="h-2.5 rounded-full transition-all duration-300"
                        style={{ background: THEME.brand, width: `${((currentIndex + 1) / shuffledOrder.length) * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs mt-2 text-right" style={{ color: THEME.textMuted }}>
                    Question {currentIndex + 1} of {shuffledOrder.length}
                </p>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {/* key on currentIndex triggers re-render/animation on question change */}
                <div key={currentIndex} className="animation-fade-in block">
                    <h3 className="text-xl sm:text-2xl font-semibold mb-5 leading-tight" style={{ color: THEME.textMain }}>
                        {currentQuestion.questionText}
                    </h3>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, optionIndex) => (
                            <button
                                key={optionIndex}
                                onClick={() => handleOptionSelect(optionIndex)}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium text-base sm:text-lg
                                    ${selectedOptionIndex === optionIndex
                                        ? 'bg-white'
                                        : 'bg-white hover:bg-[#FAFCFA]'
                                    }
                                `}
                                style={selectedOptionIndex === optionIndex
                                    ? { borderColor: THEME.brand, color: THEME.brand, boxShadow: '0 0 0 2px rgba(54,101,107,0.08)' }
                                    : { borderColor: '#E7ECE7', color: THEME.textMuted }
                                }
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 pt-4" style={{ borderTop: '1px solid #E7ECE7' }}>
                <button
                    onClick={handleNext}
                    disabled={selectedOptionIndex === null}
                    className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all
                        ${selectedOptionIndex !== null
                            ? 'text-white shadow-lg active:scale-95'
                            : 'cursor-not-allowed'
                        }
                    `}
                    style={selectedOptionIndex !== null
                        ? { background: THEME.brand }
                        : { background: '#DDE6DD', color: '#94A394' }
                    }
                >
                    {isLastQuestion ? "Finish Quiz" : "Next Question"}
                </button>
            </div>
        </div>
    );
}

export default MultiChoiceQuiz
