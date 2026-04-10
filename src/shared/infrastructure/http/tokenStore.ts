import { getSession } from "next-auth/react";
import { auth } from "@/shared/infrastructure/auth/nextAuth";

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    const session = await auth();
    return session?.accessToken ?? null;
  }
  const session = await getSession();
  return session?.accessToken ?? null;
}
