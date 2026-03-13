import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Activity, Settings2, ShieldCheck } from "lucide-react";
import { prisma } from "@/infrastructure/clients/prisma";

export default async function AdminDashboardPage() {
  // 간단한 통계 데이터 패치 
  // (실제 프로덕션에서는 캐싱이나 ISR을 적용하는 것이 좋습니다)
  const [totalUsers, adminUsers, totalQueues] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.autopilotQueue.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Overview</h2>
          <p className="text-slate-400">시스템 전체 통계와 요약 정보를 확인합니다.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#111113]/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">총 가입자 수</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111113]/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">운영진 (ADMIN)</CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{adminUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111113]/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">전체 Autopilot 큐</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalQueues}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111113]/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">시스템 상태</CardTitle>
            <Settings2 className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">Healthy</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 향후 차트나 최근 가입자 리스트 영역을 이곳에 추가할 수 있습니다 */}
    </div>
  );
}
