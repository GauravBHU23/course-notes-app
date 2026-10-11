import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBox } from "@/components/layout/SearchBox";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 text-base font-bold text-brand-700 sm:text-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-xs text-white">
            CN
          </span>
          <span className="hidden whitespace-nowrap sm:inline">Course and Notes Purchasing App</span>
          <span className="truncate whitespace-nowrap sm:hidden">Course &amp; Notes</span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="px-2 sm:px-5">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="px-2 sm:px-5">
              Sign up
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile/tablet search row */}
      <div className="border-t border-border-subtle px-4 py-2 md:hidden">
        <SearchBox />
      </div>

      {/* Mobile nav links */}
      <div className="flex items-center justify-center gap-5 border-t border-border-subtle px-4 py-2 sm:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium text-foreground/70 transition-colors hover:text-brand-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
