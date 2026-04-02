import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Shuffle,
  BookOpen,
  BarChart3,
  Library,
  Users,
  ArrowRight,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../authContext";

const sections = [
  {
    path: "/sdg-cards",
    label: "SDG Digital Cards",
    desc: "Explore all 17 Sustainable Development Goals",
    icon: CreditCard,
    color: "bg-[#E6F0F0] text-[#2E5A60]"
  },
  {
    path: "/card-sort",
    label: "Card Sort Activity",
    desc: "Sort SDGs by relevance to your co-op experience",
    icon: Shuffle,
    color: "bg-[#EAF2F2] text-[#36656B]"
  },
  {
    path: "/reflection-log",
    label: "Reflection Logs",
    desc: "Document your sustainability reflections",
    icon: BookOpen,
    color: "bg-[#E4ECEC] text-[#365B61]"
  },
  {
    path: "/progress",
    label: "Progress Tracker",
    desc: "View your activity completion status",
    icon: BarChart3,
    color: "bg-[#E8F1F1] text-[#2A5359]"
  },
  {
    path: "/resources",
    label: "Resources",
    desc: "Access SDG learning materials and links",
    icon: Library,
    color: "bg-[#EDF4F4] text-[#3D676D]"
  },
  {
    path: "/coordinator",
    label: "Coordinator View",
    desc: "View student progress summaries",
    icon: Users,
    color: "bg-[#E1ECEC] text-[#2E5A60]"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.full_name || "Student";
  const completedCount = 0; // Placeholder, since no backend

  return (
    <div className="space-y-8 text-[#24484D]">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EAF2F2] via-white to-[#F3F8F8] border border-[#D6E3E3] p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#DCEBEB] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#36656B]" />
            </div>
            <p className="text-sm text-[#5E767A] font-medium">SDG Co-op Learning Portal</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#24484D] mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-[#5E767A] max-w-lg">
            Continue your sustainability learning journey. You've completed{" "}
            <span className="font-semibold text-[#36656B]">{completedCount} of 4</span> core activities.
          </p>
        </div>
        {/* Decorative */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#DDEAEA]" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-[#EAF2F2]" />
      </motion.div>

      {/* Navigation Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={section.path} className="block group">
                <Card className="h-full border-[#D6E3E3] hover:shadow-lg hover:border-[#36656B]/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className={`w-11 h-11 rounded-xl ${section.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {section.label}
                      <ArrowRight className="w-4 h-4 text-[#7A8F93] group-hover:text-[#36656B] group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#5E767A]">{section.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}