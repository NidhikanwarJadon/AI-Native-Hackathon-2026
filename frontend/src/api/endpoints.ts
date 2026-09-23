export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    // resetPassword: '/auth/reset-password' exists on the backend but has no
    // screen yet — add it here when that screen is built.
  },
  users: {
    list: '/users',
  },
};
