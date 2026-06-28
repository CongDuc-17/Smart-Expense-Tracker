import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
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
  get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosClient.get(url, config).then((res) => res.data);
    // .then(res => res.data) giúp bên ngoài nhận data luôn, đỡ phải .data lần nữa
  },

  post(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return axiosClient.post(url, data, config).then((res) => res.data);
  },

  put(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return axiosClient.put(url, data, config).then((res) => res.data);
  },

  patch(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return axiosClient.patch(url, data, config).then((res) => res.data);
  },

  delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosClient.delete(url, config).then((res) => res.data);
  },
};
