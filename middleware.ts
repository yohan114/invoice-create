import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "workshop-dev-secret-do-not-use-in-production";
  return new TextEncoder().encode(secret);
}

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Allow login page and static assets
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    // If user is already logged in and visits /login, redirect to dashboard
    if (pathname === "/login" && token) {
      const valid = await isValidToken(token);
      if (valid) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the JWT signature and expiration
  const valid = await isValidToken(token);
  if (!valid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
