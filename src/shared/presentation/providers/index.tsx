"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./QueryProvider";
import { LocaleFromStorage } from "./LocaleFromStorage";
import { Toaster } from "sonner";
import { env } from "@/shared/infrastructure/config/env";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <SessionProvider>
        <QueryProvider>
          <LocaleFromStorage />
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}
