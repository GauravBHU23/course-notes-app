"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";
import { Button } from "@/components/ui/Button";

interface CheckoutResultPollerProps {
  orderId: string | null;
}

type PollStatus = "pending" | "success" | "failed";

const MAX_POLLS = 20;
const POLL_INTERVAL_MS = 2000;

export function CheckoutResultPoller({ orderId }: CheckoutResultPollerProps) {
  const [status, setStatus] = useState<PollStatus>("pending");
  const [amountInr, setAmountInr] = useState<number | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    let cancelled = false;

    async function poll() {
      attemptsRef.current += 1;
      try {
        const res = await fetch(`/api/payments/cashfree/verify?orderId=${encodeURIComponent(orderId!)}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && (data.status === "success" || data.status === "failed")) {
          setStatus(data.status);
          setAmountInr(data.amountInr ?? null);
          return;
        }
      } catch {
        // transient network error; keep polling until MAX_POLLS
      }

      if (!cancelled && attemptsRef.current < MAX_POLLS) {
        setTimeout(poll, POLL_INTERVAL_MS);
      } else if (!cancelled) {
        setStatus("failed");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <PaymentStatus status={status}>
      {status === "success" && (
        <>
          <p className="text-sm text-foreground/60">
            {amountInr ? `₹${amountInr} paid successfully. ` : ""}
            Your content is now unlocked. A confirmation and invoice have been emailed to you.
          </p>
          <Link href="/dashboard/my-bundles">
            <Button className="mt-2">Go to My Bundles</Button>
          </Link>
        </>
      )}
      {status === "failed" && (
        <>
          <p className="text-sm text-foreground/60">
            We couldn&apos;t confirm your payment. If money was deducted, it will be refunded automatically, or
            please contact the administrator with your order ID.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" className="mt-2">
              Back to dashboard
            </Button>
          </Link>
        </>
      )}
      {status === "pending" && (
        <p className="text-sm text-foreground/60">This usually takes just a few seconds…</p>
      )}
    </PaymentStatus>
  );
}
