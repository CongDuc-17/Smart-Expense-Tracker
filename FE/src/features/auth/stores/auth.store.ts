import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/features/users/types/user.types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  // Actions
  setAuth: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearAuth: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isInitializing: true,

      setAuth: (user) => set({ currentUser: user, isAuthenticated: true, isInitializing: false }),
      
      updateUser: (data) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
        })),
        
      clearAuth: () => set({ currentUser: null, isAuthenticated: false, isInitializing: false }),

      setInitializing: (isInitializing) => set({ isInitializing }),
    }),
    {
      name: "smart-expense-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // We do not persist isInitializing. It's always true on reload until checked.
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useUserName = () => useAuthStore((state) => state.currentUser?.name || "Người dùng");
export const useUserEmail = () => useAuthStore((state) => state.currentUser?.email || "");
export const useUserAvatar = () => useAuthStore((state) => state.currentUser?.avatar);
export const useUserInitials = () => {
  const name = useAuthStore((state) => state.currentUser?.name);
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
export const useUserRole = () => "Member"; // Or state.currentUser.role if backend supports it
export const useUserCreatedAt = () => useAuthStore((state) => state.currentUser?.createdAt);
