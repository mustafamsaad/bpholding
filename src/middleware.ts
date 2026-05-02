import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import type { AppRole } from "@/lib/auth/roles";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Returns the path stripped of the leading locale segment, e.g.:
 *   "/en/admin/projects" -> "/admin/projects"
 *   "/ar"                -> "/"
 */
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  const seg = pathname.split("/")[1];
  return routing.locales.includes(seg as (typeof routing.locales)[number])
    ? seg
    : routing.defaultLocale;
}

/**
 * Single middleware that:
 *  1. Refreshes the Supabase auth session on every request.
 *  2. Delegates locale routing to next-intl.
 *  3. Enforces role-based access for the admin and employee surfaces.
 */
export async function middleware(request: NextRequest) {
  // First, run the i18n middleware so locale routing/redirects are correct.
  const intlResponse = intlMiddleware(request);
  let response =
    intlResponse instanceof NextResponse ? intlResponse : NextResponse.next();

  // Attach Supabase to refresh the session cookies on this response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: must call getUser() to refresh session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const locale = getLocaleFromPath(pathname);
  const localeless = stripLocale(pathname);

  const isAdminArea = localeless.startsWith("/admin");
  const isEmployeeArea = localeless.startsWith("/employee");

  if (isAdminArea || isEmployeeArea) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (user.app_metadata?.role ?? null) as AppRole | null;

    if (isAdminArea && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
    if (isEmployeeArea && role !== "employee" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on everything except Next internals, static files, and common assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
