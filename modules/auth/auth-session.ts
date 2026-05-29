"use server";

import { auth } from "./auth.config";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server side.
 * Use this in Server Components, Server Actions, and Route Handlers.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get the current user on the server side.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Require authentication - throws redirect if not authenticated.
 * Use this in Server Components that require auth.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Sign out the user on the server side and clear cookies, then redirect to login.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Sign out API error:", error);
  }

  // Clear better-auth session cookies safely for dev and production
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");

  redirect("/admin/login");
}
