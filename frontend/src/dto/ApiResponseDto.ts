export type ApiError =
  | { detail: string }
  | string[]
  | null
  | undefined;

export interface ApiResponseDto<T> {
  data: T | undefined;
  success: boolean;
  code: number | null;
  error: ApiError;
}

export interface MessageDto {
  message: string;
}

export function getErrorDetail(error: ApiError, fallback = "An error occurred"): string {
  if (!error) return fallback;
  if (Array.isArray(error)) return error[0] ?? fallback;
  return error.detail ?? fallback;
}
