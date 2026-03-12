import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API & static
  const isApi = pathname.startsWith("/api");
  const isMembersPage = pathname === "/members-only";
  const isAdmin = pathname.startsWith("/miniadmin");

  if (isApi || isAdmin) {
    return NextResponse.next();
  }

  /* ============================
     CHECK AUTH COOKIE
  ============================ */

  const hasAuth =
    req.cookies.get("members_access") ||
    req.cookies.get("auth_token");

  /* ============================
     FETCH SETTINGS
  ============================ */

  let membersEnabled = false;

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/settings`, {
      cache: "no-store",
    });

    if (res.ok) {
      const settings = await res.json();
      membersEnabled = settings?.membersOnly?.enabled ?? false;
    }
  } catch (err) {
    console.error("Middleware settings fetch failed");
  }

  /* ============================
     MEMBERS LOCK LOGIC
  ============================ */

  if (membersEnabled) {
    if (!hasAuth && !isMembersPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/members-only";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}