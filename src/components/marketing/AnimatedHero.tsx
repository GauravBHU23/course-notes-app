"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(120deg, var(--hero-gradient-from), var(--hero-gradient-via), var(--background))",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
        {/*
          Text content below renders at full opacity by default (no
          initial={{opacity:0}}) and only animates a timing/y-offset
          flourish on top. Hiding real content behind a JS-driven "animate
          in" with an opacity-0 initial state made the hero invisible until
          Framer Motion hydrated -- a real regression on slow connections,
          low-end phones, or if JS was briefly delayed. Content must never
          depend on client JS to become visible.
        */}
        <motion.span
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700"
        >
          Trusted by SSC, Railway, Bank, UGC NET, BPSC &amp; TRE aspirants
        </motion.span>

        <motion.h1
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          Exam-ready notes,{" "}
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
            built to get you selected
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70"
        >
          Curated PDF notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE exams —
          priced fairly, updated regularly, and viewable securely on any device.
        </motion.p>

        <motion.div
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/pricing">
            <Button variant="primary" size="lg">
              Browse Bundles
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
