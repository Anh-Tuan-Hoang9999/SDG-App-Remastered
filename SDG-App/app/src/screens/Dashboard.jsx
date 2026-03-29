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
    color: "bg-primary/10 text-primary"
  },
  {
    path: "/card-sort",
    label: "Card Sort Activity",
    desc: "Sort SDGs by relevance to your co-op experience",
    icon: Shuffle,
    color: "bg-accent/20 text-accent-foreground"
  },
  {
    path: "/reflection-log",
    label: "Reflection Logs",
    desc: "Document your sustainability reflections",
    icon: BookOpen,
    color: "bg-chart-3/10 text-chart-3"
  },
  {
    path: "/progress",
    label: "Progress Tracker",
    desc: "View your activity completion status",
    icon: BarChart3,
    color: "bg-chart-4/10 text-chart-4"
  },
  {
    path: "/resources",
    label: "Resources",
    desc: "Access SDG learning materials and links",
    icon: Library,
    color: "bg-chart-2/10 text-chart-2"
  },
  {
    path: "/coordinator",
    label: "Coordinator View",
    desc: "View student progress summaries",
    icon: Users,
    color: "bg-chart-5/10 text-chart-5"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.full_name || "Student";
  const completedCount = 0; // Placeholder, since no backend

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">SDG Co-op Learning Portal</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Continue your sustainability learning journey. You've completed{" "}
            <span className="font-semibold text-primary">{completedCount} of 4</span> core activities.
          </p>
        </div>
        {/* Decorative */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-primary/5" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-accent/10" />
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
                <Card className="h-full hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className={`w-11 h-11 rounded-xl ${section.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {section.label}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{section.desc}</p>
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