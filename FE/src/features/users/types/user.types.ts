export type UserStatusEnum = "ACTIVE" | "LOCKED";
export type UserRoleEnum = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRoleEnum;
  status: UserStatusEnum;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: File;
}

export interface ChangePasswordPayload {
  newPassword: string;
}

export interface UserResponse {
  status: string;
  data: User;
}
