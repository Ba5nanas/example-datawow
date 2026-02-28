import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/admin", "/user"];

// Define public routes that redirect to admin if already authenticated
const publicRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => 
    pathname.startsWith(route)
  );
  
  // Get authentication token from httpOnly cookie (server-side)
  const token = request.cookies.get("authToken")?.value;
  
  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    // Redirect to login page with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If trying to access public route while authenticated
  if (isPublicRoute && token) {
    // Redirect to user page (not admin)
    return NextResponse.redirect(new URL("/user", request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
