import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../setup/store';
import type { ScreenPermission } from '../constants/permissions';

interface PrivateRouteProps {
  requiredPermissions: ScreenPermission[];
}

export const PrivateRoute = ({
  requiredPermissions,
  children,
}: PropsWithChildren<PrivateRouteProps>) => {
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
};
