import "server-only";

const SANDBOX_BASE_URL = "https://sandbox.cashfree.com/pg";
const PRODUCTION_BASE_URL = "https://api.cashfree.com/pg";
const DEFAULT_API_VERSION = "2026-01-01";

function baseUrl(): string {
  if (process.env.CASHFREE_BASE_URL) return process.env.CASHFREE_BASE_URL;
  return process.env.CASHFREE_ENV === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-api-version": process.env.CASHFREE_API_VERSION || DEFAULT_API_VERSION,
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };
}

export interface CreateOrderParams {
  orderId: string;
  amountInr: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export interface CreateOrderResult {
  paymentSessionId: string;
  cfOrderId: string;
}

export async function createCashfreeOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const res = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amountInr,
      order_currency: "INR",
      customer_details: {
        customer_id: params.customerId,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        // Cashfree requires a 10-digit phone; fall back to a placeholder
        // if the student hasn't registered a mobile number.
        customer_phone: params.customerPhone || "9999999999",
      },
      order_meta: {
        return_url: `${params.returnUrl}?order_id={order_id}`,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cashfree order creation failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    paymentSessionId: data.payment_session_id,
    cfOrderId: data.cf_order_id ?? data.order_id,
  };
}

export interface CashfreeOrderStatus {
  orderStatus: "PAID" | "ACTIVE" | "EXPIRED" | "TERMINATED" | string;
  paymentId: string | null;
}

export async function getCashfreeOrderStatus(orderId: string): Promise<CashfreeOrderStatus> {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cashfree order lookup failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    orderStatus: data.order_status,
    paymentId: data.cf_payment_id ? String(data.cf_payment_id) : null,
  };
}
