import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, CheckCircle2, XCircle, AlertCircle, Activity } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { QueueData, QueueStatus } from "../model/types";

interface QueueListTableProps {
  queues: QueueData[];
  isLoading: boolean;
}

export function QueueListTable({ queues, isLoading }: QueueListTableProps) {
  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"><Clock className="w-3 h-3 mr-1"/> 대기중</Badge>;
      case "PROCESSING":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 animate-pulse"><Activity className="w-3 h-3 mr-1"/> 진행중</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> 완료됨</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20"><XCircle className="w-3 h-3 mr-1"/> 실패</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading && queues.length === 0) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">큐 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-800 bg-[#0A0A0B]/50 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111113] border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium w-[180px]">실행 예정 / 일시</th>
              <th className="px-4 py-3 font-medium">카테고리 / 의도</th>
              <th className="px-4 py-3 font-medium">요청 유저</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">에러 로그 (있는 경우)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {queues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  표시할 큐(Queue)가 없습니다.
                </td>
              </tr>
            ) : (
              queues.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-300">
                    {format(new Date(q.scheduledFor), "MM. dd. HH:mm", { locale: ko })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-200">{q.categoryName}</span>
                      {q.searchIntent ? <span className="text-slate-500 text-xs truncate max-w-[200px]">{q.searchIntent}</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-300 font-medium">{q.user?.nickname || 'Unknown'}</span>
                      <span className="text-slate-500 text-xs">{q.user?.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(q.status)}
                  </td>
                  <td className="px-4 py-3">
                    {q.errorMessage ? (
                      <div className="flex items-center text-rose-400 text-sm max-w-[300px]">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate" title={q.errorMessage}>{q.errorMessage}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
