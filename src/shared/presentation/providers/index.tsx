"use client";
import { QueryProvider } from "./QueryProvider";
import { LocaleFromStorage } from "./LocaleFromStorage";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LocaleFromStorage />
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
