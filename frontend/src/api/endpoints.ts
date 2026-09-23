// The single URL registry — this is the only place a URL string is written.
// Each module adds its own block here, e.g. ENDPOINTS.users = { list: '/users', ... }.
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
  },
  users: {
    list: '/users',
  },
};
