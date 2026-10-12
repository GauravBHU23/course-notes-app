import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "@/lib/auth/AuthContext";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
