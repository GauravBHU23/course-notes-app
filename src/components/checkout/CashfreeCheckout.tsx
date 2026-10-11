"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { load } from "@cashfreepayments/cashfree-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PriceSummaryCard } from "@/components/checkout/PriceSummaryCard";

interface CashfreeCheckoutProps {
  bundleSlug: string;
  bundleTitle: string;
  amountInr: number;
  validityDays: number;
}

export function CashfreeCheckout({ bundleSlug, bundleTitle, amountInr, validityDays }: CashfreeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Could not start checkout.";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      sessionStorage.setItem(`order:${bundleSlug}`, data.orderId);

      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox" });
      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch {
      const message = "Something went wrong while starting the payment. Please try again.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-md flex-col gap-6"
    >
      <PriceSummaryCard bundleTitle={bundleTitle} amountInr={amountInr} validityDays={validityDays} />

      <motion.div
        className="rounded-2xl border border-border-subtle bg-gradient-to-br from-brand-50 via-surface to-accent-500/5 p-6 text-center shadow-sm"
        whileHover={{ scale: 1.01 }}
      >
        <p className="mb-4 text-sm text-foreground/60">
          Secure payment powered by Cashfree. Cards, UPI, netbanking and wallets supported.
        </p>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <Button size="lg" className="w-full" loading={loading} onClick={handlePay}>
          Pay ₹{amountInr} securely
        </Button>
        <p className="mt-4 text-xs text-foreground/40">
          🔒 Your payment details are handled entirely by Cashfree. We never see or store your card information.
        </p>
      </motion.div>
    </motion.div>
  );
}
