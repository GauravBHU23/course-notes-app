import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import type { Database } from "@/types/database.types";

// Matches Supabase's own React Native quickstart: AsyncStorage as the auth
// storage adapter (no expo-secure-store size-limit workarounds needed here).
// Our own app-level session token (the mobile equivalent of the web app's
// app_session/admin_session cookie) is stored separately in SecureStore --
// see lib/auth/sessionStorage.ts -- since that's a small, fixed-size value
// where SecureStore's OS-level encryption is a clean fit.
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
