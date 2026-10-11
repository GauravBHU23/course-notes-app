"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/my-bundles", label: "My Bundles", icon: "📚" },
  { href: "/dashboard/purchases", label: "Purchases", icon: "🧾" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/dashboard/support", label: "Support", icon: "💬" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border-subtle bg-surface px-4 py-6">
      <Link href="/" className="mb-8 px-2 text-lg font-bold text-brand-700">
        ExamPrep Store
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-brand-50 text-brand-700"
                : "text-foreground/70 hover:bg-brand-50/60"
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        🚪 Log out
      </button>
    </aside>
  );
}
