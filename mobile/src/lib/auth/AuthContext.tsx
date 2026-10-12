import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { getSessionToken, setSessionToken, clearSessionToken } from "@/lib/auth/sessionStorage";
import type { Profile } from "@/types/domain";

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  profile: Profile | null;
  isLoading: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshProfile() {
    try {
      const data = await apiFetch<{ profile: Profile }>("/api/profile");
      setProfile(data.profile);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    (async () => {
      const token = await getSessionToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      await refreshProfile();
      setIsLoading(false);
    })();
  }, []);

  async function loginWithPassword(identifier: string, password: string): Promise<LoginResult> {
    try {
      const data = await apiFetch<{ ok: true; role: string; sessionToken: string }>("/api/auth/login", {
        method: "POST",
        body: { identifier, password },
      });
      await setSessionToken(data.sessionToken);
      await refreshProfile();
      return { ok: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not log in. Please try again.";
      return { ok: false, error: message };
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort server-side revoke; clearing the local token below is
      // what actually matters for this device regardless of the result.
    }
    await clearSessionToken();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, isLoading, loginWithPassword, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
