
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

      // Header: title then stats row cascade down
      tl.from(".anim-title", { y: -24, opacity: 0, duration: 0.45 })
        .from(".anim-stats", { y: -16, opacity: 0, duration: 0.4 }, "-=0.25")
        // Card section slides up like a bottom sheet
        .from(".anim-section", { y: 50, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.2")
        // Cards stagger in from slightly below
        .from(".anim-card", {
          y: 32,
          opacity: 0,
          duration: 0.4,
          stagger: 0.07,
          ease: "power2.out",
        }, "-=0.3");
    }, containerRef);

    return () => {
      tl?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex flex-col gap-2 my-3 mx-5 rounded-2xl">
          <h1 className="anim-title font-bold text-[26px]">Test Your Knowledge</h1>
          <div className="anim-stats flex gap-3 w-full">
            {/* Implement with progress tracking */}
            <div className="bg-white rounded-2xl shadow-sm flex-1 py-3 px-4 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-800 leading-tight">0/17</span>
              <span className="text-xs text-gray-500 font-medium">Completed</span>
            </div>
            {/* Should open to a progress viewing page */}
            <button
              className="bg-white flex-1 py-3 px-4 rounded-2xl text-sm font-semibold text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              onClick={() => navigate('/progress')}
            >
              View Progress
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        {/* min-h-0 is crucial for nested flex scrolling */}
        <section className="anim-section w-full flex-1 rounded-t-3xl overflow-y-scroll p-5  min-h-0 drop-shadow-2xl7">
          <div className="space-y-4">
            {/* MAP CARDS */}
            {
              CardData.map((card, index) => (
                <div key={index} className="anim-card">
                  <ActivityLinkCard {...card} />
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </>
  );
};

export default Activities;
