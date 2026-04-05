import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2, Circle, BookOpen, Shuffle, FileText,
  Library, TrendingUp, ChevronRight, Info,
} from "lucide-react";

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

const MOCK_PROGRESS = {
  viewed_sdg_cards: true,
  completed_card_sort: false,
  reflection_count: 2,
  viewed_resources: true,
};

function ProgressBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EEF2EE' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${safeValue}%`, background: '#36656B' }}
      />
    </div>
  );
}

export default function RealProgress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(MOCK_PROGRESS);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const isComplete = (activity) => {
    if (!progress) return false;
    if (activity.key === "reflection_count") return (progress.reflection_count || 0) >= 1;
    if (activity.key === "reflection_count_3") return (progress.reflection_count || 0) >= 3;
    return !!progress[activity.key];
  };

  const completedActivities = useMemo(
    () => ACTIVITIES.filter((a) => isComplete(a)),
    [progress]
  );

  const totalPoints = completedActivities.reduce((sum, a) => sum + a.points, 0);
  const maxPoints = ACTIVITIES.reduce((sum, a) => sum + a.points, 0);
  const progressPct = Math.round((completedActivities.length / ACTIVITIES.length) * 100);
  const pointsPct = Math.round((totalPoints / maxPoints) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ── */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#EEF2EE' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: '#36656B' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#1A2E1A' }}>Progress Tracker</h1>
      </div>
      <p className="text-sm mb-5" style={{ color: '#637063' }}>
        Frontend mock progress only — no backend data is used.
      </p>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs mb-6"
        style={{ background: 'rgba(54,101,107,0.08)', border: '1px solid rgba(54,101,107,0.18)', color: '#36656B' }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Mock only:</strong> Progress is simulated from local state and does not persist between sessions.
        </span>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: '#637063' }}>Loading mock progress…</p>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: completedActivities.length, sub: `of ${ACTIVITIES.length} Tasks`, label: "Completed", color: '#36656B' },
              { value: `${progressPct}%`,           sub: "Completion",                   label: "Rate",       color: '#36656B' },
              { value: totalPoints,                  sub: `of ${maxPoints} pts`,          label: "Earned",     color: '#C8A951' },
            ].map(({ value, sub, label, color }) => (
              <div
                key={label}
                className="rounded-2xl p-4 text-center"
                style={{ background: '#fff', border: '1px solid #DDE6DD', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9BAA9B' }}>{sub}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: '#1A2E1A' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Overall progress bars ── */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: '#fff', border: '1px solid #DDE6DD', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-sm font-bold mb-4" style={{ color: '#1A2E1A' }}>Overall Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#637063' }}>Activities Completed</span>
                  <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                    {completedActivities.length}/{ACTIVITIES.length}
                  </span>
                </div>
                <ProgressBar value={progressPct} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#637063' }}>Points Earned</span>
                  <span className="font-semibold" style={{ color: '#1A2E1A' }}>
                    {totalPoints}/{maxPoints} pts
                  </span>
                </div>
                <ProgressBar value={pointsPct} />
              </div>
            </div>
          </div>

          {/* ── Activity checklist ── */}
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9BAA9B' }}>
            Activity Checklist
          </h2>
          <div className="space-y-3">
            {ACTIVITIES.map((activity) => {
              const done = isComplete(activity);
              const Icon = activity.icon;
              return (
                <div
                  key={activity.key}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                  style={{
                    background: done ? 'rgba(54,101,107,0.05)' : '#fff',
                    border: done ? '1px solid rgba(54,101,107,0.25)' : '1px solid #DDE6DD',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Check / circle icon */}
                  <div className="flex-shrink-0">
                    {done
                      ? <CheckCircle2 className="w-5 h-5" style={{ color: '#36656B' }} />
                      : <Circle className="w-5 h-5" style={{ color: '#DDE6DD' }} />
                    }
                  </div>

                  {/* Activity icon square */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? 'rgba(54,101,107,0.12)' : '#EEF2EE' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: done ? '#36656B' : '#637063' }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: '#1A2E1A' }}>
                        {activity.title}
                      </span>
                      {/* Points pill */}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#EEF2EE', color: '#36656B' }}
                      >
                        {activity.points} pts
                      </span>
                      {/* Done pill */}
                      {done && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(54,101,107,0.12)', color: '#36656B' }}
                        >
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#637063' }}>{activity.desc}</p>
                  </div>

                  {/* Go button */}
                  {!done && (
                    <Link to={activity.path}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all active:scale-95"
                        style={{ background: '#EEF2EE', color: '#36656B', border: '1px solid #DDE6DD' }}
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
