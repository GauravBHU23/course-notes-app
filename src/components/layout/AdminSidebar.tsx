"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/bundles", label: "Bundles", icon: "📦" },
  { href: "/admin/pdfs", label: "PDFs", icon: "📄" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/purchases", label: "Purchases", icon: "🧾" },
  { href: "/admin/invoices", label: "Invoices", icon: "🧮" },
  { href: "/admin/queries", label: "Queries", icon: "💬" },
  { href: "/admin/sessions", label: "Sessions", icon: "🔐" },
  { href: "/admin/locked-accounts", label: "Locked Accounts", icon: "🔒" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border-subtle bg-surface px-4 py-6">
      <Link href="/admin" className="mb-8 px-2 text-lg font-bold text-brand-700">
        Admin Panel
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
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
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-tone-danger-bg"
      >
        🚪 Log out
      </button>
    </aside>
  );
}
