import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { AppRoute } from './routeList';
import { PrivateRoute } from './PrivateRoute';

export function mapAppRoutes(appRoutes: AppRoute[]): RouteObject[] {
  return appRoutes.map((route) => ({
    path: route.path,
    element: createElement(
      PrivateRoute,
      { requiredPermissions: route.screenPermissions },
      createElement(route.component),
    ),
  }));
}
