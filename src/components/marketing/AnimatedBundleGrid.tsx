"use client";

import { motion } from "framer-motion";
import { BundleCard } from "@/components/marketing/BundleCard";
import type { BundlePublic } from "@/types/domain";

export function AnimatedBundleGrid({ bundles }: { bundles: BundlePublic[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {bundles.map((bundle, index) => (
        <motion.div
          key={bundle.id}
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
          className="h-full"
        >
          <BundleCard bundle={bundle} />
        </motion.div>
      ))}
    </div>
  );
}
