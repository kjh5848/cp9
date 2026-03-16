import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // 어드민 페이지 접근 제어: 토큰의 role이 ADMIN이 아니면 튕겨냄
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // 로그인 토큰(token)이 존재하면 true 반환되어 접근 허용, 없으면 false로 `/login` (기본값) 페이지 리다이렉트
        return !!token;
      },
    },
    // 로그인 안된 사용자는 여기로 튕겨냄 (루트는 /login 임, 툴에서 로그인 페이지를 그렇게 선언했으므로)
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
  }
);

// 배열 형태의 matcher로 보호하고 싶은 라우트 경로들을 명시
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - login (login page)
     * - register (registration page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register).*)',
  ],
};
