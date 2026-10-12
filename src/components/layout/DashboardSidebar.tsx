"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  HomeIcon,
  SearchIcon,
  BundleIcon,
  ReceiptIcon,
  UserIcon,
  SupportIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons/NavIcons";

const links = [
  { href: "/dashboard", label: "Overview", Icon: HomeIcon },
  { href: "/dashboard/browse", label: "Browse Courses", Icon: SearchIcon },
  { href: "/dashboard/my-bundles", label: "My Bundles", Icon: BundleIcon },
  { href: "/dashboard/purchases", label: "Purchases", Icon: ReceiptIcon },
  { href: "/dashboard/profile", label: "Profile", Icon: UserIcon },
  { href: "/dashboard/support", label: "Support", Icon: SupportIcon },
];

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-brand-50 text-brand-700"
              : "text-foreground/70 hover:bg-brand-50/60"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
        <Link href="/" className="text-base font-bold text-brand-700">
          Course and Notes Purchasing App
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-brand-50"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border-subtle bg-surface px-4 py-6 lg:sticky lg:top-0 lg:flex">
        <Link href="/" className="mb-8 px-2 text-lg font-bold text-brand-700">
          Course and Notes Purchasing App
        </Link>
        <SidebarLinks />
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-tone-danger-bg"
        >
          <LogoutIcon className="h-5 w-5 shrink-0" /> Log out
        </button>
      </aside>

      {/* Mobile slide-over drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-surface px-4 py-6 shadow-xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between px-2">
                <Link href="/" className="text-lg font-bold text-brand-700" onClick={() => setOpen(false)}>
                  Course and Notes Purchasing App
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 hover:bg-brand-50"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <SidebarLinks onNavigate={() => setOpen(false)} />
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-tone-danger-bg"
              >
                <LogoutIcon className="h-5 w-5 shrink-0" /> Log out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
