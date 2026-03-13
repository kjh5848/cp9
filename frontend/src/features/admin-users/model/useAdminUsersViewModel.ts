import useSWR from "swr";
import { UserData, UserRole } from "@/entities/user/model/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminUsersResponse {
  users: UserData[];
  total: number;
  page: number;
  totalPages: number;
}

export function useAdminUsersViewModel() {
  const { data, error, isLoading, mutate } = useSWR<AdminUsersResponse>(
    "/api/admin/users",
    fetcher
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // 낙관적 업데이트를 위해 현재 캐시된 데이터를 백업합니다.
    const previousData = data;
    
    // 캐시를 즉시 업데이트합니다 (revalidate: false로 서버 재검증 방지)
    if (data) {
      mutate(
        {
          ...data,
          users: data.users.map((u) => 
            u.id === userId ? { ...u, role: newRole } : u
          )
        },
        false 
      );
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!res.ok) {
        throw new Error("권한 변경 실패");
      }
      
      // 서버에서 성공을 반환하면 최종적으로 백그라운드 재검증
      mutate();
    } catch (err) {
      console.error(err);
      alert("서버 연결 여부 혹은 응답을 확인하세요. 권한 변경이 실패했습니다.");
      // 에러 발생 시 낙관적 업데이트 롤백
      if (previousData) {
        mutate(previousData, false);
      }
    }
  };

  return {
    users: data?.users || [],
    isLoading,
    isError: error,
    handleRoleChange
  };
}
