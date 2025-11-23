import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Note: Appwrite uses localStorage for sessions, not cookies
  // So we can't check auth state in middleware
  // Auth protection is handled client-side in the dashboard layout
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
