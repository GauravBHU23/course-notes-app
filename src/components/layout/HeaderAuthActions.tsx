"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface HeaderAuthActionsProps {
  isLoggedIn: boolean;
  userName?: string;
  size?: "sm" | "md";
}

export function HeaderAuthActions({ isLoggedIn, userName, size = "sm" }: HeaderAuthActionsProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size={size} className="px-2 sm:px-5">
            <span className="hidden sm:inline">{userName?.split(" ")[0] ?? "Dashboard"}</span>
            <span className="sm:hidden">👤</span>
          </Button>
        </Link>
        <Button variant="secondary" size={size} className="px-2 sm:px-5" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <Link href="/login">
        <Button variant="ghost" size={size} className="px-2 sm:px-5">
          Login
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="primary" size={size} className="px-2 sm:px-5">
          Sign up
        </Button>
      </Link>
    </div>
  );
}
