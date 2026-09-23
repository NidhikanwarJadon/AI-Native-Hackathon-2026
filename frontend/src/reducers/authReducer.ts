import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ScreenPermission } from '../constants/permissions';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  permissions: ScreenPermission[];
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  permissions: [],
};

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

interface Session extends RefreshedTokens {
  role: string;
  permissions: ScreenPermission[];
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens: (state, action: PayloadAction<RefreshedTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    sessionStarted: (state, action: PayloadAction<Session>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
    },
    // setup/rootReducer.ts matches every dispatched action's type against
    // this one and, on a match, resets the entire store, not just auth.
    logout: () => initialState,
  },
});

export const { setAuthTokens, sessionStarted, logout } = authSlice.actions;
export default authSlice.reducer;
