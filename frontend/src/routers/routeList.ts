import type { ComponentType, LazyExoticComponent } from 'react';
import type { ScreenPermission } from '../constants/permissions';
import type { SidebarKey } from '../constants/sidebarKeys';

export interface AppRoute {
  path: string;
  component: LazyExoticComponent<ComponentType>;
  pageTitle: string;
  screenPermissions: ScreenPermission[];
  sidebarHighlightKey: SidebarKey;
}

// Each feature module contributes its own route array here, e.g.:
//   export const routeList: AppRoute[] = [...userRoutes, ...ordersRoutes];
export const routeList: AppRoute[] = [];
