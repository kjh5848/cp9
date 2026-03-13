export type UserRole = "USER" | "PRO" | "ADMIN";

export interface UserData {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
  hasCoupangKey: boolean;
}
