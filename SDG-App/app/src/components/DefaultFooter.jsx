import React from 'react'
import { NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { IoBookOutline, IoBook } from 'react-icons/io5'
import { MdOutlineCheckCircle, MdCheckCircle } from 'react-icons/md'
import { RiHistoryFill } from "react-icons/ri";

const DefaultFooter = () => {
  const links = [
    {
      path: '/learning',
      label: 'Learning',
      icon: IoBookOutline,
      activeIcon: IoBook
    },
    {
      path: '/activities',
      label: 'Activities',
      icon: MdOutlineCheckCircle,
      activeIcon: MdCheckCircle
    },
    {
      path: '/progress',
      label: 'Progress',
      icon: RiHistoryFill,
      activeIcon: RiHistoryFill
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-2 bg-transparent pointer-events-none">
      <nav className="mx-auto bg-white rounded-2xl shadow-lg pointer-events-auto" style={{ boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex justify-around items-center px-2 py-3">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="relative flex-1"
            >
              {({ isActive }) => {
                const Icon = isActive ? link.activeIcon : link.icon;
                return (
                  <div className="relative flex flex-col items-center justify-center py-2 px-4">
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: '#E8F5E9' }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 text-2xl mb-1 transition-colors ${isActive ? 'text-[#2E7D32]' : 'text-gray-500'
                        }`}
                    />
                    <span
                      className={`relative z-10 text-xs font-semibold transition-colors ${isActive ? 'text-[#2E7D32]' : 'text-gray-500'
                        }`}
                    >
                      {link.label}
                    </span>
                  </div>
                );
              }}
            </NavLink>
          ))}
        </div>
      </nav>
    </footer>
  )
}

export default DefaultFooter