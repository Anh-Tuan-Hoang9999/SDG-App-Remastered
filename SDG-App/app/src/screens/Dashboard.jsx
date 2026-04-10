import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,CreditCard, Shuffle, BookOpen, BarChart3, Library, Users, ArrowRight, Leaf,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../authContext";
import client from "../api/client";

const SDG_COLOURS = [
  "#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2",
  "#FCC30B","#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E",
  "#3F7E44","#0A97D9","#56C02B","#00689D","#19486A",
];

const sections = [
  { path: "/sdg-cards",      label: "SDG Digital Cards",    desc: "Explore all 17 Sustainable Development Goals",         icon: CreditCard },
  { path: "/card-sort",      label: "Card Sort Activity",   desc: "Sort SDGs by relevance to your co-op experience",      icon: Shuffle    },
  { path: "/reflection-log", label: "Reflection Logs",      desc: "Document your sustainability reflections",              icon: BookOpen   },
  { path: "/progress",       label: "Progress Tracker",     desc: "View your activity completion status",                  icon: BarChart3  },
  { path: "/resources",      label: "Resources",            desc: "Access SDG learning materials and links",               icon: Library    },
  { path: "/coordinator",    label: "Coordinator View",     desc: "View student progress summaries",                       icon: Users      },
];

const CORE_ACTIVITIES = [
  { key: "viewed_sdg_cards" },
  { key: "completed_card_sort" },
  { key: "reflection_count", threshold: 1 },
  { key: "reflection_count", threshold: 3 },
  { key: "viewed_resources" },
];

function isCoreComplete(activity, progress) {
  if (!progress) return false;
  if (activity.key === "reflection_count") {
    return (progress.reflection_count || 0) >= (activity.threshold || 1);
  }
  if (activity.key === "viewed_sdg_cards") {
    return Array.isArray(progress.viewed_sdg_cards) && progress.viewed_sdg_cards.length > 0;
  }
  if (activity.key === "viewed_resources") {
    return Array.isArray(progress.viewed_resources) && progress.viewed_resources.length > 0;
  }
  return !!progress[activity.key];
}

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.full_name || "Student";
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    client
      .get(`/api/progress/${user.id}`)
      .then((res) => setProgress(res.data))
      .catch(() => setProgress(null));
  }, [user?.id]);

  const completedCount = useMemo(
    () => CORE_ACTIVITIES.filter((a) => isCoreComplete(a, progress)).length,
    [progress]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, #1A3B2E 0%, #36656B 100%)',
          boxShadow: '0 4px 24px rgba(54,101,107,0.25)',
        }}
      >


        <div className="relative px-7 py-8 md:py-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              SDG Co-op Learning Portal
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-snug">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Continue your sustainability learning journey. You've completed{' '}
            <span className="font-bold text-white">{completedCount} of {CORE_ACTIVITIES.length}</span> core activities.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link to="/sdg-cards">
              <button
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: '#fff', color: '#36656B', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              >
                Explore SDGs
              </button>
            </Link>
            <Link to="/progress">
              <button
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                View Progress
              </button>
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute -right-4 bottom-4 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </motion.div>

      {/* ── Section heading ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9BAA9B' }}>
          Activities
        </h2>

        {/* ── Nav cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.path}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <Link to={section.path} className="block group">
                  <div
                    className="h-full bg-white rounded-2xl p-5 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5"
                    style={{ border: '1px solid #DDE6DD', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: '#EEF2EE' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#36656B' }} />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold leading-snug" style={{ color: '#1A2E1A' }}>
                        {section.label}
                      </h3>
                      <ArrowRight
                        className="w-4 h-4 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-1"
                        style={{ color: '#36656B' }}
                      />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#637063' }}>
                      {section.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
