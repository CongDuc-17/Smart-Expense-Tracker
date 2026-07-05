import { apiClient } from "@/lib/apiClient";
import type { UserResponse, UpdateProfilePayload, ChangePasswordPayload } from "../types/user.types";

export const usersService = {
  getMe: async (): Promise<UserResponse> => {
    return await apiClient.get<UserResponse>("/users/me");
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<UserResponse> => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.email) formData.append("email", payload.email);
    if (payload.avatar) formData.append("avatar", payload.avatar);

    return await apiClient.put<UserResponse>("/users/me", formData, {
      headers: {
        // Axios automatically sets multipart/form-data when passing FormData
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<UserResponse> => {
    return await apiClient.patch<UserResponse>("/users/me/change-password", payload);
  },
};
