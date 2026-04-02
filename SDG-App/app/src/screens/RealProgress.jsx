import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Shuffle,
  FileText,
  Library,
  TrendingUp,
  ChevronRight,
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
    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${safeValue}%` }}
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
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Progress Tracker</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Frontend mock progress only. This screen does not use backend data.
      </p>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading mock progress...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{completedActivities.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">of {ACTIVITIES.length} Tasks</div>
              <div className="text-xs font-medium text-foreground mt-0.5">Completed</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-chart-2">{progressPct}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Completion</div>
              <div className="text-xs font-medium text-foreground mt-0.5">Rate</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-chart-3">{totalPoints}</div>
              <div className="text-xs text-muted-foreground mt-0.5">of {maxPoints} pts</div>
              <div className="text-xs font-medium text-foreground mt-0.5">Earned</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-foreground mb-4">Overall Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Activities Completed</span>
                  <span className="font-medium">{completedActivities.length}/{ACTIVITIES.length}</span>
                </div>
                <ProgressBar value={progressPct} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Points Earned</span>
                  <span className="font-medium">{totalPoints}/{maxPoints} pts</span>
                </div>
                <ProgressBar value={pointsPct} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-foreground mb-1">Activity Checklist</h2>
            {ACTIVITIES.map((activity) => {
              const done = isComplete(activity);
              const Icon = activity.icon;
              return (
                <div
                  key={activity.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    done
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <div className={`flex-shrink-0 ${done ? "text-primary" : "text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </div>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      done ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${done ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{activity.title}</span>
                      <Badge variant={done ? "default" : "secondary"} className="text-xs">
                        {activity.points} pts
                      </Badge>
                      {done && (
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Done</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.desc}</p>
                  </div>
                  {!done && (
                    <Link to={activity.path}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md hover:bg-muted"
                      >
                        Go <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {progressPct === 100 && (
            <div className="mt-6 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">All done</div>
              <h3 className="font-display font-bold text-lg">All Activities Complete!</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">
                You earned all {maxPoints} points in this mock progress tracker.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
