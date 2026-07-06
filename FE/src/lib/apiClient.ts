import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  // Essential for sending HttpOnly cookies (accessToken, refreshToken)
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Biến để tránh việc gọi refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip refresh token nếu đang ở auth pages
    const authPages = ["/login", "/register", "/verify", "/forgot-password"];
    const isAuthPage = authPages.some((page) =>
      window.location.pathname.includes(page),
    );

    // Kiểm tra nếu lỗi 401 và chưa được retry (và không phải auth page)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthPage
    ) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh, đẩy request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Không cần set Header vì cookie tự động được gửi qua withCredentials
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API lấy token mới - dùng axios gốc để tránh interceptor này lặp vô tận
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // Để gửi kèm HttpOnly Cookie chứa refreshToken
          },
        );

        // Backend đã set lại HttpOnly cookie mới trong response
        processQueue(null);

        // Thực hiện lại request ban đầu với cookie mới
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Nếu refresh cũng lỗi (hết hạn cả refreshToken), clear auth store
        useAuthStore.getState().clearAuth();
        // Return error, the hook/component will handle the redirect via useAuth or AuthGuard
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const apiClient = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient.get<T>(url, config).then((res) => res.data);
  },

  post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient.post<T>(url, data, config).then((res) => res.data);
  },

  put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient.put<T>(url, data, config).then((res) => res.data);
  },

  patch<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient.patch<T>(url, data, config).then((res) => res.data);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient.delete<T>(url, config).then((res) => res.data);
  },
};
