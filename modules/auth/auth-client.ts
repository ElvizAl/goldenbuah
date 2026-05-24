import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/modules/auth/auth.config";


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  plugins: [
        inferAdditionalFields<typeof auth>(),
    ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
