import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-background to-accent-500/5 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-brand-700">
            Course and Notes Purchasing App
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
