import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { QueueMonitorWidget } from "@/features/admin-monitoring/ui/QueueMonitorWidget";

export default function AdminMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">시스템 모니터링</h2>
        <p className="text-slate-400">오토파일럿 및 캠페인 스케줄링 대기열 상태와 에러 로그를 확인합니다.</p>
      </div>

      <Card className="bg-[#111113]/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Autopilot Queue Status</CardTitle>
          <CardDescription>
            현재 Cron 에 의해 처리되기를 기다리거나, 실행 중 에러가 발생한 작업들입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueueMonitorWidget />
        </CardContent>
      </Card>
    </div>
  );
}
