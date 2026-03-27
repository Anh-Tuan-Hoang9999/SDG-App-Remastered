import client from './client';

/** Fetch a single activity by its DB primary key. */
export async function getActivity(activityId) {
    const res = await client.get(`/activities/${activityId}`);
    return res.data;
}

/**
 * Fetch the Nth activity (1-based position) for a given SDG card.
 * This is how the frontend addresses activities — by SDG + button number,
 * NOT by the global DB activity_id primary key.
 */
export async function getActivityByPosition(sdgCardId, position) {
    const res = await client.get(`/activities/sdg/${sdgCardId}/${position}`);
    return res.data;
}

/**
 * Get the current user's most recent attempt for a given activity.
 * Returns null if the user has no attempts yet.
 */
export async function getActivityProgress(activityId) {
    const res = await client.get(`/user-activity/activity/${activityId}`);
    return res.data;
}

/** Start a new attempt or resume an existing in-progress one. */
export async function startOrResumeActivity(activityId) {
    const res = await client.post('/user-activity/start', { activity_id: activityId });
    return res.data;
}

/** Auto-save in-progress answers. Call this every time the user selects an answer. */
export async function saveActivityProgress(userActivityId, userActivityData) {
    const res = await client.patch(`/user-activity/${userActivityId}`, {
        user_activity_data: userActivityData,
    });
    return res.data;
}

/** Mark the activity as complete and record the final grade (e.g. "80%"). */
export async function completeActivity(userActivityId, grade, userActivityData) {
    const res = await client.patch(`/user-activity/${userActivityId}/complete`, {
        grade,
        user_activity_data: userActivityData,
    });
    return res.data;
}
