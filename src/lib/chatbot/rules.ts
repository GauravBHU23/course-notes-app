export interface ChatRule {
  keywords: string[];
  answer: string;
}

export const CHAT_RULES: ChatRule[] = [
  {
    keywords: ["pdf not downloading", "can't download", "cant download", "cannot download", "download pdf", "save pdf", "no download button"],
    answer:
      "Our PDFs are view-only by design — you won't find a download button, and that's not a bug. This protects the content for everyone, including you. You can read every page in the secure viewer for as long as your purchase stays valid.",
  },
  {
    keywords: ["login problem", "can't login", "cant login", "cannot login", "locked", "account locked", "login failed"],
    answer:
      "After 3 incorrect login attempts, accounts are temporarily locked for 5 minutes as a security measure — just wait for the countdown shown on screen and try again. If the issue continues after that, please contact the administrator for help.",
  },
  {
    keywords: ["payment failed", "payment", "money deducted", "amount deducted", "transaction failed", "paid but"],
    answer:
      "If a payment didn't go through, please check your Purchases page first — it may already show as successful. If money was deducted from your account but you still don't have access, contact the administrator with your payment details and we'll sort it out.",
  },
  {
    keywords: ["how to buy", "purchase", "how to purchase", "buy notes", "buy pdf", "how do i buy"],
    answer:
      "Browse categories from the homepage, open any bundle you like, and click Buy Now. You'll be taken to a secure checkout powered by Cashfree to complete the payment, after which the bundle unlocks in your dashboard instantly.",
  },
  {
    keywords: ["validity", "expire", "expiry", "how long", "access period"],
    answer:
      "Each bundle has its own validity period (for example 6 months or 1 year), shown clearly on that bundle's page before you buy. You can also check exact expiry dates for your purchases on the My Bundles page.",
  },
];

export const FALLBACK_ANSWER =
  "I couldn't quite match that to something I know. For anything else, please reach out on our WhatsApp or Telegram channel, or contact the administrator from the Support page — we're happy to help.";

export function matchRule(query: string): string {
  const lowered = query.toLowerCase();
  for (const rule of CHAT_RULES) {
    if (rule.keywords.some((keyword) => lowered.includes(keyword))) {
      return rule.answer;
    }
  }
  return FALLBACK_ANSWER;
}
