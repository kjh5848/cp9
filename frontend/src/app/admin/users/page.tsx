import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { AdminUserListWidget } from "@/features/admin-users/ui/AdminUserListWidget";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">가입 유저 관리</h2>
        <p className="text-slate-400">서비스에 가입한 모든 사용자의 플랜, 권한을 제어할 수 있습니다.</p>
      </div>

      <Card className="bg-[#111113]/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">User Directory</CardTitle>
          <CardDescription>
            계정의 속성(role)을 우측 버튼을 눌러 수동으로 즉시 변경할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserListWidget />
        </CardContent>
      </Card>
    </div>
  );
}
