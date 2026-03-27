import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router';
import MultiChoiceQuiz from '../components/activities/MultiChoiceQuiz';
import { getActivityByPosition, getActivityProgress } from '../api/userActivity';
import CardData from '../data/CardData';
import { HiMiniTrophy } from "react-icons/hi2";

const ActivityContainer = () => {
    const { sdgId, activityId } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [alreadyPerfect, setAlreadyPerfect] = useState(false);
    const [forceRetake, setForceRetake] = useState(false);

    // resolvedActivityId holds the real DB primary key once the activity is fetched
    const [resolvedActivityId, setResolvedActivityId] = useState(null);

    useEffect(() => {
        if (!sdgId || !activityId) {
            setNotFound(true);
            setLoading(false);
            return;
        }
        // Step 1: fetch the activity by SDG + position (button number)
        getActivityByPosition(Number(sdgId), Number(activityId))
            .then((activity) => {
                const dbActivityId = activity.activity_id;
                setResolvedActivityId(dbActivityId);

                const content = activity.activity_content;
                setQuizData({
                    title: content.title,
                    questions: content.questions.map((q) => ({
                        questionText: q.question_text,
                        options: q.options,
                        correctOptionIndex: q.correct_option_index,
                    }))
                });

                // Step 2: fetch progress using the real DB activity_id
                return getActivityProgress(dbActivityId);
            })
            .then((progress) => {
                if (progress?.grade === '100%' && progress?.activity_status === 'completed') {
                    setAlreadyPerfect(true);
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [sdgId, activityId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (notFound || !quizData) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                <h2 className="text-xl font-semibold text-gray-700">This content cannot be found</h2>
                <p className="text-sm text-gray-400">The activity may have been removed or the link is invalid.</p>
                <button
                    onClick={() => navigate(`/activities/${sdgId}`)}
                    className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Back to Activities
                </button>
            </div>
        );
    }

    const sdgColour = CardData[Number(sdgId) - 1]?.colour ?? '#2563eb';

    if (alreadyPerfect && !forceRetake) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 max-w-md mx-auto">
                <HiMiniTrophy className='text-[5em]' style={{ color: sdgColour }} />
                <h2 className="text-2xl font-bold text-gray-800">You already aced this!</h2>
                <p className="text-gray-500 text-sm">
                    You previously scored <span className="font-semibold text-green-600">100%</span> on this quiz.
                    Retaking it won't affect your score.
                </p>
                <button
                    onClick={() => setForceRetake(true)}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Retake Anyway
                </button>
                <button
                    onClick={() => navigate(`/activities/${sdgId}`)}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-white border border-gray-200 text-gray-600 hover:border-gray-300 active:scale-95 transition-all"
                >
                    Back to Activities
                </button>
            </div>
        );
    }

    return (
        <MultiChoiceQuiz
            data={quizData}
            activityId={resolvedActivityId}
            onBack={() => navigate(`/activities/${sdgId}`)}
        />
    );
}

export default ActivityContainer
