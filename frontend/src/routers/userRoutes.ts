import { lazy } from 'react';
import type { AppRoute } from './routeList';
import { ScreenPermission } from '../constants/permissions';
import { SidebarKey } from '../constants/sidebarKeys';
import { enTranslation } from '../translations/enTranslation';

const UserList = lazy(() => import('../modules/user/lists/UserList'));

export const userRoutes: AppRoute[] = [
  {
    path: '/users',
    component: UserList,
    pageTitle: enTranslation.headerTitles.users,
    screenPermissions: [ScreenPermission.VIEW_USERS],
    sidebarHighlightKey: SidebarKey.USERS,
  },
];
