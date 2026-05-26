"use server";

import { auth } from "./auth.config";
import { headers } from "next/headers";

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