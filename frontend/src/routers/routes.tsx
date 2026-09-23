import { Navigate, type RouteObject } from 'react-router-dom';
import { routeList } from './routeList';
import { mapAppRoutes } from './routerMapper';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';

export const routes: RouteObject[] = [
  // Plain RouteObjects — these bypass PrivateRoute on purpose, see authRoutes.ts.
  ...authRoutes,
  ...mapAppRoutes(routeList),
  ...mapAppRoutes(userRoutes),
  // Landing target. useLogin/useRegister and AuthenticateRoutes all send the
  // user to '/', so it needs somewhere to go; PrivateRoute on /users bounces
  // an unauthenticated visitor back to /login from here.
  { path: '/', element: <Navigate to="/users" replace /> },
];
