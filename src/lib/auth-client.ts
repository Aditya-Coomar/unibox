import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://your-domain.com" // Replace with your production URL
      : "http://localhost:3000",
});

export const { useSession, signIn, signUp, signOut } = authClient;

// Custom hook to get user from session
export const useUser = () => {
  const { data: session } = useSession();
  return session?.user ?? null;
};
