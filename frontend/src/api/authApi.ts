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