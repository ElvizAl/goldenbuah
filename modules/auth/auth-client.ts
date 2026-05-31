import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/modules/auth/auth.config";
import { emailOTPClient, adminClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  plugins: [
        inferAdditionalFields<typeof auth>(),
        emailOTPClient(),
        adminClient(),
    ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
