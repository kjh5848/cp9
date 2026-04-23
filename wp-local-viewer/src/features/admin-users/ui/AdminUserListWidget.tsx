"use client";

import { useAdminUsersViewModel } from "../model/useAdminUsersViewModel";
import { UserListTable } from "@/entities/user/ui/UserListTable";

export function AdminUserListWidget() {
  const { users, isLoading, handleRoleChange } = useAdminUsersViewModel();

  return (
    <UserListTable 
      users={users} 
      isLoading={isLoading} 
      onRoleChange={handleRoleChange} 
    />
  );
}
