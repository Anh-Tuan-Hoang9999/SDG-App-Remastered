import React from "react";
import { SDG_DATA } from "@/data/sdgData";
import SDGFlipCard from "@/components/sdg/SDGFlipCard";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export default function SDGCards() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">SDG Digital Cards</h1>
            <p className="text-sm text-muted-foreground">Click any card to flip and learn more</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {SDG_DATA.map((sdg, i) => (
          <motion.div
            key={sdg.number}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <SDGFlipCard sdg={sdg} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}