
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
} from "@/services/types/auth";

const AUTH_API_URL = "/api/auth";

async function request<T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${AUTH_API_URL}${endpoint}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Đã xảy ra lỗi. Vui lòng thử lại."
    );
  }

  return data as T;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async me(): Promise<AuthResponse> {
    return request<AuthResponse>("/me", {
      method: "GET",
    });
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    return request("/logout", {
      method: "POST",
    });
  },
};