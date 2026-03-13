import { LayoutGrid, Users, Activity, CreditCard } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    { label: "대시보드 요약", href: "/admin", icon: <LayoutGrid className="w-5 h-5" /> },
    { label: "유저 관리", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "시스템 모니터링", href: "/admin/monitoring", icon: <Activity className="w-5 h-5" /> },
    { label: "결제 및 구독", href: "/admin/billing", icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <div className="flex bg-[#0A0A0B] min-h-screen text-slate-200">
      {/* 어드민 사이드바 (LNB) */}
      <aside className="w-64 bg-[#111113] border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            CP9 Admin
          </h2>
          <p className="text-xs text-slate-500 mt-1">SaaS Management Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← 일반 사용자 모드로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 내부 콘텐츠 */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-[#0A0A0B]/80 backdrop-blur-md">
          <h1 className="text-lg font-medium">관리자 전용 대시보드</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
