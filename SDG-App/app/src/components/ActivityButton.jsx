import React from "react";
import { useNavigate } from "react-router";
import { MdQuiz, MdForum, MdMenuBook } from "react-icons/md";


export const ActivityButton = ({ num, colour, type = 'default', title, sdgId }) => {

  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case 'activity': return <MdQuiz className="text-4xl text-white/90" />;
      case 'discussion': return <MdForum className="text-4xl text-white/90" />;
      case 'learning': return <MdMenuBook className="text-4xl text-white/90" />;
      default: return <span className="text-3xl font-bold">{num}</span>;
    }
  };

  // Added delay to navigation to let click animation play out
  const handleClick = () => {
    setTimeout(() => {
      navigate(`/activities/${sdgId}/${num}`);
    }, 150);
  }

  //TODO Add links to the actual activities
  return (
    <button
      style={{ backgroundColor: colour }}
      className="flex relative justify-center items-center w-20 h-20 rounded-xl bg-blue-400 text-white shadow-lg transform transition active:scale-95"
      title={title || `Activity ${num}`}
      onClick={handleClick}
    >
      {type !== 'default' && (
        <span className="absolute top-1 left-2 text-xs font-bold opacity-70">{num}</span>
      )}
      {getIcon()}
    </button>
  );
};
