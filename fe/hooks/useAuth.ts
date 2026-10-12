
"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/client/auth.service";
import type {
  AuthState,
  LoginCredentials,
  AuthUser,
} from "@/services/types/auth";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const response = await authService.me();

      if (!response.success || !response.user) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        return null;
      }

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.user;
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      return null;
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      setState((previous) => ({
        ...previous,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await authService.login(credentials);

        if (!response.success || !response.user) {
          throw new Error(response.message || "Đăng nhập thất bại.");
        }

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return response.user;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể đăng nhập. Vui lòng thử lại.";

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return {
    ...state,
    login,
    logout,
    refreshUser,
  };
}