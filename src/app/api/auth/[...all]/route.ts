export const runtime = "nodejs";
import { auth } from "@/lib/auth";

const handler = auth.handler;
console.log("[BetterAuth route runtime]:", process.env.NEXT_RUNTIME);

export { handler as GET, handler as POST };
