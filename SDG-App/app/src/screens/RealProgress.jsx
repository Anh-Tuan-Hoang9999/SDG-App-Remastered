import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle2, Circle, BookOpen, Shuffle, FileText,
  Library, TrendingUp, ChevronRight, AlertCircle,
} from "lucide-react";
import { useAuth } from "../authContext";
import client from "../api/client";

const PROGRESS_BLUE = "#63C7E8";
const PROGRESS_GOLD = "#F2D36B";

const ACTIVITIES = [
  {
    key: "viewed_sdg_cards",
    title: "Explore SDG Cards",
    desc: "View all 17 United Nations Sustainable Development Goals",
    icon: BookOpen,
    path: "/sdg-cards",
    points: 20,
  },
  {
    key: "completed_card_sort",
    title: "Complete Card Sort Activity",
    desc: "Sort all 17 SDG cards by relevance to your co-op placement",
    icon: Shuffle,
    path: "/card-sort",
    points: 30,
  },
  {
    key: "reflection_count",
    title: "Submit a Reflection",
    desc: "Log at least one reflection entry documenting your SDG connection",
    icon: FileText,
    path: "/reflection-log",
    points: 25,
    threshold: 1,
  },
  {
    key: "reflection_count_3",
    title: "Submit 3 Reflections",
    desc: "Log three or more reflection entries",
    icon: FileText,
    path: "/reflection-log",
    points: 15,
    threshold: 3,
  },
  {
    key: "viewed_resources",
    title: "Explore Resources",
    desc: "Visit the SDG learning resources and student portal links",
    icon: Library,
    path: "/resources",
    points: 10,
  },
];

/**
 * Returns true if the backend progress record counts `activity` as done.
 *
 * Rules:
 *  - reflection_count / reflection_count_3  → compare count to threshold
 *  - viewed_sdg_cards / viewed_resources    → any non-empty array means visited
 *  - everything else (booleans)             → truthy check
 */
function isComplete(activity, progress) {
  if (!progress) return false;
  if (activity.key === "reflection_count")
    return (progress.reflection_count || 0) >= 1;
  if (activity.key === "reflection_count_3")
    return (progress.reflection_count || 0) >= 3;
  if (activity.key === "viewed_sdg_cards")
    return Array.isArray(progress.viewed_sdg_cards) && progress.viewed_sdg_cards.length > 0;
  if (activity.key === "viewed_resources")
    return Array.isArray(progress.viewed_resources) && progress.viewed_resources.length > 0;
  return !!progress[activity.key];
}

function ProgressBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--app-muted)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${safeValue}%`, background: PROGRESS_BLUE }}
      />
    </div>
  );
}

export default function RealProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    client
      .get(`/api/progress/${user.id}`)
      .then((res) => setProgress(res.data))
      .catch(() => setError("Could not load your progress. Please try again."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const completedActivities = useMemo(
    () => ACTIVITIES.filter((a) => isComplete(a, progress)),
    [progress],
  );

  const totalPoints  = completedActivities.reduce((sum, a) => sum + a.points, 0);
  const maxPoints    = ACTIVITIES.reduce((sum, a) => sum + a.points, 0);
  const progressPct  = Math.round((completedActivities.length / ACTIVITIES.length) * 100);
  const pointsPct    = Math.round((totalPoints / maxPoints) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ── */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--app-muted)' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: '#4A8A70' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text1)' }}>Progress Tracker</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--app-text2)' }}>
        Your real-time completion status across all core co-op learning activities.
      </p>

      {/* ── Loading spinner ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: '#36656B' }}
          />
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-xl text-sm"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Main content — only shown after a successful load ── */}
      {!loading && !error && progress && (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: completedActivities.length, sub: `of ${ACTIVITIES.length} Tasks`, label: "Completed", color: PROGRESS_BLUE },
              { value: `${progressPct}%`,           sub: "Completion",                   label: "Rate",       color: PROGRESS_BLUE },
              { value: totalPoints,                 sub: `of ${maxPoints} pts`,          label: "Earned",     color: PROGRESS_GOLD },
            ].map(({ value, sub, label, color }) => (
              <div
                key={label}
                className="rounded-2xl p-4 text-center"
                style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-card)' }}
              >
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--app-text3)' }}>{sub}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--app-text1)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Overall progress bars ── */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', boxShadow: 'var(--app-shadow-card)' }}
          >
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--app-text1)' }}>Overall Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--app-text2)' }}>Activities Completed</span>
                  <span className="font-semibold" style={{ color: 'var(--app-text1)' }}>
                    {completedActivities.length}/{ACTIVITIES.length}
                  </span>
                </div>
                <ProgressBar value={progressPct} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--app-text2)' }}>Points Earned</span>
                  <span className="font-semibold" style={{ color: 'var(--app-text1)' }}>
                    {totalPoints}/{maxPoints} pts
                  </span>
                </div>
                <ProgressBar value={pointsPct} />
              </div>
            </div>
          </div>

          {/* ── Activity checklist ── */}
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--app-text3)' }}>
            Activity Checklist
          </h2>
          <div className="space-y-3">
            {ACTIVITIES.map((activity) => {
              const done = isComplete(activity, progress);
              const Icon = activity.icon;
              return (
                <div
                  key={activity.key}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                  style={{
                    background: done ? 'rgba(74,138,112,0.10)' : 'var(--app-card)',
                    border: done ? '1px solid rgba(74,138,112,0.28)' : '1px solid var(--app-border)',
                    boxShadow: 'var(--app-shadow-card)',
                  }}
                >
                  {/* Check / circle icon */}
                  <div className="flex-shrink-0">
                    {done
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#36656B' }} />
                      : <Circle className="w-5 h-5" style={{ color: 'var(--app-border)' }} />
                    }
                  </div>

                  {/* Activity icon square */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? 'rgba(74,138,112,0.16)' : 'var(--app-muted)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: done ? '#5E9B7B' : 'var(--app-text2)' }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--app-text1)' }}>
                        {activity.title}
                      </span>
                      {/* Points pill */}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'color-mix(in srgb, var(--app-muted) 82%, var(--app-accent, #5EC88A) 18%)',
                          color: 'color-mix(in srgb, var(--app-text1) 70%, var(--app-accent, #5EC88A) 30%)',
                        }}
                      >
                        {activity.points} pts
                      </span>
                      {/* Done pill */}
                      {done && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'color-mix(in srgb, var(--app-muted) 70%, var(--app-accent, #5EC88A) 30%)',
                            color: 'var(--app-text1)',
                          }}
                        >
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--app-text2)' }}>{activity.desc}</p>
                  </div>

                  {/* Go button */}
                  {!done && (
                    <Link to={activity.path}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all active:scale-95"
                        style={{
                          background: 'color-mix(in srgb, var(--app-muted) 76%, var(--app-accent, #5EC88A) 24%)',
                          color: 'var(--app-text1)',
                          border: '1px solid color-mix(in srgb, var(--app-border) 72%, var(--app-accent, #5EC88A) 28%)',
                        }}
                      >
                        Go <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Completion banner ── */}
          {progressPct === 100 && (
            <div
              className="mt-6 rounded-2xl p-6 text-center"
              style={{ background: 'linear-gradient(135deg, #1A3B2E 0%, #36656B 100%)' }}
            >
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-white">All Activities Complete!</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                You earned all {maxPoints} points. Outstanding work!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
