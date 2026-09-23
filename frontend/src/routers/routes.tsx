import type { RouteObject } from 'react-router-dom';
import { routeList } from './routeList';
import { mapAppRoutes } from './routerMapper';
import { userRoutes } from './userRoutes';

// Public/auth routes (login, etc., wrapped in AuthenticateRoutes) are added
// here as feature modules land.
export const routes: RouteObject[] = [...mapAppRoutes(routeList), ...mapAppRoutes(userRoutes)];
