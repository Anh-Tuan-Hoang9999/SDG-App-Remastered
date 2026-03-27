import React from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import { ImArrowRight2 } from "react-icons/im";

const ActivityLinkCard = (props) => {

  // Function to darken a hex color
  const darkenColor = (color, percent = 20) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const darkerColor = darkenColor(props.colour);

  // Function to lighten a hex color
  const lightenColor = (color, percent = 40) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R : 255) * 0x10000 +
      (G < 255 ? G : 255) * 0x100 +
      (B < 255 ? B : 255))
      .toString(16).slice(1);
  };

  const lighterColor = lightenColor(props.colour);

  return (
    <>
      <div
        className="h-[5em] p-2 rounded-xl flex gap-x-3 shadow-sm"
        style={{ backgroundColor: props.colour }}
      >
        <section className="flex flex-1 justify-between col-start-1 row-start-1 min-w-0 overflow-hidden">
          <h1
            className="font-medium text-[1.25em] text-white self-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
            title={props.title}
          >
            <span className="pr-2">{props.id}</span>
            {props.title}
          </h1>
        </section>

        <div
          className="col-start-1 row-start-2 text-[12px] font-medium self-center w-fit px-2 py-1 rounded-2xl"
          style={{ backgroundColor: darkerColor, color: "#FFF" }}>
          {/* DEV-NOTE: Replace with actual logic once activities are being saved and stored in db */}
          0/10
        </div>

        <Link className="text-[22px] pr-2 col-start-2 row-span-2 flex items-center" style={{ color: lighterColor }} to={`${props.id}`}>
          <ImArrowRight2 />
        </Link>

      </div>
    </>
  );
};

ActivityLinkCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
};

export default ActivityLinkCard;
