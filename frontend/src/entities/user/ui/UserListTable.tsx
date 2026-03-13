import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ShieldAlert, ShieldCheck, CreditCard } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { UserData, UserRole } from "../model/types";

interface UserListTableProps {
  users: UserData[];
  isLoading: boolean;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

import { useState } from "react";
export function UserListTable({ users, isLoading, onRoleChange }: UserListTableProps) {
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});

  const handlePendingRoleChange = (userId: string, newRole: UserRole) => {
    setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleSave = (userId: string, currentRole: UserRole) => {
    const newRole = pendingRoles[userId];
    if (newRole && newRole !== currentRole) {
      onRoleChange(userId, newRole);
    }
    // Remove from pending after save
    setPendingRoles(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  const handleCancel = (userId: string) => {
    setPendingRoles(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 툴바 (향후 검색 등 확장) */}
      <div className="flex items-center justify-between">
        <Input 
          placeholder="이메일 또는 닉네임으로 검색..." 
          className="max-w-sm bg-[#0A0A0B] border-slate-800"
          value=""
          onChange={() => {}} 
          disabled
        />
        <div className="text-sm text-slate-400">
          총 {users.length}명의 사용자
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-[#0A0A0B]/50 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111113] border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium w-[200px]">가입일</th>
              <th className="px-4 py-3 font-medium">유저 정보</th>
              <th className="px-4 py-3 font-medium">API 연동 여부</th>
              <th className="px-4 py-3 font-medium">현재 권한(Role)</th>
              <th className="px-4 py-3 font-medium text-right">제어</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-300">
                    {format(new Date(user.createdAt), "yyyy. MM. dd. (E)", { locale: ko })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-medium">{user.nickname}</span>
                      <span className="text-slate-500 text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.hasCoupangKey ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">
                        연동됨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-800 text-slate-500 hover:bg-slate-700 border-slate-700">
                        미연동
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.role === 'ADMIN' ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : null}
                      {user.role === 'PRO' ? <CreditCard className="w-4 h-4 text-indigo-400" /> : null}
                      {user.role === 'USER' ? <ShieldCheck className="w-4 h-4 text-slate-500" /> : null}
                      <span className={`font-semibold ${
                        user.role === 'ADMIN' ? 'text-rose-400' :
                        user.role === 'PRO' ? 'text-indigo-400' : 'text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        className="bg-[#111113] border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer"
                        value={pendingRoles[user.id] || user.role}
                        onChange={(e) => handlePendingRoleChange(user.id, e.target.value as UserRole)}
                      >
                        <option value="USER">일반 (USER)</option>
                        <option value="PRO">프로 (PRO)</option>
                        <option value="ADMIN">관리자 (ADMIN)</option>
                      </select>
                      
                      {pendingRoles[user.id] && pendingRoles[user.id] !== user.role && (
                        <>
                          <Button 
                            size="sm" 
                            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => handleSave(user.id, user.role)}
                          >
                            저장
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 px-2 text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                            onClick={() => handleCancel(user.id)}
                          >
                            취소
                          </Button>
                        </>
                      )}
                    </div>
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
