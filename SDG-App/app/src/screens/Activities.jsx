import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import CardData from "../data/CardData";
import ActivityLinkCard from "../components/ActivityLinkCard";

const Activities = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    let tl;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".anim-title", { y: -24, opacity: 0, duration: 0.45 })
        .from(".anim-stats", { y: -16, opacity: 0, duration: 0.4 }, "-=0.25")
        .from(".anim-section", { y: 50, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.2")
        .from(".anim-card", {
          y: 32,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
        }, "-=0.3");
    }, containerRef);

    return () => {
      tl?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4">
        <div className="anim-title">
          <h1 className="font-bold text-[22px] leading-tight" style={{ color: '#1A2E1A' }}>
            Test Your Knowledge
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#637063' }}>
            Explore a quiz for each Sustainable Development Goal
          </p>
        </div>

        {/* Stats row */}
        <div className="anim-stats flex gap-3 w-full">
          <div
            className="flex-1 py-3 px-4 rounded-2xl flex flex-col items-center justify-center"
            style={{ background: '#fff', border: '1px solid #DDE6DD', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <span className="text-lg font-bold leading-tight" style={{ color: '#36656B' }}>0/17</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: '#637063' }}>Completed</span>
          </div>
          <button
            className="flex-1 py-3 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            style={{ background: '#36656B', color: '#fff', boxShadow: '0 2px 8px rgba(54,101,107,0.25)' }}
            onClick={() => navigate('/progress')}
          >
            View Progress
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Card list ── */}
      <section
        className="anim-section flex-1 rounded-t-3xl overflow-y-scroll min-h-0 px-5 pt-5 pb-6"
        style={{ background: '#F4F7F5' }}
      >
        <div className="space-y-3">
          {CardData.map((card, index) => (
            <div key={index} className="anim-card">
              <ActivityLinkCard {...card} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Activities;
