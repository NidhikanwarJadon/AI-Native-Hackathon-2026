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

export const routeList: AppRoute[] = [];
