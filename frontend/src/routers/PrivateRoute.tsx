import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../setup/store';
import type { ScreenPermission } from '../constants/permissions';

interface PrivateRouteProps {
  requiredPermissions: ScreenPermission[];
}

// Checks authentication first — no access token redirects to login, preserving
// the attempted location — then permissions (empty array means any authenticated
// user), redirecting to the unauthorized screen when a required permission is missing.
export function PrivateRoute({
  requiredPermissions,
  children,
}: PropsWithChildren<PrivateRouteProps>) {
  const location = useLocation();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const userPermissions = useAppSelector((state) => state.auth.permissions);

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasAllPermissions = requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );

  if (requiredPermissions.length > 0 && !hasAllPermissions) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
