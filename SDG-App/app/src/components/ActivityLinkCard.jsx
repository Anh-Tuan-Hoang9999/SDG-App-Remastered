import React from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";

const ActivityLinkCard = (props) => {
  return (
    <Link
      to={`${props.id}`}
      className="group flex items-center bg-white rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
      style={{
        border: '1px solid #EEF2EE',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        textDecoration: 'none',
      }}
    >
      {/* Left SDG colour accent strip */}
      <div
        className="w-1 self-stretch flex-shrink-0"
        style={{ background: props.colour }}
      />

      {/* SDG number badge */}
      <div
        className="w-11 h-11 m-3 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm leading-none"
        style={{ background: props.colour }}
      >
        {props.id}
      </div>

      {/* Title + desc */}
      <div className="flex-1 min-w-0 py-3 pr-2">
        <h2 className="font-semibold text-sm leading-snug truncate" style={{ color: '#1A2E1A' }}>
          {props.title}
        </h2>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#637063' }}>
          {props.desc || 'SDG Learning Activity'}
        </p>
      </div>

      {/* Progress pill + arrow */}
      <div className="flex items-center gap-3 pr-4 flex-shrink-0">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-lg"
          style={{
            background: `${props.colour}22`,
            color: props.colour,
          }}
        >
          0/10
        </span>
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          style={{ color: '#36656B' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

ActivityLinkCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
};

export default ActivityLinkCard;
