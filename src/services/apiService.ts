import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "sonner";
const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      // Clear localStorage tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");

      // Optional: show toast
      toast.error("Session expired. Please log in again.");

      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

export const get = async (url: string, params?: any, config?: any) => {
  try {
    const finalConfig = {
      params,
      ...config,
    };

    const response = await api.get(url, finalConfig);

    if (config?.responseType === "blob") {
      return response;
    }

    return response.data;
  } catch (error: any) {
    throw {
      status: error.response?.status,
      errors: error.response?.data?.errors,
      message: error.response?.data?.errors?.message || "Request failed",
    };
  }
};

export const post = async (url: string, data: any, headers: any) => {
  try {
    const response = await api.post(url, data, headers);
    return response.data;
  } catch (error: any) {
    throw {
      status: error.response?.status,
      errors: error.response?.data?.errors,
      message: error.response?.data?.errors?.message || "Request failed",
    };
  }
};

export const put = async (url: string, data: any, headers: any) => {
  try {
    const response = await api.put(url, data, headers);
    return response.data;
  } catch (error: any) {
    throw {
      status: error.response?.status,
      errors: error.response?.data?.errors,
      message: error.response?.data?.errors?.message || "Request failed",
    };
  }
};

export const patch = async (url: string, data: any) => {
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error: any) {
    throw {
      status: error.response?.status,
      errors: error.response?.data?.errors,
      message: error.response?.data?.errors?.message || "Request failed",
    };
  }
};

export const del = async (url: string) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error: any) {
    throw {
      status: error.response?.status,
      errors: error.response?.data?.errors,
      message: error.response?.data?.errors?.message || "Request failed",
    };
  }
};
