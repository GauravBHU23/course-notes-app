"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

type Audience = "candidate" | "admin";

export function LoginTabs() {
  const [audience, setAudience] = useState<Audience>("candidate");

  return (
    <div>
      <div className="mb-6 flex overflow-hidden rounded-xl border border-border-subtle bg-surface">
        {(["candidate", "admin"] as Audience[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setAudience(tab)}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              audience === tab
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-foreground/50 hover:text-foreground/70"
            }`}
          >
            {tab === "candidate" ? "Candidate" : "Admin"}
          </button>
        ))}
      </div>

      {audience === "candidate" ? <LoginForm /> : <AdminLoginForm />}
    </div>
  );
}
