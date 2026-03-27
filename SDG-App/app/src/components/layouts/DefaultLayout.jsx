import React from "react";
import { Outlet } from "react-router";

// Components
import DefaultFooter from "../DefaultFooter";
import DefaultTopNav from "../DefaultTopNav";

export default function DefaultLayout() {
  // Adjust these to your actual heights
  const TOP_NAV_H = '88px';   // e.g., 4rem
  const FOOTER_H = '100px';    // Updated for new footer design

  return (
    // Prevent page scroll; only inner content scrolls
    <div className="relative flex flex-col w-full h-screen overflow-hidden">
      <DefaultTopNav />
      {/* Constrain the main area to viewport minus nav and footer */}
      <main
        className={`relative w-full overflow-hidden`}
        style={{ height: `calc(100vh - ${TOP_NAV_H} - ${FOOTER_H})` }}
      >
        {/* Allow children to shrink and scroll internally */}
        <div className="flex flex-col w-full h-full min-h-0">
          <Outlet />
        </div>
      </main>
      <DefaultFooter />
    </div>
  );
}