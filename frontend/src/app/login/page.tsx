"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 전역 세션이 이미 존재하면(로그인된 상태라면) 메인화면으로 리다이렉트
  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.removeItem('keyword-cart-storage');
    }
    if (status === "authenticated") {
      router.push("/keyword-lab");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/keyword-lab",
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        toast.error("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else {
        toast.success("로그인 성공!");
      }
    } catch (err) {
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  이메일 주소
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    비밀번호
                  </label>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </button>

            <p className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800">
              아직 계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                회원가입
              </Link>
            </p>
          </form>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        © 2026 CP9 Advanced Agentic Platform
      </div>
    </div>
  );
}