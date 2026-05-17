import type { ApiResponseDto, ApiError } from "@/dto/ApiResponseDto";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import qs from "qs";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function handleAxiosError<T>(error: unknown): ApiResponseDto<T> {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return { data: undefined, success: false, code: null, error: { detail: "Unable to reach the server. Please try again later." } };
    }
    const status = error.response.status;
    if (status === 500) {
      return { data: undefined, success: false, code: status, error: { detail: "An internal server error occurred. Please try again later." } };
    }
    if (status === 422) {
      const formatted: string[] = error.response.data.detail.map(
        (err: { loc: string[]; msg: string }) => `Field ${err.loc[1]} invalid. ${err.msg}`
      );
      return { data: undefined, success: false, code: status, error: formatted };
    }
    return { data: undefined, success: false, code: status, error: error.response.data as ApiError };
  }
  return { data: undefined, success: false, code: null, error: { detail: "An unexpected error occurred." } };
}

function wrapResponse<T>(response: AxiosResponse<T>): ApiResponseDto<T> {
  if ([200, 201].includes(response.status)) {
    return { data: response.data, success: true, code: response.status, error: undefined };
  }
  return { data: undefined, success: false, code: response.status, error: { detail: "Unexpected response status." } };
}

const useRootApiService = () => {
  async function Get<T>(path: string, params?: object): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.get<T>(path, {
        params,
        paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
      });
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  async function Post<T, TBody>(path: string, body: TBody, authorization?: string): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.post<T>(path, body, {
        headers: authorization ? { Authorization: authorization } : undefined,
      });
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  async function PostWithoutRefreshToken<T, TBody>(path: string, body: TBody): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.post<T>(path, body);
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  async function Put<T, TBody>(path: string, body: TBody): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.put<T>(path, body);
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  async function Patch<T, TBody>(path: string, body: TBody): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.patch<T>(path, body);
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  async function Delete<T, TBody>(path: string, body?: TBody): Promise<ApiResponseDto<T>> {
    try {
      const response = await axiosInstance.delete<T>(path, { data: body });
      return wrapResponse(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  }

  return { Get, Post, PostWithoutRefreshToken, Put, Patch, Delete };
};

export default useRootApiService;
