import client from '../../../setup/client';
import { ENDPOINTS } from '../../../api/endpoints';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
} from '../types/auth.types';

export const login = (payload: LoginRequest): Promise<LoginResponse> =>
  client.post<LoginResponse>(ENDPOINTS.auth.login, payload).then((response) => response.data);

export const register = (payload: RegisterRequest): Promise<RegisterResponse> =>
  client.post<RegisterResponse>(ENDPOINTS.auth.register, payload).then((response) => response.data);

export const forgotPassword = (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> =>
  client
    .post<ForgotPasswordResponse>(ENDPOINTS.auth.forgotPassword, payload)
    .then((response) => response.data);
