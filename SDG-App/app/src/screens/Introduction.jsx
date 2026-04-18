import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, BookOpen, Users, BarChart3, Lightbulb, DollarSign, Apple, Heart, GraduationCap, Droplets, Zap, Briefcase, Cog, Scale, Building, Recycle, CloudRain, Fish, Leaf, Shield, Handshake } from 'lucide-react';
import E_PRINT_01 from '../assets/GoalSDG/E_PRINT_01.jpg';
import E_PRINT_02 from '../assets/GoalSDG/E_PRINT_02.jpg';
import E_PRINT_03 from '../assets/GoalSDG/E_PRINT_03.jpg';
import E_PRINT_04 from '../assets/GoalSDG/E_PRINT_04.jpg';
import E_PRINT_05 from '../assets/GoalSDG/E_PRINT_05.jpg';
import E_PRINT_06 from '../assets/GoalSDG/E_PRINT_06.jpg';
import E_PRINT_07 from '../assets/GoalSDG/E_PRINT_07.jpg';
import E_PRINT_08 from '../assets/GoalSDG/E_PRINT_08.jpg';
import E_PRINT_09 from '../assets/GoalSDG/E_PRINT_09.jpg';
import E_PRINT_10 from '../assets/GoalSDG/E_PRINT_10.jpg';
import E_PRINT_11 from '../assets/GoalSDG/E_PRINT_11.jpg';
import E_PRINT_12 from '../assets/GoalSDG/E_PRINT_12.jpg';
import E_PRINT_13 from '../assets/GoalSDG/E_PRINT_13.jpg';
import E_PRINT_14 from '../assets/GoalSDG/E_PRINT_14.jpg';
import E_PRINT_15 from '../assets/GoalSDG/E_PRINT_15.jpg';
import E_PRINT_16 from '../assets/GoalSDG/E_PRINT_16.jpg';
import E_PRINT_17 from '../assets/GoalSDG/E_PRINT_17.jpg';

const features = [
  {
    icon: BookOpen,
    title: "SDG Digital Cards",
    desc: "Explore all 17 UN Sustainable Development Goals through interactive flip cards."
  },
  {
    icon: Users,
    title: "Card Sort Activity",
    desc: "Rank SDGs by relevance to your co-op experience through drag-and-drop sorting."
  },
  {
    icon: Lightbulb,
    title: "Reflection Logs",
    desc: "Document your learning journey and discussions with employers about sustainability."
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    desc: "Monitor your completion across all activities with a visual progress dashboard."
  }
];

const sdgColors = [
  '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2',
  '#FCC30B', '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E',
  '#3F7E44', '#0A97D9', '#56C02B', '#00689D', '#19486A'
];

const sdgIcons = [
  DollarSign, Apple, Heart, GraduationCap, Users, Droplets, Zap,
  Briefcase, Cog, Scale, Building, Recycle, CloudRain, Fish,
  Leaf, Shield, Handshake
];

const sdgImages = [
  E_PRINT_01, E_PRINT_02, E_PRINT_03, E_PRINT_04, E_PRINT_05,
  E_PRINT_06, E_PRINT_07, E_PRINT_08, E_PRINT_09, E_PRINT_10,
  E_PRINT_11, E_PRINT_12, E_PRINT_13, E_PRINT_14, E_PRINT_15,
  E_PRINT_16, E_PRINT_17
];

export default function Introduction() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background" data-auth-page>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#36656B]/10 text-[#36656B] text-sm font-medium mb-6">
              <Globe className="w-4 h-4 text-green-500" />
              SDG Learning Portal
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              SDG Co-op{" "}
              <span className="text-[#36656B]">Learning Portal</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Connect your co-op experience with the UN Sustainable Development Goals.
              Explore, reflect, and track your journey toward a more sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleStart}
                className="bg-[#36656B] hover:bg-[#2a4f53] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-[#36656B] text-[#36656B] hover:bg-[#36656B] hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </motion.div>

        
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Explore the SDGs, connect them to your co-op experience, and track your learning journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG Ribbon */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">The 17 Global Goals</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore all 17 United Nations Sustainable Development Goals through our interactive learning platform.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto">
              {sdgColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer overflow-hidden group flex-shrink-0"
                  whileHover={{ y: -5 }}
                  style={{ backgroundColor: color }}
                  title={`SDG ${i+1}`}
                >
                  <img
                    src={sdgImages[i]}
                    alt={`SDG ${i+1}`}
                    className="w-full h-full object-cover rounded-lg group-hover:brightness-110 transition-all duration-300"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">SDG Co-op Learning Portal — COIS 4000Y Capstone Prototype</p>
          <p className="text-xs text-muted-foreground">Academic prototype · Not for production use</p>
        </div>
      </footer>
    </div>
  );
}
