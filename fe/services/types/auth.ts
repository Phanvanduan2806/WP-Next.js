
export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  authenticated?: boolean;
  expires_in?: number;
  message?: string;
  code?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}