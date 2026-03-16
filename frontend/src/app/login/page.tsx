import Link from "next/link";
import { Metadata } from "next";
import { LoginWidget } from "@/widgets/auth/ui/LoginWidget";

export const metadata: Metadata = {
  title: "로그인 | CP9",
  description: "CP9 어드밴스드 에이전틱 플랫폼에 로그인하세요.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 노드 */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              CP9.
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">환영합니다</h2>
          <p className="text-slate-400 text-sm font-medium">
            계정에 로그인하여 플랫폼에 접속하세요
          </p>
        </div>

        {/* Form Card */}
        <LoginWidget />
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        © 2026 CP9 Advanced Agentic Platform
      </div>
    </div>
  );
}