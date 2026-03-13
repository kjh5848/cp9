import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 사용자의 토큰 정보나 라우팅 제어가 필요한 추가 로직이 있다면 여기서 처리 (Role 체크 등)
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
  }
);

// 배열 형태의 matcher로 보호하고 싶은 라우트 경로들을 명시 (대시보드, 랩, 환경설정 등)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/keyword-lab/:path*",
    "/settings/:path*",
    // 추후 보호할 페이지가 있다면 이 배열에 계속 추가
  ],
};
