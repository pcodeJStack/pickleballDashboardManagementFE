import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_PUBLIC_ROUTES = ["/", "/login"];
const CUSTOMER_PUBLIC_ROUTES = ["/", "/customerLogin"];
const ADMIN_PROTECTED_ROUTES = ["/dashboard"];
const CUSTOMER_PROTECTED_ROUTES = ["/home"];
const isAdminProtectedRoute = (pathname: string) =>
  ADMIN_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const isCustomerProtectedRoute = (pathname: string) =>
  CUSTOMER_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
const isAdminPublicRoute = (pathname: string) =>
  ADMIN_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
const isCustomerPublicRoute = (pathname: string) =>
  CUSTOMER_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  // chưa login mà vào protected route => redirect login
  if (!accessToken && isAdminProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (!accessToken && isCustomerProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/customerLogin";
    return NextResponse.redirect(url);
  }

  //  sai role
  if (accessToken && role !== "ADMIN" && isAdminProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  if (
    accessToken &&
    role !== "CUSTOMER" &&
    isCustomerProtectedRoute(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // đã login mà vào auth page
  if (accessToken && role === "ADMIN" && isAdminPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (accessToken && role === "CUSTOMER" && isCustomerPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }
  // ADMIN mà vào customer login
  if (accessToken && role === "ADMIN" && isCustomerPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // CUSTOMER mà vào admin login
  if (accessToken && role === "CUSTOMER" && isAdminPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|next-api).*)",
  ],
};
