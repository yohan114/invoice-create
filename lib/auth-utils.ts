"use server";

import { getCurrentUser, type AuthUser } from "@/lib/actions/auth";

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireRole(roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
