import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../setup/store';

// Wraps public/auth screens (login, etc.) — an already-authenticated user is
// bounced away instead of being shown the login screen again.
export function AuthenticateRoutes({ children }: PropsWithChildren) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  if (accessToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
