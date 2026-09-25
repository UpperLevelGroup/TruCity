import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoint";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
}

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    ENDPOINTS.AUTH.REGISTER,
    data
  );

  return response.data;
}

export async function loginUser(
  data: LoginRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    ENDPOINTS.AUTH.LOGIN,
    data
  );

  return response.data;
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<PasswordResetResponse> {
  const response =
    await api.post<PasswordResetResponse>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );

  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<PasswordResetResponse> {
  const response =
    await api.post<PasswordResetResponse>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );

  return response.data;
}