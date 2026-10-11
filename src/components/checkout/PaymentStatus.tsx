"use client";

import { motion, AnimatePresence } from "framer-motion";

type Status = "pending" | "success" | "failed";

interface PaymentStatusProps {
  status: Status;
  children?: React.ReactNode;
}

const icons: Record<Status, string> = {
  pending: "⏳",
  success: "✅",
  failed: "❌",
};

const titles: Record<Status, string> = {
  pending: "Confirming your payment…",
  success: "Payment successful!",
  failed: "Payment failed",
};

const colors: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-600",
};

export function PaymentStatus({ status, children }: PaymentStatusProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <motion.div
          animate={status === "pending" ? { rotate: 360 } : {}}
          transition={status === "pending" ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${colors[status]}`}
        >
          {icons[status]}
        </motion.div>
        <h2 className="text-xl font-bold">{titles[status]}</h2>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
