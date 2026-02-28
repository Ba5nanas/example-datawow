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
  
  // Get JWT token from httpOnly cookie (server-side)
  const jwtToken = request.cookies.get("jwt")?.value;
  const authToken = request.cookies.get("authToken")?.value;
  
  // If trying to access protected route without authentication
  if (isProtectedRoute && !jwtToken && !authToken) {
    // Redirect to login page with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If trying to access admin route, check for admin role
  if (pathname.startsWith("/admin") && jwtToken) {
    const userData = request.cookies.get("userData")?.value;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== "user") {
          // Non-admin trying to access admin route, redirect to user page
          return NextResponse.redirect(new URL("/user", request.url));
        }
      } catch (error) {
        // Invalid user data, redirect to login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  
  // If trying to access public route while authenticated
  if (isPublicRoute && (jwtToken || authToken)) {
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
