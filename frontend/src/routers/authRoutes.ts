import { createElement, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AuthenticateRoutes } from './AuthenticateRoutes';

// These bypass AppRoute/PrivateRoute: an unauthenticated user hitting a
// PrivateRoute-gated /login would just be redirected back to /login forever.
const LoginForm = lazy(() => import('../modules/auth/forms/LoginForm'));
const RegisterForm = lazy(() => import('../modules/auth/forms/RegisterForm'));
const ForgotPasswordForm = lazy(() => import('../modules/auth/forms/ForgotPasswordForm'));

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: createElement(AuthenticateRoutes, null, createElement(LoginForm)),
  },
  {
    path: '/register',
    element: createElement(AuthenticateRoutes, null, createElement(RegisterForm)),
  },
  {
    path: '/forgot-password',
    element: createElement(AuthenticateRoutes, null, createElement(ForgotPasswordForm)),
  },
];
