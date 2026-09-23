import type { RouteObject } from 'react-router-dom';
import { routeList } from './routeList';
import { mapAppRoutes } from './routerMapper';
import { authRoutes } from './authRoutes';

export const routes: RouteObject[] = [...authRoutes, ...mapAppRoutes(routeList)];
