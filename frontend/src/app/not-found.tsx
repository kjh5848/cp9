import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
            <div className="bg-slate-900/50 border border-red-500/30 p-4 rounded-2xl backdrop-blur-xl relative z-10">
              <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          요청하신 페이지가 삭제되었거나, 이름이 변경되었거나,<br />
          일시적으로 사용할 수 없는 상태입니다.
        </p>

        {/* Actions */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            메인으로 돌아가기
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        © 2026 CP9 Advanced Agentic Platform
      </div>
    </div>
  );
}
