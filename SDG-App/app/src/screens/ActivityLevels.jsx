import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { MdQuiz, MdForum, MdMenuBook } from "react-icons/md";
import CardData from "../data/CardData";
import { getActivityByPosition, getActivityProgress } from "../api/userActivity";

const ITEMS_PER_PAGE = 5;

const typeConfig = {
  activity: { Icon: MdQuiz, label: "Quiz" },
  discussion: { Icon: MdForum, label: "Discussion" },
  learning: { Icon: MdMenuBook, label: "Reading" },
};

export const ActivityLevels = () => {
  const { sdgId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [statuses, setStatuses] = useState({});

  // Swipe detection
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return; // ignore taps
    setPage((p) => {
      if (delta > 0) return Math.min(p + 1, totalPages - 1); // swipe left → next
      return Math.max(p - 1, 0);                              // swipe right → prev
    });
    touchStartX.current = null;
  };

  const data = sdgId ? CardData[Number(sdgId) - 1] : null;

  // Fallback to 16 generic activities for SDGs that don't have a learningPath yet
  const learningPath =
    data?.learningPath ??
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      type: "activity",
      title: `Activity ${i + 1}`,
    }));

  // Fetch progress for every activity in parallel — errors are swallowed so
  // activities that aren't in the DB yet just show as "not started"
  useEffect(() => {
    if (!sdgId || !learningPath.length) return;

    Promise.all(
      learningPath.map((item) =>
        getActivityByPosition(Number(sdgId), item.id)
          .then((activity) =>
            getActivityProgress(activity.activity_id).then((progress) => ({
              position: item.id,
              progress,
            }))
          )
          .catch(() => ({ position: item.id, progress: null }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ position, progress }) => {
        if (!progress) {
          map[position] = { status: "not_started" };
          return;
        }
        const saved = progress.user_activity_data;
        map[position] = {
          status: progress.activity_status,
          grade: progress.grade,
          // currentQuestionIndex is 0-based in storage; display as 1-based
          currentQ:
            saved?.currentQuestionIndex != null
              ? saved.currentQuestionIndex + 1
              : null,
          totalQ: saved?.shuffledQuestionIds?.length ?? null,
        };
      });
      setStatuses(map);
    });
    // learningPath is derived from static CardData, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdgId]);

  // Early return AFTER all hooks
  if (!data) {
    return (
      <div className="flex w-full h-full items-center justify-center p-5">
        <p className="text-gray-500 font-medium">
          Activity data not found for SDG {sdgId}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(learningPath.length / ITEMS_PER_PAGE);
  const pageItems = learningPath.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <button
          onClick={() => navigate("/activities")}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-3 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Activities
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: data.colour }}
          >
            {sdgId}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">
              {data.title}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {learningPath.length} activities
            </p>
          </div>
        </div>
      </div>

      {/* ── Activity cards ── */}
      <div className="flex-1 overflow-hidden px-4 pt-4 pb-2 flex flex-col gap-3">
        {pageItems.map((item) => {
          const cfg = typeConfig[item.type] ?? typeConfig.activity;
          const Icon = cfg.Icon;
          const s = statuses[item.id];

          return (
            <button
              key={item.id}
              onClick={() => navigate(`/activities/${sdgId}/${item.id}`)}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm active:scale-[0.98] transition-all text-left"
            >
              {/* Tinted icon box */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              // style={{ backgroundColor: data.colour + "22" }}
              >
                <Icon className="text-[2em]" style={{ color: data.colour }} />
              </div>

              {/* Text block */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
                  style={{ color: data.colour }}
                >
                  {item.id} · {cfg.label}
                </p>
                <p className="font-semibold text-gray-800 text-sm leading-snug truncate">
                  {item.title}
                </p>

                {/* In progress indicator */}
                {s?.status === "in_progress" && (
                  <p className="text-xs text-blue-500 mt-0.5">In progress</p>
                )}

                {/* Completion line */}
                {/* {s?.status === "completed" && (
                  <p className="text-xs text-green-600 mt-0.5 font-medium">
                    Completed · {s.grade}
                  </p>
                )} */}
              </div>

              {/* Right-side badge */}
              <div className="shrink-0 flex items-center">
                {s?.status === "completed" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    style={{ color: data.colour }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Dot pagination ── */}
      {
        totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === page ? 24 : 10,
                  height: 10,
                  backgroundColor: i === page ? data.colour : "#D1D5DB",
                }}
              />
            ))}
          </div>
        )
      }

    </div >
  );
};


/* ─────────────────────────────────────────────────────────────────
   ORIGINAL IMPLEMENTATION (kept for reference)
   ─────────────────────────────────────────────────────────────────

import React from "react";
import { useParams } from "react-router";
import { ActivityButton } from "../components/ActivityButton";
import CardData from "../data/CardData";

export const ActivityLevels = () => {
  const { sdgId } = useParams();

  const data = sdgId ? CardData[sdgId - 1] : null;

  if (!data) {
    return (
      <div className="flex w-full h-full items-center justify-center p-5">
        <p className="text-gray-500 font-medium">Activity data not found for SDG {sdgId}</p>
      </div>
    );
  }

  let levels;
  if (data.learningPath) {
    levels = data.learningPath.map((item) => (
      <ActivityButton
        key={item.id}
        num={item.id}
        colour={data.colour}
        type={item.type}
        title={item.title}
        sdgId={sdgId}
      />
    ));
  } else {
    levels = [];
    for (let i = 1; i < 17; i++) {
      levels.push(<ActivityButton key={i} num={i} colour={data.colour} sdgId={sdgId} />);
    }
  }

  console.log("id", sdgId);
  return (
    <div className="flex flex-1 items-center flex-col mt-5">
      <h1 className="self-start text-[30px] font-bold px-8 mb-10">
        {sdgId}: {data.title}
      </h1>
      <div className="grid gap-5 grid-cols-4 px-8 justify-items-center place-items-center align-middle rounded-t-3xl pb-20">
        {levels}
      </div>
    </div>
  );
};

───────────────────────────────────────────────────────────────── */