import NextAuth from "next-auth";
import { authOptions } from "@/shared/infrastructure/auth/nextAuth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
