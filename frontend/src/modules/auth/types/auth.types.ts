import type { ScreenPermission } from '../../../constants/permissions';
import type { LoginFormValues } from '../schema/loginFormSchema';
import type { RegisterFormValues } from '../schema/registerFormSchema';
import type { ForgotPasswordFormValues } from '../schema/forgotPasswordFormSchema';

export type LoginRequest = LoginFormValues;
export type RegisterRequest = Omit<RegisterFormValues, 'confirmPassword'>;
export type ForgotPasswordRequest = ForgotPasswordFormValues;

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ASSUMPTION: docs/architecture.md has no API contract yet — login and
// register both return a full session and log the user in immediately.
// Revisit once solution-architect fills in the real contract.
export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  permissions: ScreenPermission[];
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
}
