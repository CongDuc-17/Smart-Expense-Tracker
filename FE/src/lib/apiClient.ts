import axios, {
  AxiosError,
  type AxiosRequestConfig,

  type InternalAxiosRequestConfig,
} from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = cookieStore.get("accessToken");

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Biến để tránh việc gọi refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
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
      !originalRequest._retry &&
      !isAuthPage
    ) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh, đẩy request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API lấy token mới - dùng axios gốc để tránh interceptor này lặp vô tận
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // Để gửi kèm HttpOnly Cookie chứa refreshToken
          },
        );

        const { accessToken } = res.data;

        cookieStore.set("accessToken", accessToken);

        processQueue(null, accessToken);

        // Thực hiện lại request ban đầu với token mới
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Nếu refresh cũng lỗi (hết hạn cả refreshToken), cho đăng xuất
        window.location.href = "/login";
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

