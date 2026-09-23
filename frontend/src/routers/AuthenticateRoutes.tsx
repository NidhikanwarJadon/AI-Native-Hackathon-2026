import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../setup/store';

export const AuthenticateRoutes = ({ children }: PropsWithChildren) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  if (accessToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
