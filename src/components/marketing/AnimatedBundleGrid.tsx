"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPriceInr, formatValidity } from "@/lib/utils/format";
import type { BundlePublic } from "@/types/domain";

export function AnimatedBundleGrid({ bundles }: { bundles: BundlePublic[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {bundles.map((bundle, index) => (
        <motion.div
          key={bundle.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
        >
          <Card className="flex h-full flex-col p-6">
            <Badge tone="brand" className="w-fit">
              {bundle.category_name}
            </Badge>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{bundle.title}</h3>
            {bundle.description && (
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-foreground/60">
                {bundle.description}
              </p>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPriceInr(bundle.price_inr)}
              </span>
              <span className="text-sm text-foreground/50">
                / {formatValidity(bundle.validity_days)}
              </span>
            </div>
            <Link href={`/bundles/${bundle.slug}`} className="mt-5">
              <Button variant="primary" size="md" className="w-full">
                View Details
              </Button>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
