import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/user.types";

interface UserState {
  currentUser: User | null;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,

      setUser: (user) => set({ currentUser: user }),
      
      updateUser: (data) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
        })),
        
      clearUser: () => set({ currentUser: null }),
    }),
    {
      name: "smart-expense-user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist safe data, avoid anything related to passwords if it existed
        currentUser: state.currentUser,
      }),
    }
  )
);

// Selectors
export const useUserName = () => useUserStore((state) => state.currentUser?.name || "Người dùng");
export const useUserEmail = () => useUserStore((state) => state.currentUser?.email || "");
export const useUserAvatar = () => useUserStore((state) => state.currentUser?.avatar);
export const useUserInitials = () => {
  const name = useUserStore((state) => state.currentUser?.name);
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
export const useUserRole = () => "Member"; // Or state.currentUser.role if backend supports it
export const useUserCreatedAt = () => useUserStore((state) => state.currentUser?.createdAt);
