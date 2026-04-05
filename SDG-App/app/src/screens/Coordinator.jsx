import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import {
  Users,
  Shield,
  CheckCircle2,
  Circle,
  FileText,
  Shuffle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function ActivityDot({ done }) {
  return done
    ? <CheckCircle2 className="w-4 h-4" style={{ color: "#2F7D50" }} />
    : <Circle className="w-4 h-4" style={{ color: "#9BAA9B" }} />;
}

function StudentRow({ student, reflections }) {
  const [expanded, setExpanded] = useState(false);

  const activityChecks = [
    !!student.completed_card_sort,
    !!student.completed_quiz,
    (student.reflection_count ?? 0) > 0,
  ];
  const done = activityChecks.filter(Boolean).length;
  const pct = Math.round((done / activityChecks.length) * 100);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #DDE6DD", background: "#fff" }}
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: "#36656B" }}
        >
          {student.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "#1A2E1A" }}>{student.name}</p>
          <p className="text-xs truncate" style={{ color: "#637063" }}>{student.email}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <ActivityDot done={!!student.completed_card_sort} />
          <ActivityDot done={!!student.completed_quiz} />
          <ActivityDot done={(student.reflection_count ?? 0) > 0} />
        </div>

        <div className="hidden md:block text-right min-w-[56px]">
          <p className="text-xs" style={{ color: "#637063" }}>{pct}%</p>
          <p className="text-[11px]" style={{ color: "#9BAA9B" }}>{done}/3</p>
        </div>

        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "#637063" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#637063" }} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid #EEF2EE", background: "#FAFCFA" }}>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9BAA9B" }}>
                Activity Status
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm" style={{ color: "#1A2E1A" }}>
                  <ActivityDot done={!!student.completed_card_sort} />
                  Completed Card Sort
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#1A2E1A" }}>
                  <ActivityDot done={!!student.completed_quiz} />
                  Completed Quiz
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#1A2E1A" }}>
                  <ActivityDot done={(student.reflection_count ?? 0) > 0} />
                  Submitted Reflection
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9BAA9B" }}>
                Reflection Summary
              </p>
              <p className="text-2xl font-bold" style={{ color: "#36656B" }}>{student.reflection_count ?? 0}</p>
              <p className="text-xs" style={{ color: "#637063" }}>entries submitted</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9BAA9B" }}>
              Recent Reflections
            </p>

            {reflections.length === 0 && (
              <p className="text-sm" style={{ color: "#637063" }}>No reflections yet.</p>
            )}

            <div className="space-y-2">
              {reflections.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg px-3 py-2"
                  style={{ border: "1px solid #E8EFE8", background: "#fff" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#1A2E1A" }}>{r.title}</p>
                  <p className="text-xs" style={{ color: "#637063" }}>
                    {r.type ? r.type.replace("_", " ") : "general"}
                    {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Coordinator() {
  const [students, setStudents] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      client.get("/api/coordinator/students"),
      client.get("/api/coordinator/reflections"),
    ])
      .then(([studentsRes, reflectionsRes]) => {
        if (!isMounted) return;
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setReflections(Array.isArray(reflectionsRes.data) ? reflectionsRes.data : []);
      })
      .catch((e) => {
        if (!isMounted) return;
        if (e?.response?.status === 403) {
          setError("Coordinator access required.");
        } else {
          setError("Unable to load coordinator data.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const reflectionsByUser = useMemo(() => {
    const map = new Map();
    reflections.forEach((r) => {
      const list = map.get(r.user_id) ?? [];
      list.push(r);
      map.set(r.user_id, list);
    });
    return map;
  }, [reflections]);

  const totalStudents = students.length;
  const completedAll = students.filter((s) =>
    !!s.completed_card_sort && !!s.completed_quiz && (s.reflection_count ?? 0) > 0
  ).length;
  const totalReflections = students.reduce((sum, s) => sum + (s.reflection_count ?? 0), 0);
  const avgReflections = totalStudents > 0 ? (totalReflections / totalStudents).toFixed(1) : "0.0";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: "#36656B" }} />
          <h1 className="text-2xl font-bold" style={{ color: "#1A2E1A" }}>Coordinator View</h1>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5"
          style={{ background: "#FFF6DB", color: "#8A6A1B", border: "1px solid #F3E5B8" }}
        >
          <Shield className="w-3.5 h-3.5" />
          Coordinators Only
        </span>
      </div>

      <p className="text-sm mb-5" style={{ color: "#637063" }}>
        Live data from database. Showing all student accounts.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Students", value: totalStudents, icon: Users },
          { label: "Completed All", value: completedAll, icon: CheckCircle2 },
          { label: "Reflections", value: totalReflections, icon: FileText },
          { label: "Avg / Student", value: avgReflections, icon: BookOpen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #DDE6DD" }}>
            <Icon className="w-5 h-5 mb-2" style={{ color: "#36656B" }} />
            <p className="text-xl font-bold" style={{ color: "#1A2E1A" }}>{value}</p>
            <p className="text-xs" style={{ color: "#637063" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: "#637063" }}>
        <span className="font-semibold" style={{ color: "#1A2E1A" }}>Legend:</span>
        <span className="inline-flex items-center gap-1"><Shuffle className="w-3.5 h-3.5" /> Card Sort</span>
        <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Quiz</span>
        <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Reflection</span>
      </div>

      {loading && (
        <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #DDE6DD" }}>
          <p className="text-sm" style={{ color: "#637063" }}>Loading coordinator data...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl p-5" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
          {error}
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #DDE6DD" }}>
          <p className="text-sm" style={{ color: "#637063" }}>No student accounts found.</p>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <div className="space-y-2">
          {students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              reflections={reflectionsByUser.get(student.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
